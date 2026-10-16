import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { isActiveAccount } from "../../shared/accessSecurity.js";

const ACCESS_LEVELS = ["admin_geral", "administrador", "gestor_supervisor", "operacional", "consulta"];

function levelOf(u) {
  if (u?.access_level && ACCESS_LEVELS.includes(u.access_level)) return u.access_level;
  return u?.role === "admin" ? "administrador" : "operacional";
}

// Campos editáveis por entidade (para ação update_one)
const EDITABLE_FIELDS = {
  training_doc: ["title", "chapter", "description", "file_type"],
  library_doc: [
    "title", "category", "description", "keyword", "tags",
    "doc_number", "revision_number", "revision_date", "publish_date",
    "validity_date", "status",
  ],
};

// Tipos de conteúdo da Academy com aprovação
const ACADEMY_CONTENT = [
  {
    key: "training_doc",
    entity: "TrainingDocument",
    typeLabel: "Documento de Treinamento",
    locationField: "chapter",
    locationLabel: "Capítulo",
  },
  {
    key: "library_doc",
    entity: "LibraryDocument",
    typeLabel: "Documento da Biblioteca",
    locationField: "category",
    locationLabel: "Categoria",
  },
];

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
    if (!(await isActiveAccount(base44, user))) return Response.json({ error: "Conta não está ativa." }, { status: 403 });

    const actorLevel = levelOf(user);
    if (actorLevel !== "admin_geral" && actorLevel !== "administrador") {
      return Response.json({ error: "Apenas administradores podem gerenciar conteúdo da Academy." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // ---------- LIST PENDING ----------
    if (action === "list") {
      const results = await Promise.all(
        ACADEMY_CONTENT.map(async (ct) => {
          const records = await base44.asServiceRole.entities[ct.entity]
            .filter({ approval_status: "pending_review" })
            .catch(() => []);
          return records.map((r) => ({
            id: r.id,
            entity_key: ct.key,
            entity_label: ct.typeLabel,
            title: r.title || "Sem título",
            location: r[ct.locationField] || null,
            location_label: ct.locationLabel,
            file_uri: r.file_uri || null,
            file_name: r.file_name || null,
            file_type: r.file_type || null,
            uploaded_by: r.uploaded_by || null,
            created_date: r.created_date || null,
          }));
        })
      );
      const items = results.flat().sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
      return Response.json({ items, total: items.length });
    }

    // ---------- GET ONE ----------
    if (action === "get_one") {
      const ct = ACADEMY_CONTENT.find((c) => c.key === body.entity_key);
      if (!ct) return Response.json({ error: "Tipo de conteúdo inválido." }, { status: 400 });
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      const record = await base44.asServiceRole.entities[ct.entity].get(body.id).catch(() => null);
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      return Response.json({ record, entity_key: ct.key, entity_label: ct.typeLabel, editable_fields: EDITABLE_FIELDS[ct.key] || [] });
    }

    // ---------- UPDATE ONE ----------
    if (action === "update_one") {
      const ct = ACADEMY_CONTENT.find((c) => c.key === body.entity_key);
      if (!ct) return Response.json({ error: "Tipo de conteúdo inválido." }, { status: 400 });
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      const record = await base44.asServiceRole.entities[ct.entity].get(body.id).catch(() => null);
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      const patch = {};
      const allowed = EDITABLE_FIELDS[ct.key] || [];
      for (const f of allowed) {
        if (body.patch && body.patch[f] !== undefined) {
          patch[f] = body.patch[f] === "" ? null : body.patch[f];
        }
      }
      if (Object.keys(patch).length === 0) return Response.json({ error: "Nada para alterar." }, { status: 400 });
      const log = JSON.parse(record.approval_log || "[]");
      log.push({ action: "updated", by: user.full_name || user.email, at: new Date().toISOString(), fields: Object.keys(patch) });
      patch.approval_log = JSON.stringify(log);
      await base44.asServiceRole.entities[ct.entity].update(body.id, patch);
      await logAudit(base44, user, `Conteúdo Academy — alteração`, `${ct.typeLabel}: ${record.title || ""} — Campos: ${Object.keys(patch).filter((f) => f !== "approval_log").join(", ")}`);
      return Response.json({ ok: true, message: "Alterações salvas. Item permanece pendente para aprovação." });
    }

    // ---------- APPROVE ONE ----------
    if (action === "approve_one") {
      const ct = ACADEMY_CONTENT.find((c) => c.key === body.entity_key);
      if (!ct) return Response.json({ error: "Tipo de conteúdo inválido." }, { status: 400 });
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      const record = await base44.asServiceRole.entities[ct.entity].get(body.id).catch(() => null);
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      const log = JSON.parse(record.approval_log || "[]");
      log.push({ action: "approved", by: user.full_name || user.email, at: new Date().toISOString() });
      await base44.asServiceRole.entities[ct.entity].update(body.id, {
        approval_status: "approved",
        reviewed_by: user.full_name || user.email,
        reviewed_at: new Date().toISOString(),
        review_decision: "approved",
        approval_log: JSON.stringify(log),
      });
      await logAudit(base44, user, `Conteúdo Academy — aprovação`, `${ct.typeLabel}: ${record.title || ""}`);
      return Response.json({ ok: true, message: "Conteúdo aprovado." });
    }

    // ---------- APPROVE WITH NOTES ----------
    if (action === "approve_with_notes") {
      const ct = ACADEMY_CONTENT.find((c) => c.key === body.entity_key);
      if (!ct) return Response.json({ error: "Tipo de conteúdo inválido." }, { status: 400 });
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      if (!body.notes || !String(body.notes).trim()) {
        return Response.json({ error: "Informe as ressalvas da aprovação." }, { status: 400 });
      }
      const record = await base44.asServiceRole.entities[ct.entity].get(body.id).catch(() => null);
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      const log = JSON.parse(record.approval_log || "[]");
      log.push({ action: "approved_with_notes", by: user.full_name || user.email, at: new Date().toISOString(), notes: body.notes });
      await base44.asServiceRole.entities[ct.entity].update(body.id, {
        approval_status: "approved_with_notes",
        reviewed_by: user.full_name || user.email,
        reviewed_at: new Date().toISOString(),
        review_decision: "approved_with_notes",
        review_justification: String(body.notes).trim(),
        approval_log: JSON.stringify(log),
      });
      await logAudit(base44, user, `Conteúdo Academy — aprovação com ressalvas`, `${ct.typeLabel}: ${record.title || ""} — Ressalvas: ${body.notes}`);
      return Response.json({ ok: true, message: "Conteúdo aprovado com ressalvas." });
    }

    // ---------- REJECT ONE ----------
    if (action === "reject_one") {
      const ct = ACADEMY_CONTENT.find((c) => c.key === body.entity_key);
      if (!ct) return Response.json({ error: "Tipo de conteúdo inválido." }, { status: 400 });
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      if (!body.reason || !String(body.reason).trim()) {
        return Response.json({ error: "Informe o motivo da rejeição." }, { status: 400 });
      }
      const record = await base44.asServiceRole.entities[ct.entity].get(body.id).catch(() => null);
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      const log = JSON.parse(record.approval_log || "[]");
      log.push({ action: "rejected", by: user.full_name || user.email, at: new Date().toISOString(), reason: body.reason });
      await base44.asServiceRole.entities[ct.entity].update(body.id, {
        approval_status: "rejected",
        reviewed_by: user.full_name || user.email,
        reviewed_at: new Date().toISOString(),
        review_decision: "rejected",
        review_justification: String(body.reason).trim(),
        approval_log: JSON.stringify(log),
      });
      await logAudit(base44, user, `Conteúdo Academy — rejeição`, `${ct.typeLabel}: ${record.title || ""} — Motivo: ${body.reason}`);
      return Response.json({ ok: true, message: "Conteúdo rejeitado." });
    }

    // ---------- DELETE ONE ----------
    if (action === "delete_one") {
      const ct = ACADEMY_CONTENT.find((c) => c.key === body.entity_key);
      if (!ct) return Response.json({ error: "Tipo de conteúdo inválido." }, { status: 400 });
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      const record = await base44.asServiceRole.entities[ct.entity].get(body.id).catch(() => null);
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      await base44.asServiceRole.entities[ct.entity].delete(body.id);
      await logAudit(base44, user, `Conteúdo Academy — exclusão`, `${ct.typeLabel}: ${record.title || ""} — Motivo: ${body.reason || "Não informado"}`);
      return Response.json({ ok: true, message: "Conteúdo excluído." });
    }

    // ---------- APPROVE ALL ----------
    if (action === "approve_all") {
      const counts = {};
      let totalApproved = 0;
      for (const ct of ACADEMY_CONTENT) {
        const records = await base44.asServiceRole.entities[ct.entity]
          .filter({ approval_status: "pending_review" })
          .catch(() => []);
        counts[ct.key] = 0;
        for (const record of records) {
          const log = JSON.parse(record.approval_log || "[]");
          log.push({ action: "approved", by: user.full_name || user.email, at: new Date().toISOString(), bulk: true });
          await base44.asServiceRole.entities[ct.entity].update(record.id, {
            approval_status: "approved",
            reviewed_by: user.full_name || user.email,
            reviewed_at: new Date().toISOString(),
            review_decision: "approved",
            approval_log: JSON.stringify(log),
          }).catch(() => {});
          counts[ct.key]++;
          totalApproved++;
        }
      }
      await logAudit(base44, user, "Conteúdo Academy — aprovação em lote", `Total aprovado: ${totalApproved}. Detalhes: ${JSON.stringify(counts)}`);
      return Response.json({ ok: true, total: totalApproved, counts, message: `${totalApproved} conteúdo(s) aprovado(s).` });
    }

    return Response.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}