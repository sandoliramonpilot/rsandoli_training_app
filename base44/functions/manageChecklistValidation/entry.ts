import { createClientFromRequest } from "npm:@base44/sdk";
import { isAdminUser, isActiveAccount } from "../../shared/accessSecurity.js";

// Validacao tecnica das fases do checklist operacional H125 (B2/B3e).
// O Administrador Geral aprova, reprova ou reabre a validacao por etapa completa.

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
      return Response.json({ error: "Apenas administradores podem gerenciar a validacao do checklist." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // ---------- LIST: validacoes de uma variante ----------
    if (action === "list") {
      const variant = body.variant;
      if (!variant) return Response.json({ error: "Variante nao informada." }, { status: 400 });
      const records = await base44.asServiceRole.entities.ChecklistValidation
        .filter({ variant })
        .catch(() => []);
      const map = {};
      (records || []).forEach((r) => {
        map[r.phase_id] = {
          status: r.status,
          reviewed_by: r.reviewed_by || null,
          reviewed_at: r.reviewed_at || null,
          justification: r.justification || null,
        };
      });
      return Response.json({ map });
    }

    // ---------- SET_STATUS: aprovar / reprovar / reabrir uma fase ----------
    if (action === "set_status") {
      const { variant, phase_id, phase_name, status, justification } = body;
      if (!variant || !phase_id) {
        return Response.json({ error: "Variante e fase sao obrigatorios." }, { status: 400 });
      }
      if (!["pending", "approved", "rejected"].includes(status)) {
        return Response.json({ error: "Status invalido." }, { status: 400 });
      }
      if ((status === "rejected" || status === "pending") && !String(justification || "").trim()) {
        return Response.json({ error: "Justificativa obrigatoria para reprovar ou reabrir." }, { status: 400 });
      }

      const existing = await base44.asServiceRole.entities.ChecklistValidation
        .filter({ variant, phase_id })
        .catch(() => []);

      const now = new Date().toISOString();
      const reviewer = user.full_name || user.email;
      const decision = status === "approved" ? "approved" : status === "rejected" ? "rejected" : "reopened";
      const logEntry = { action: decision, by: reviewer, at: now, justification: justification || "" };

      if (existing && existing.length) {
        const rec = existing[0];
        const log = JSON.parse(rec.approval_log || "[]");
        log.push(logEntry);
        await base44.asServiceRole.entities.ChecklistValidation.update(rec.id, {
          status,
          reviewed_by: reviewer,
          reviewed_at: now,
          justification: justification || null,
          phase_name: phase_name || rec.phase_name || null,
          approval_log: JSON.stringify(log),
        });
        await logAudit(base44, user, `Checklist H125 ${variant} - validacao: ${decision}`,
          `${phase_name || phase_id} -> ${status}. Justificativa: ${justification || "-"}`);
        return Response.json({ ok: true, status, message: `Fase ${status === "approved" ? "aprovada" : status === "rejected" ? "reprovada" : "reaberta"}.` });
      }

      await base44.asServiceRole.entities.ChecklistValidation.create({
        variant,
        phase_id,
        phase_name: phase_name || null,
        status,
        reviewed_by: reviewer,
        reviewed_at: now,
        justification: justification || null,
        approval_log: JSON.stringify([logEntry]),
      });
      await logAudit(base44, user, `Checklist H125 ${variant} - validacao: ${decision}`,
        `${phase_name || phase_id} -> ${status}. Justificativa: ${justification || "-"}`);
      return Response.json({ ok: true, status, message: `Fase ${status === "approved" ? "aprovada" : status === "rejected" ? "reprovada" : "reaberta"}.` });
    }

    // ---------- APPROVE_ALL: aprovar todas as fases pendentes ----------
    if (action === "approve_all") {
      const variant = body.variant;
      if (!variant) return Response.json({ error: "Variante nao informada." }, { status: 400 });
      const records = await base44.asServiceRole.entities.ChecklistValidation
        .filter({ variant, status: "pending" })
        .catch(() => []);
      const now = new Date().toISOString();
      const reviewer = user.full_name || user.email;
      let count = 0;
      for (const rec of records) {
        const log = JSON.parse(rec.approval_log || "[]");
        log.push({ action: "approved", by: reviewer, at: now, bulk: true });
        await base44.asServiceRole.entities.ChecklistValidation.update(rec.id, {
          status: "approved",
          reviewed_by: reviewer,
          reviewed_at: now,
          approval_log: JSON.stringify(log),
        }).catch(() => {});
        count++;
      }
      await logAudit(base44, user, `Checklist H125 ${variant} - aprovacao em lote`, `Total: ${count}`);
      return Response.json({ ok: true, count, message: `${count} fase(s) aprovada(s).` });
    }

    return Response.json({ error: "Acao invalida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}