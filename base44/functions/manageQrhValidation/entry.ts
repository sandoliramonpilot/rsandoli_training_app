import { createClientFromRequest } from "npm:@base44/sdk";
import { isAdminUser, isActiveAccount } from "../../shared/accessSecurity.js";

// Validacao do conteudo do QRH H125 (B2/B3e) pelo Administrador Geral.
// Frontend chama via base44.functions.invoke('manageQrhValidation', {...}).
// O portao isAdminUser exige role "admin" + access_level admin_geral/administrador,
// porem a UI de validacao so e exposta para admin_geral. O backend aceita ambos
// os niveis administrativos, conforme o padrao das demais funcoes do app.

async function logAudit(base44, actor, action, details) {
  try {
    await base44.asServiceRole.entities.AccessAuditLog.create({
      actor_user_id: actor?.id || null,
      actor_name: actor?.full_name || actor?.email || "Sistema",
      action,
      details: details || "",
      created_at: new Date().toISOString(),
    });
  } catch {}
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await isActiveAccount(base44, user))) {
      return Response.json({ error: "Conta nao esta ativa." }, { status: 403 });
    }
    if (!isAdminUser(user)) {
      return Response.json({ error: "Apenas administradores podem gerenciar a validacao do QRH." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // ---------- LIST: validacoes de uma variante ----------
    if (action === "list") {
      const variant = body.variant;
      if (!variant) return Response.json({ error: "Variante nao informada." }, { status: 400 });
      const records = await base44.asServiceRole.entities.QrhValidation
        .filter({ variant })
        .catch(() => []);
      const map = {};
      (records || []).forEach((r) => {
        map[r.procedure_key] = {
          status: r.status,
          reviewed_by: r.reviewed_by || null,
          reviewed_at: r.reviewed_at || null,
          justification: r.justification || null,
        };
      });
      return Response.json({ map });
    }

    // ---------- SET_STATUS: aprovar / reprovar / reabrir um procedimento ----------
    if (action === "set_status") {
      const { variant, procedure_key, group, procedure_name, status, justification } = body;
      if (!variant || !procedure_key) {
        return Response.json({ error: "Variante e chave do procedimento sao obrigatorios." }, { status: 400 });
      }
      if (!["pending", "approved", "rejected"].includes(status)) {
        return Response.json({ error: "Status invalido." }, { status: 400 });
      }
      if ((status === "rejected" || status === "pending") && !String(justification || "").trim()) {
        return Response.json({ error: "Justificativa obrigatoria para reprovar ou reabrir." }, { status: 400 });
      }

      const existing = await base44.asServiceRole.entities.QrhValidation
        .filter({ variant, procedure_key })
        .catch(() => []);

      const now = new Date().toISOString();
      const reviewer = user.full_name || user.email;
      const decision = status === "approved" ? "approved" : status === "rejected" ? "rejected" : "reopened";
      const logEntry = { action: decision, by: reviewer, at: now, justification: justification || "" };

      if (existing && existing.length) {
        const rec = existing[0];
        const log = JSON.parse(rec.approval_log || "[]");
        log.push(logEntry);
        await base44.asServiceRole.entities.QrhValidation.update(rec.id, {
          status,
          reviewed_by: reviewer,
          reviewed_at: now,
          justification: justification || null,
          group: group || rec.group || null,
          procedure_name: procedure_name || rec.procedure_name || null,
          approval_log: JSON.stringify(log),
        });
        await logAudit(base44, user, `QRH H125 ${variant} - validacao: ${decision}`,
          `${procedure_name || procedure_key} -> ${status}. Justificativa: ${justification || "-"}`);
        return Response.json({ ok: true, status, message: `Procedimento ${status === "approved" ? "aprovado" : status === "rejected" ? "reprovado" : "reaberto"}.` });
      }

      // Cria novo registro de validacao
      await base44.asServiceRole.entities.QrhValidation.create({
        variant,
        procedure_key,
        group: group || null,
        procedure_name: procedure_name || null,
        status,
        reviewed_by: reviewer,
        reviewed_at: now,
        justification: justification || null,
        approval_log: JSON.stringify([logEntry]),
      });
      await logAudit(base44, user, `QRH H125 ${variant} - validacao: ${decision}`,
        `${procedure_name || procedure_key} -> ${status}. Justificativa: ${justification || "-"}`);
      return Response.json({ ok: true, status, message: `Procedimento ${status === "approved" ? "aprovado" : status === "rejected" ? "reprovado" : "reaberto"}.` });
    }

    // ---------- APPROVE_ALL: aprovar todos os pendentes de uma variante ----------
    if (action === "approve_all") {
      const variant = body.variant;
      if (!variant) return Response.json({ error: "Variante nao informada." }, { status: 400 });
      const records = await base44.asServiceRole.entities.QrhValidation
        .filter({ variant, status: "pending" })
        .catch(() => []);
      const now = new Date().toISOString();
      const reviewer = user.full_name || user.email;
      let count = 0;
      for (const rec of records) {
        const log = JSON.parse(rec.approval_log || "[]");
        log.push({ action: "approved", by: reviewer, at: now, bulk: true });
        await base44.asServiceRole.entities.QrhValidation.update(rec.id, {
          status: "approved",
          reviewed_by: reviewer,
          reviewed_at: now,
          approval_log: JSON.stringify(log),
        }).catch(() => {});
        count++;
      }
      await logAudit(base44, user, `QRH H125 ${variant} - aprovacao em lote`, `Total: ${count}`);
      return Response.json({ ok: true, count, message: `${count} procedimento(s) aprovado(s).` });
    }

    return Response.json({ error: "Acao invalida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}