import { createClientFromRequest } from "npm:@base44/sdk";
import {
  DENY_MESSAGE, getUserProfiles, inProfileScope, isActiveAccount, isAdminUser, levelOf,
} from "../../shared/accessSecurity.js";

// ============================================================
// Central unificada de Controle de Aprovações.
// Apenas Administrador Geral (admin_geral) pode decidir; listagem
// também é restrita a admin (RLS da entidade ApprovalDecision).
// ============================================================

const SOURCES = [
  {
    key: "aircraft", entity: "Aircraft", label: "Aeronaves", area: "principal",
    statusField: "approval_status", pendingValues: ["pending"],
    titleField: "registration", subtitleFields: ["model", "operator_name", "callsign"],
    docField: null, docNameField: null,
    approveVal: "approved", rejectVal: "rejected", correctionVal: "pending",
    suspendVal: "rejected", restoreVal: "pending",
    hasApprovalLog: true,
    reviewFields: { reviewed_by: null, reviewed_at: null, justification_field: null },
  },
  {
    key: "pilot", entity: "Pilot", label: "Pilotos", area: "operacoes",
    statusField: "approval_status", pendingValues: ["pending"],
    titleField: "full_name", subtitleFields: ["war_name", "registration", "base"],
    docField: null, docNameField: null,
    approveVal: "approved", rejectVal: "rejected", correctionVal: "pending",
    suspendVal: "rejected", restoreVal: "pending",
    hasApprovalLog: true,
    reviewFields: { reviewed_by: null, reviewed_at: null, justification_field: null },
  },
  {
    key: "pilot_license", entity: "PilotLicense", label: "Licenças", area: "operacoes",
    statusField: "approval_status", pendingValues: ["pending_review", "draft"],
    titleField: "license_type_label", subtitleFields: ["pilot_name", "license_number"],
    docField: "document_uri", docNameField: "document_name",
    approveVal: "approved", rejectVal: "rejected", correctionVal: "pending_review",
    suspendVal: "rejected", restoreVal: "pending_review",
    hasApprovalLog: true,
    reviewFields: { reviewed_by: "reviewed_by", reviewed_at: "reviewed_at", justification_field: "review_justification" },
  },
  {
    key: "pilot_habilitacao", entity: "PilotHabilitacao", label: "Habilitações", area: "operacoes",
    statusField: "approval_status", pendingValues: ["pending_review", "draft"],
    titleField: "type_label", subtitleFields: ["pilot_name", "number"],
    docField: "document_uri", docNameField: "document_name",
    approveVal: "approved", rejectVal: "rejected", correctionVal: "pending_review",
    suspendVal: "rejected", restoreVal: "pending_review",
    hasApprovalLog: true,
    reviewFields: { reviewed_by: "reviewed_by", reviewed_at: "reviewed_at", justification_field: null },
  },
  {
    key: "qrh_validation", entity: "QrhValidation", label: "QRH", area: "operacoes",
    statusField: "status", pendingValues: ["pending"],
    titleField: "procedure_name", subtitleFields: ["variant", "group"],
    docField: null, docNameField: null,
    approveVal: "approved", rejectVal: "rejected", correctionVal: "pending",
    suspendVal: "rejected", restoreVal: "pending",
    hasApprovalLog: true,
    reviewFields: { reviewed_by: "reviewed_by", reviewed_at: "reviewed_at", justification_field: "justification" },
  },
  {
    key: "checklist_validation", entity: "ChecklistValidation", label: "Checklists", area: "operacoes",
    statusField: "status", pendingValues: ["pending"],
    titleField: "phase_name", subtitleFields: ["variant"],
    docField: null, docNameField: null,
    approveVal: "approved", rejectVal: "rejected", correctionVal: "pending",
    suspendVal: "rejected", restoreVal: "pending",
    hasApprovalLog: true,
    reviewFields: { reviewed_by: "reviewed_by", reviewed_at: "reviewed_at", justification_field: "justification" },
  },
  {
    key: "training_doc", entity: "TrainingDocument", label: "Treinamentos", area: "academy",
    statusField: "approval_status", pendingValues: ["pending_review"],
    titleField: "title", subtitleFields: ["discipline", "chapter"],
    docField: "file_uri", docNameField: "file_name",
    approveVal: "approved", rejectVal: "rejected", correctionVal: "pending_review",
    suspendVal: "rejected", restoreVal: "pending_review",
    hasApprovalLog: true,
    reviewFields: { reviewed_by: "reviewed_by", reviewed_at: "reviewed_at", justification_field: "review_justification" },
  },
  {
    key: "library_doc", entity: "LibraryDocument", label: "Biblioteca", area: "biblioteca",
    statusField: "approval_status", pendingValues: ["pending_review"],
    titleField: "title", subtitleFields: ["category", "doc_number"],
    docField: "file_uri", docNameField: "file_name",
    approveVal: "approved", rejectVal: "rejected", correctionVal: "pending_review",
    suspendVal: "rejected", restoreVal: "pending_review",
    hasApprovalLog: true,
    reviewFields: { reviewed_by: "reviewed_by", reviewed_at: "reviewed_at", justification_field: "review_justification" },
  },
  {
    key: "user_invite", entity: "UserInvite", label: "Convites", area: "administracao",
    statusField: "approval_status", pendingValues: ["pending"],
    titleField: "email", subtitleFields: ["full_name", "access_level"],
    docField: null, docNameField: null,
    approveVal: "approved", rejectVal: "rejected", correctionVal: "pending",
    suspendVal: "rejected", restoreVal: "pending",
    hasApprovalLog: false,
    reviewFields: { reviewed_by: null, reviewed_at: null, justification_field: null },
  },
  {
    key: "pilot_change", entity: "PilotChangeRequest", label: "Alterações de Piloto", area: "administracao",
    statusField: "status", pendingValues: ["pending"],
    titleField: "pilot_name", subtitleFields: ["requested_by"],
    docField: null, docNameField: null,
    approveVal: "approved", rejectVal: "rejected", correctionVal: "pending",
    suspendVal: "rejected", restoreVal: "pending",
    hasApprovalLog: false,
    reviewFields: { reviewed_by: "reviewed_by", reviewed_at: "reviewed_at", justification_field: null },
  },
  {
    key: "oat_change", entity: "OatChangeRequest", label: "OAT", area: "administracao",
    statusField: "status", pendingValues: ["pending", "in_review", "doc_check", "tech_review"],
    titleField: "oat_name", subtitleFields: ["requested_by", "change_type"],
    docField: null, docNameField: null,
    approveVal: "approved", rejectVal: "rejected", correctionVal: "pending",
    suspendVal: "rejected", restoreVal: "pending",
    hasApprovalLog: false,
    reviewFields: { reviewed_by: "reviewed_by", reviewed_at: "reviewed_at", justification_field: "reason" },
  },
];

