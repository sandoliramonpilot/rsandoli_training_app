import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { DENY_MESSAGE, getUserProfiles, hasProfileAccess, inProfileScope, isActiveAccount, isAdminUser } from "../../shared/accessSecurity.js";

// Função backend autoritativa para PilotLicense. Toda criação/edição/exclusão/
// conferência passa por aqui: o cliente nunca grava approval_status, campos de
// revisão (reviewed_by/reviewed_at/review_decision/review_justification/approval_log)
// nem situation="valid" — esses só resultam de ação server-side. O ator é derivado
// de base44.auth.me() e a trilha de auditoria é gravada via asServiceRole.

const ACCESS_LEVEL_VALUES = ["admin_geral", "administrador", "gestor_supervisor", "operacional", "consulta"];

function levelOf(u) {
  if (u?.access_level && ACCESS_LEVEL_VALUES.includes(u.access_level)) return u.access_level;
  return u?.role === "admin" ? "administrador" : "operacional";
}

// Campos editáveis pelo cliente na criação/edição. Campos de revisão ficam de fora.
const WRITABLE_FIELDS = [
  "aircraftProfile", "license_type", "license_type_label", "other_license_name",
  "license_number", "category", "description", "issue_date", "grant_date",
  "revalidation_date", "expiry_date", "situation", "authority", "notes",
  "validity_source", "validity_rule", "validity_rule_source", "validity_base_date",
  "document_uri", "document_name",
];
const REVIEW_FIELDS = [
  "approval_status", "reviewed_by", "reviewed_at", "review_decision",
  "review_justification", "approval_log",
];

async function logAudit(base44, actor, pilot, action, details) {
  try {
    await base44.asServiceRole.entities.AccessAuditLog.create({
      actor_user_id: actor?.id || null,
      actor_name: actor?.full_name || actor?.email || "Sistema",
      target_name: pilot?.full_name || pilot?.pilot_name || null,
      action,
      details: details || "",
      created_at: new Date().toISOString(),
    });
  } catch {}
}

function isSelfOf(user, pilot) {
  if (!user || !pilot) return false;
  if (pilot.user_id && user.id === pilot.user_id) return true;
  if (pilot.email && user.email && String(pilot.email).toLowerCase() === String(user.email).toLowerCase()) return true;
  return false;
}

function pick(obj, fields) {
  const out = {};
  for (const f of fields) {
    if (obj[f] !== undefined && obj[f] !== null) out[f] = obj[f];
  }
  return out;
}

// situation "valid"/"near_expiry" só resulta de cálculo/conferência server-side;
// usuário comum não pode nascer a licença como "Válida".
function sanitizeSituation(situation, isAdmin) {
  if (!situation) return "pending";
  if (!isAdmin && (situation === "valid" || situation === "near_expiry")) return "pending";
  return situation;
}

