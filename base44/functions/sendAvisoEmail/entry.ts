import { createClientFromRequest } from "npm:@base44/sdk";
import {
  DENY_MESSAGE,
  isActiveAccount,
  isAdminUser,
  parseProfiles,
} from "../../shared/accessSecurity.js";

// Envio opcional, por ação explícita do administrador, de um aviso publicado
// aos pilotos destinatários que possuem conta de acesso no app.

function parseIds(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  try {
    const arr = JSON.parse(value);
    return Array.isArray(arr) ? arr.filter(Boolean).map(String) : [];
  } catch {
    return [];
  }
}

function fmtData(value) {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR");
}

function primeiroNome(nome) {
  return String(nome || "").trim().split(" ")[0] || "Piloto";
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: DENY_MESSAGE }, { status: 401 });
    if (!(await isActiveAccount(base44, user))) {
      return Response.json({ error: DENY_MESSAGE }, { status: 403 });
    }
    if (!isAdminUser(user)) return Response.json({ error: DENY_MESSAGE }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const avisoId = body.aviso_id;
    if (!avisoId) return Response.json({ error: "Aviso nao informado." }, { status: 400 });

    const aviso = await base44.asServiceRole.entities.Aviso.get(String(avisoId)).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!aviso) return Response.json({ error: "Aviso nao encontrado." }, { status: 404 });

    const destinatarios = parseIds(aviso.pilotos_destinatarios);
    const perfis = parseProfiles(aviso.aircraft_profiles);

    let pilots = [];
    if (destinatarios.length) {
      const found = await base44.asServiceRole.entities.Pilot
        .filter({ id: { $in: destinatarios } })
        .catch(() => []);
      const byId = new Map((found || []).map((p) => [p.id, p]));
      pilots = destinatarios.map((id) => byId.get(id)).filter(Boolean);
    } else if (perfis.length) {
      pilots = await base44.asServiceRole.entities.Pilot
        .filter({ aircraftProfile: { $in: perfis } })
        .catch(() => []);
    } else {
      pilots = await base44.asServiceRole.entities.Pilot.list().catch(() => []);
    }

    const users = await base44.asServiceRole.entities.User.list().catch(() => []);
    const usersById = new Map((users || []).map((u) => [u.id, u]));
    const usersByEmail = new Map(
      (users || []).filter((u) => u.email).map((u) => [String(u.email).toLowerCase(), u])
    );

    const contaDoPiloto = (pilot) => {
      if (pilot.user_id && usersById.has(pilot.user_id)) return usersById.get(pilot.user_id);
      const email = String(pilot.email_login || pilot.email || "").toLowerCase();
      return email ? usersByEmail.get(email) || null : null;
    };

    const semConta = [];
    const contas = [];
    const vistos = new Set();

    (pilots || []).forEach((pilot) => {
      const conta = contaDoPiloto(pilot);
      if (!conta) {
        semConta.push({ nome: pilot.full_name || "", email: pilot.email || pilot.email_login || "" });
        return;
      }
      if (vistos.has(conta.id)) return;
      vistos.add(conta.id);
      contas.push({ conta, pilot });
    });

    if (!pilots.length || !contas.length) {
      return Response.json({
        ok: false,
        sent: 0,
        failed: [],
        sem_conta: semConta,
        message: pilots.length
          ? "Nenhum piloto destinatario possui conta de acesso para receber e-mail."
          : "Nenhum piloto destinatario encontrado.",
      });
    }

    const baseVars = {
      titulo: aviso.titulo || "",
      texto: aviso.texto || "",
      autor: aviso.autor ? `Publicado por ${aviso.autor}` : "",
      data: fmtData(aviso.data_publicacao),
    };

    const failed = [];
    let sent = 0;

    const chunks = [];
    for (let i = 0; i < contas.length; i += 6) chunks.push(contas.slice(i, i + 6));

    for (const chunk of chunks) {
      const results = await Promise.allSettled(
        chunk.map(({ conta, pilot }) =>
          base44.asServiceRole.integrations.Core.SendEmail({
            to: conta.email,
            template_name: "AvisoPiloto",
            category: "transactional",
            variables: {
              ...baseVars,
              first_name: primeiroNome(pilot.war_name || conta.full_name || pilot.full_name),
            },
          })
        )
      );

      results.forEach((r, i) => {
        const { conta } = chunk[i];
        if (r.status === "fulfilled") {
          const res = r.value || {};
          if (res.success === false) {
            failed.push({
              nome: conta.full_name || "",
              email: conta.email || "",
              motivo: res.reason || res.message || "nao entregue",
            });
          } else {
            sent++;
          }
        } else {
          failed.push({
            nome: conta.full_name || "",
            email: conta.email || "",
            motivo: r.reason?.message || "falha no envio",
          });
        }
      });
    }

    if (sent > 0) {
      const now = new Date().toISOString();
      await base44.asServiceRole.entities.Aviso
        .update(aviso.id, { email_enviado_at: now })
        .catch(() => {});
      await base44.asServiceRole.entities.AccessAuditLog
        .create({
          actor_user_id: user.id,
          actor_name: user.full_name || user.email || "Sistema",
          action: "Aviso enviado por e-mail",
          details: `${aviso.titulo || "Aviso"}: ${sent} destinatario(s).`,
          created_at: now,
        })
        .catch(() => {});
    }

    return Response.json({
      ok: true,
      sent,
      failed,
      sem_conta: semConta,
      total: contas.length,
      email_enviado_at: sent > 0 ? new Date().toISOString() : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}