function relevantStatusValues(src) {
  return Array.from(new Set([
    ...src.pendingValues, src.approveVal, src.rejectVal, src.correctionVal,
  ]));
}

function classify(src, rawStatus, latestDecision, recordId) {
  const key = `${src.entity}:${recordId}`;
  const ld = latestDecision.get(key);
  if (ld === "suspended") return "suspended";
  if (ld === "correction_requested") return "correction";
  if (rawStatus === src.approveVal) return "approved";
  if (rawStatus === src.rejectVal) return "rejected";
  if (src.pendingValues.includes(rawStatus)) return "pending";
  return "other";
}

function buildSummary(src, r) {
  const title = r[src.titleField] || "Sem título";
  const subtitleParts = (src.subtitleFields || [])
    .map((f) => r[f])
    .filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
  return {
    id: r.id,
    source_key: src.key,
    source_entity: src.entity,
    area: src.area,
    title,
    subtitle: subtitleParts.join(" · "),
    status: r[src.statusField],
    created_date: r.created_date || null,
    doc_uri: src.docField ? r[src.docField] || null : null,
    doc_name: src.docNameField ? r[src.docNameField] || null : null,
  };
}

function buildSnapshot(src, r) {
  const fields = [src.titleField, ...(src.subtitleFields || [])];
  if (src.docField) fields.push(src.docField, src.docNameField);
  const summary = {};
  for (const f of fields) {
    if (r[f] !== undefined && r[f] !== null && String(r[f]).trim() !== "") {
      summary[f] = r[f];
    }
  }
  summary[src.statusField] = r[src.statusField];
  return summary;
}

function newStatusFor(src, decision) {
  switch (decision) {
    case "approved": return src.approveVal;
    case "rejected": return src.rejectVal;
    case "correction_requested": return src.correctionVal;
    case "suspended": return src.suspendVal;
    case "unsuspended": return src.restoreVal;
    default: return null;
  }
}

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