async function getPilot(base44, id) {
  if (!id) return null;
  return base44.asServiceRole.entities.Pilot.get(id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: DENY_MESSAGE }, { status: 401 });
    if (!(await isActiveAccount(base44, user))) return Response.json({ error: DENY_MESSAGE }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    // Portão autoritativo: isAdminUser exige User.role === "admin" (papel de plataforma,
    // não gravável pelo próprio usuário via updateMe) somado a um nível administrativo.
    // Os campos User.access_level e User.custom_permissions são bloqueados por RLS em
    // nível de campo (collaborator_role: editor), então o valor armazenado é a fonte
    // autoritativa do nível e das permissões — não podem ser forjados via updateMe.
    // levelOf só vale como camada adicional, depois de isAdmin confirmar o papel.
    const isAdmin = isAdminUser(user);
    const isGeral = isAdmin && levelOf(user) === "admin_geral";
    // Perfis de aeronave autorizados para o chamador (null = admin_geral, sem restrição).
    // Usado para restringir administradores aos perfis que gerenciam.
    const userProfiles = await getUserProfiles(base44, user);

    const pilot = await getPilot(base44, body.pilot_id);
    const self = isSelfOf(user, pilot);

    // ---------- LIST ----------
    if (action === "list") {
      if (!pilot) return Response.json({ error: "Piloto não informado." }, { status: 400 });
      if (!self && !isAdmin) {
        return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      }
      const filter = { pilot_id: body.pilot_id };
      if (body.aircraftProfile) {
        if (!self && !hasProfileAccess(userProfiles, body.aircraftProfile)) {
          return Response.json({ error: DENY_MESSAGE }, { status: 403 });
        }
        filter.aircraftProfile = body.aircraftProfile;
      }
      const records = await base44.asServiceRole.entities.PilotLicense.filter(filter).catch(() => []);
      // Administrador não-geral só vê licenças dos perfis que gerencia.
      const scoped = (records || []).filter((r) => self || inProfileScope(userProfiles, r));
      return Response.json({ items: scoped });
    }

    // ---------- CREATE ----------
    if (action === "create") {
      if (!pilot) return Response.json({ error: "Piloto não informado." }, { status: 400 });
      if (!self && !isAdmin) {
        return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      }
      const payload = pick(body.payload || {}, WRITABLE_FIELDS);
      // Administrador só cria licenças para perfis de aeronave que gerencia.
      if (!self && payload.aircraftProfile && !hasProfileAccess(userProfiles, payload.aircraftProfile)) {
        return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      }
      payload.pilot_id = pilot.id;
      payload.pilot_name = pilot.full_name || null;
      payload.situation = sanitizeSituation(payload.situation, isAdmin);
      // Força rascunho e limpa campos de revisão — nunca confiados ao cliente.
      payload.approval_status = "draft";
      for (const f of REVIEW_FIELDS) delete payload[f];
      const created = await base44.asServiceRole.entities.PilotLicense.create(payload);
      await logAudit(base44, user, pilot, "Licença — criação", `Nova licença criada: ${payload.license_type_label || payload.license_type || ""}`);
      return Response.json({ ok: true, id: created.id });
    }

    // ---------- UPDATE ----------
    if (action === "update") {
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      const record = await base44.asServiceRole.entities.PilotLicense.get(body.id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      const recPilot = await getPilot(base44, record.pilot_id);
      const recSelf = isSelfOf(user, recPilot) || self;
      if (!recSelf && !isAdmin) {
        return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      }
      // Administrador só edita licenças dos perfis que gerencia.
      if (!recSelf && !inProfileScope(userProfiles, record)) {
        return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      }
      // Piloto só edita rascunhos; editar reverte para "draft" e exige nova conferência
      // (igual ao approveTechnicalValidations). Administradores mantêm o estado atual.
      if (!isAdmin) {
        if (record.approval_status !== "draft") {
          return Response.json({ error: "Licenças já conferidas não podem ser editadas pelo piloto. Solicite reabertura ao administrador." }, { status: 403 });
        }
      }
      const patch = pick(body.patch || {}, WRITABLE_FIELDS);
      // Administrador não pode mover a licença para um perfil que não gerencia.
      if (!recSelf && "aircraftProfile" in patch && !hasProfileAccess(userProfiles, patch.aircraftProfile)) {
        return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      }
      if ("situation" in patch) patch.situation = sanitizeSituation(patch.situation, isAdmin);
      // Usuário comum nunca toca nos campos de revisão via esta ação.
      for (const f of REVIEW_FIELDS) delete patch[f];
      if (Object.keys(patch).length === 0) return Response.json({ error: "Nada para atualizar." }, { status: 400 });
      if (!isAdmin) {
        patch.approval_status = "draft";
        patch.reviewed_by = null;
        patch.reviewed_at = null;
        patch.review_decision = null;
        patch.review_justification = null;
      }
      await base44.asServiceRole.entities.PilotLicense.update(body.id, patch);
      await logAudit(base44, user, recPilot || pilot, "Licença — edição", `Licença editada: ${record.license_type_label || record.license_type || ""}`);
      return Response.json({ ok: true });
    }

    // ---------- DELETE ----------
    if (action === "delete") {
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      const record = await base44.asServiceRole.entities.PilotLicense.get(body.id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      if (!isGeral) return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      if (!inProfileScope(userProfiles, record)) return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      await base44.asServiceRole.entities.PilotLicense.delete(body.id);
      const recPilot = await getPilot(base44, record.pilot_id);
      await logAudit(base44, user, recPilot, "Licença — exclusão", `Licença excluída: ${record.license_type_label || record.license_type || ""}`);
      return Response.json({ ok: true });
    }

    // ---------- SEND FOR REVIEW ----------
    if (action === "send_for_review") {
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      const record = await base44.asServiceRole.entities.PilotLicense.get(body.id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      const recPilot = await getPilot(base44, record.pilot_id);
      const recSelf = isSelfOf(user, recPilot) || self;
      if (!recSelf && !isAdmin) {
        return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      }
      if (!recSelf && !inProfileScope(userProfiles, record)) {
        return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      }
      if (record.approval_status !== "draft") {
        return Response.json({ error: "Somente rascunhos podem ser enviados para conferência." }, { status: 400 });
      }
      const log = JSON.parse(record.approval_log || "[]");
      log.push({ action: "sent_review", by: user.full_name || user.email, at: new Date().toISOString() });
      await base44.asServiceRole.entities.PilotLicense.update(body.id, {
        approval_status: "pending_review",
        approval_log: JSON.stringify(log),
      });
      await logAudit(base44, user, recPilot, "Licença — envio para conferência", `Licença enviada: ${record.license_type_label || record.license_type || ""}`);
      return Response.json({ ok: true });
    }

    // ---------- APPROVE ----------
    if (action === "approve") {
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      if (!isAdmin) return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      const record = await base44.asServiceRole.entities.PilotLicense.get(body.id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      if (!inProfileScope(userProfiles, record)) return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      if (record.approval_status !== "pending_review") {
        return Response.json({ error: "Registro não está aguardando conferência." }, { status: 400 });
      }
      const log = JSON.parse(record.approval_log || "[]");
      log.push({ action: "approved", by: user.full_name || user.email, at: new Date().toISOString() });
      await base44.asServiceRole.entities.PilotLicense.update(body.id, {
        approval_status: "approved",
        reviewed_by: user.full_name || user.email,
        reviewed_at: new Date().toISOString(),
        review_decision: "approved",
        approval_log: JSON.stringify(log),
      });
      const recPilot = await getPilot(base44, record.pilot_id);
      await logAudit(base44, user, recPilot, "Licença — aprovação", `Licença aprovada: ${record.license_type_label || record.license_type || ""}`);
      return Response.json({ ok: true });
    }

    // ---------- REJECT ----------
    if (action === "reject") {
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      if (!isAdmin) return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      const record = await base44.asServiceRole.entities.PilotLicense.get(body.id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      if (!inProfileScope(userProfiles, record)) return Response.json({ error: DENY_MESSAGE }, { status: 403 });
      if (record.approval_status !== "pending_review") {
        return Response.json({ error: "Registro não está aguardando conferência." }, { status: 400 });
      }
      const log = JSON.parse(record.approval_log || "[]");
      log.push({ action: "rejected", by: user.full_name || user.email, at: new Date().toISOString(), reason: body.reason || null });
      await base44.asServiceRole.entities.PilotLicense.update(body.id, {
        approval_status: "rejected",
        reviewed_by: user.full_name || user.email,
        reviewed_at: new Date().toISOString(),
        review_decision: "rejected",
        review_justification: body.reason || "",
        approval_log: JSON.stringify(log),
      });
      const recPilot = await getPilot(base44, record.pilot_id);
      await logAudit(base44, user, recPilot, "Licença — rejeição", `Licença rejeitada: ${record.license_type_label || record.license_type || ""}${body.reason ? ` — ${body.reason}` : ""}`);
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}