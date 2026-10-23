import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { isAdminUser, isActiveAccount } from "../../shared/accessSecurity.js";

// Campos editáveis por entidade (para ação update_one)
const EDITABLE_FIELDS = {
  license: ["license_type", "license_type_label", "other_license_name", "category", "description", "issue_date", "grant_date", "revalidation_date", "expiry_date", "situation", "authority", "notes", "license_number", "validity_source", "validity_rule"],
  qualification: ["type", "type_label", "number", "issue_date", "expiry_date", "situation", "authority", "notes"],
  operational_auth: ["type", "type_label", "number", "issue_date", "expiry_date", "situation", "scope", "authority", "notes"],
  habilitacao: ["type", "type_label", "number", "issue_date", "expiry_date", "situation", "authority", "notes"],
  endorsement: ["aircraft_model", "aircraft_model_label", "function", "issue_date", "expiry_date", "situation", "notes"],
};

// Entidades de validação técnica com seus campos de rótulo
const TECH_ENTITIES = [
  { key: "license", entity: "PilotLicense", labelField: "license_type_label", fallbackField: "license_type", typeLabel: "Licença" },
  { key: "qualification", entity: "PilotQualification", labelField: "type_label", fallbackField: "type", typeLabel: "Qualificação" },
  { key: "operational_auth", entity: "PilotOperationalAuth", labelField: "type_label", fallbackField: "type", typeLabel: "Autorização Operacional" },
  { key: "habilitacao", entity: "PilotHabilitacao", labelField: "type_label", fallbackField: "type", typeLabel: "Habilitação" },
  { key: "endorsement", entity: "PilotEndorsement", labelField: "aircraft_model_label", fallbackField: "aircraft_model", typeLabel: "Endosso" },
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

    // Somente administradores de fato: o papel de plataforma (role) é exigido junto
    // com o nível, porque access_level é gravável pelo próprio usuário.
    if (!isAdminUser(user)) {
      return Response.json({ error: "Apenas administradores podem gerenciar validações técnicas." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // ---------- LIST PENDING TECHNICAL VALIDATIONS ----------
    if (action === "list") {
      const results = await Promise.all(
        TECH_ENTITIES.map(async (te) => {
          const records = await base44.asServiceRole.entities[te.entity]
            .filter({ approval_status: "pending_review" })
            .catch(() => []);
          return records.map((r) => ({
            id: r.id,
            entity_key: te.key,
            entity_label: te.typeLabel,
            pilot_id: r.pilot_id || null,
            pilot_name: r.pilot_name || null,
            label: r[te.labelField] || r[te.fallbackField] || te.typeLabel,
            number: r.number || r.license_number || null,
            issue_date: r.issue_date || null,
            expiry_date: r.expiry_date || null,
            document_uri: r.document_uri || null,
            document_name: r.document_name || null,
            created_date: r.created_date || null,
          }));
        })
      );
      const items = results.flat().sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
      return Response.json({ items, total: items.length });
    }

    // ---------- APPROVE ONE ----------
    if (action === "approve_one") {
      const te = TECH_ENTITIES.find((t) => t.key === body.entity_key);
      if (!te) return Response.json({ error: "Tipo de validação inválido." }, { status: 400 });
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      const record = await base44.asServiceRole.entities[te.entity].get(body.id).catch(() => null);
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      if (record.approval_status !== "pending_review") {
        return Response.json({ error: "Registro não está aguardando conferência." }, { status: 400 });
      }
      const log = JSON.parse(record.approval_log || "[]");
      log.push({ action: "approved", by: user.full_name || user.email, at: new Date().toISOString() });
      await base44.asServiceRole.entities[te.entity].update(body.id, {
        approval_status: "approved",
        reviewed_by: user.full_name || user.email,
        reviewed_at: new Date().toISOString(),
        review_decision: "approved",
        approval_log: JSON.stringify(log),
      });
      await logAudit(base44, user, `Validação técnica — aprovação`, `${te.typeLabel}: ${record[te.labelField] || record[te.fallbackField] || ""} (Piloto: ${record.pilot_name || record.pilot_id || "—"})`);
      return Response.json({ ok: true, message: "Validação aprovada." });
    }

    // ---------- GET ONE (full record for review) ----------
    if (action === "get_one") {
      const te = TECH_ENTITIES.find((t) => t.key === body.entity_key);
      if (!te) return Response.json({ error: "Tipo de validação inválido." }, { status: 400 });
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      const record = await base44.asServiceRole.entities[te.entity].get(body.id).catch(() => null);
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      return Response.json({ record, entity_key: te.key, entity_label: te.typeLabel });
    }

    // ---------- UPDATE ONE (ALTERAR — save corrections, keep pending) ----------
    if (action === "update_one") {
      const te = TECH_ENTITIES.find((t) => t.key === body.entity_key);
      if (!te) return Response.json({ error: "Tipo de validação inválido." }, { status: 400 });
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      const record = await base44.asServiceRole.entities[te.entity].get(body.id).catch(() => null);
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      if (record.approval_status !== "pending_review") {
        return Response.json({ error: "Registro não está aguardando conferência." }, { status: 400 });
      }
      const patch = {};
      const allowed = EDITABLE_FIELDS[te.key] || [];
      for (const f of allowed) {
        if (body.patch && body.patch[f] !== undefined) {
          patch[f] = body.patch[f] === "" ? null : body.patch[f];
        }
      }
      if (Object.keys(patch).length === 0) return Response.json({ error: "Nada para alterar." }, { status: 400 });
      const log = JSON.parse(record.approval_log || "[]");
      log.push({ action: "updated", by: user.full_name || user.email, at: new Date().toISOString(), fields: Object.keys(patch) });
      patch.approval_log = JSON.stringify(log);
      await base44.asServiceRole.entities[te.entity].update(body.id, patch);
      await logAudit(base44, user, `Validação técnica — alteração`, `${te.typeLabel}: ${record[te.labelField] || record[te.fallbackField] || ""} (Piloto: ${record.pilot_name || record.pilot_id || "—"}) — Campos: ${Object.keys(patch).filter((f) => f !== "approval_log").join(", ")}`);
      return Response.json({ ok: true, message: "Alterações salvas. Registro permanece pendente para conferência." });
    }

    // ---------- DELETE ONE (EXCLUIR) ----------
    if (action === "delete_one") {
      const te = TECH_ENTITIES.find((t) => t.key === body.entity_key);
      if (!te) return Response.json({ error: "Tipo de validação inválido." }, { status: 400 });
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      const record = await base44.asServiceRole.entities[te.entity].get(body.id).catch(() => null);
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      await base44.asServiceRole.entities[te.entity].delete(body.id);
      await logAudit(base44, user, `Validação técnica — exclusão`, `${te.typeLabel}: ${record[te.labelField] || record[te.fallbackField] || ""} (Piloto: ${record.pilot_name || record.pilot_id || "—"}) — Motivo: ${body.reason || "Não informado"}`);
      return Response.json({ ok: true, message: "Registro excluído." });
    }

    // ---------- APPROVE WITH NOTES (APROVAR COM RESSALVAS) ----------
    if (action === "approve_with_notes") {
      const te = TECH_ENTITIES.find((t) => t.key === body.entity_key);
      if (!te) return Response.json({ error: "Tipo de validação inválido." }, { status: 400 });
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      if (!body.notes || !String(body.notes).trim()) {
        return Response.json({ error: "Informe as ressalvas da aprovação." }, { status: 400 });
      }
      const record = await base44.asServiceRole.entities[te.entity].get(body.id).catch(() => null);
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      if (record.approval_status !== "pending_review") {
        return Response.json({ error: "Registro não está aguardando conferência." }, { status: 400 });
      }
      const log = JSON.parse(record.approval_log || "[]");
      log.push({ action: "approved_with_notes", by: user.full_name || user.email, at: new Date().toISOString(), notes: body.notes });
      await base44.asServiceRole.entities[te.entity].update(body.id, {
        approval_status: "approved",
        reviewed_by: user.full_name || user.email,
        reviewed_at: new Date().toISOString(),
        review_decision: "approved_with_notes",
        review_justification: String(body.notes).trim(),
        approval_log: JSON.stringify(log),
      });
      await logAudit(base44, user, `Validação técnica — aprovação com ressalvas`, `${te.typeLabel}: ${record[te.labelField] || record[te.fallbackField] || ""} (Piloto: ${record.pilot_name || record.pilot_id || "—"}) — Ressalvas: ${body.notes}`);
      return Response.json({ ok: true, message: "Validação aprovada com ressalvas." });
    }

    // ---------- APPROVE ALL ----------
    if (action === "approve_all") {
      const counts = {};
      let totalApproved = 0;
      // Processa em lotes para não estourar o limite de conexões
      for (const te of TECH_ENTITIES) {
        const records = await base44.asServiceRole.entities[te.entity]
          .filter({ approval_status: "pending_review" })
          .catch(() => []);
        counts[te.key] = 0;
        for (const record of records) {
          const log = JSON.parse(record.approval_log || "[]");
          log.push({ action: "approved", by: user.full_name || user.email, at: new Date().toISOString(), bulk: true });
          await base44.asServiceRole.entities[te.entity].update(record.id, {
            approval_status: "approved",
            reviewed_by: user.full_name || user.email,
            reviewed_at: new Date().toISOString(),
            review_decision: "approved",
            approval_log: JSON.stringify(log),
          }).catch(() => {});
          counts[te.key]++;
          totalApproved++;
        }
      }
      await logAudit(base44, user, "Validação técnica — aprovação em lote", `Total aprovado: ${totalApproved}. Detalhes: ${JSON.stringify(counts)}`);
      return Response.json({ ok: true, total: totalApproved, counts, message: `${totalApproved} validação(ões) aprovada(s).` });
    }

    return Response.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}