// Mapa da última decisão por registro (entity:recordId -> decision).
// Distingue "suspended" e "correction_requested" do estado puro do campo de status,
// já que correctionVal pode colidir com um valor pendente (ex.: pending_review).
async function buildLatestDecisionMap(base44) {
  const map = new Map();
  try {
    const decs = await base44.asServiceRole.entities.ApprovalDecision
      .filter({}, { sort: "-reviewed_at", limit: 500 })
      .then((r) => (Array.isArray(r) ? r : r.items || []))
      .catch(() => []);
    for (const d of decs) {
      const k = `${d.source_entity}:${d.source_record_id}`;
      if (!map.has(k)) map.set(k, d.decision); // primeiro encontrado é o mais recente
    }
  } catch {}
  return map;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: DENY_MESSAGE }, { status: 401 });
    if (!(await isActiveAccount(base44, user))) return Response.json({ error: DENY_MESSAGE }, { status: 403 });

    // Somente Administrador Geral de fato: nível admin_geral + papel de plataforma admin.
    if (!(isAdminUser(user) && levelOf(user) === "admin_geral")) {
      return Response.json({ error: DENY_MESSAGE }, { status: 403 });
    }

    const userProfiles = await getUserProfiles(base44, user); // null para admin_geral
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // ---------- LIST ----------
    if (action === "list") {
      const latestDecision = await buildLatestDecisionMap(base44);
      const items = [];

      await Promise.all(
        SOURCES.map(async (src) => {
          const records = await base44.asServiceRole.entities[src.entity]
            .filter({ [src.statusField]: { $in: relevantStatusValues(src) } }, { sort: "-created_date", limit: 300 })
            .then((r) => (Array.isArray(r) ? r : r.items || []))
            .catch(() => []);
          for (const r of records) {
            if (!inProfileScope(userProfiles, r)) continue;
            const s = buildSummary(src, r);
            s.display_status = classify(src, r[src.statusField], latestDecision, r.id);
            s.summary = buildSnapshot(src, r);
            items.push(s);
          }
        })
      );

      items.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
      return Response.json({ items });
    }

    // ---------- DECIDE ----------
    if (action === "decide") {
      const src = SOURCES.find((s) => s.key === body.source_key);
      if (!src) return Response.json({ error: "Fonte de aprovação inválida." }, { status: 400 });
      if (!body.id) return Response.json({ error: "ID não informado." }, { status: 400 });
      const decision = body.decision;
      if (!["approved", "rejected", "correction_requested", "suspended", "unsuspended"].includes(decision)) {
        return Response.json({ error: "Decisão inválida." }, { status: 400 });
      }
      if (["rejected", "correction_requested", "suspended"].includes(decision)) {
        if (!body.justification || !String(body.justification).trim()) {
          return Response.json({ error: "Informe a justificativa da decisão." }, { status: 400 });
        }
      }
      const record = await base44.asServiceRole.entities[src.entity].get(body.id).catch(() => null);
      if (!record) return Response.json({ error: "Registro não encontrado." }, { status: 404 });
      if (!inProfileScope(userProfiles, record)) return Response.json({ error: DENY_MESSAGE }, { status: 403 });

      const previousStatus = record[src.statusField];
      const newStatus = newStatusFor(src, decision);
      const now = new Date().toISOString();
      const reviewer = user.full_name || user.email;

      const patch = { [src.statusField]: newStatus };
      if (src.reviewFields.reviewed_by) patch[src.reviewFields.reviewed_by] = reviewer;
      if (src.reviewFields.reviewed_at) patch[src.reviewFields.reviewed_at] = now;
      if (src.reviewFields.justification_field) patch[src.reviewFields.justification_field] = String(body.justification || "").trim();

      if (src.hasApprovalLog) {
        let log = [];
        try { log = JSON.parse(record.approval_log || "[]"); } catch {}
        log.push({ action: decision, by: reviewer, at: now, justification: body.justification || "" });
        patch.approval_log = JSON.stringify(log);
      }

      await base44.asServiceRole.entities[src.entity].update(body.id, patch);

      // Trilha de auditoria unificada.
      await base44.asServiceRole.entities.ApprovalDecision.create({
        source_entity: src.entity,
        source_key: src.key,
        source_record_id: body.id,
        record_title: record[src.titleField] || "Sem título",
        module_label: src.label,
        decision,
        justification: String(body.justification || "").trim(),
        reviewed_by: user.id || null,
        reviewed_by_name: reviewer,
        reviewed_at: now,
        previous_status: String(previousStatus || ""),
        new_status: String(newStatus || ""),
      });

      await logAudit(
        base44, user,
        `Controle de Aprovações — ${src.label}`,
        `Decisão: ${decision} · ${record[src.titleField] || ""} · Justificativa: ${body.justification || "—"}`
      );

      return Response.json({ ok: true, message: "Decisão registrada.", new_status: newStatus });
    }

    // ---------- HISTORY ----------
    if (action === "history") {
      const filter = {};
      if (body.source_entity) filter.source_entity = body.source_entity;
      if (body.decision) filter.decision = body.decision;
      const limit = Math.min(Number(body.limit) || 200, 500);
      const items = await base44.asServiceRole.entities.ApprovalDecision
        .filter(filter, { sort: "-reviewed_at", limit })
        .then((r) => (Array.isArray(r) ? r : r.items || []))
        .catch(() => []);
      return Response.json({ items });
    }

    // ---------- HISTORY FOR ONE RECORD ----------
    if (action === "history_for") {
      if (!body.source_entity || !body.source_record_id) {
        return Response.json({ error: "source_entity e source_record_id obrigatórios." }, { status: 400 });
      }
      const items = await base44.asServiceRole.entities.ApprovalDecision
        .filter({ source_entity: body.source_entity, source_record_id: body.source_record_id }, { sort: "-reviewed_at", limit: 100 })
        .then((r) => (Array.isArray(r) ? r : r.items || []))
        .catch(() => []);
      return Response.json({ items });
    }

    return Response.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || "Erro interno." }, { status: 500 });
  }
}