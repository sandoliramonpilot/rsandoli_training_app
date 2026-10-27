import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { AUDITABLE_ACTIONS, generateNumericCode, hashString, isActiveAccount, SENSITIVE_OPERATIONS } from "../../shared/accessSecurity.js";

const CODE_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RESEND_INTERVAL_SECONDS = 60;

function maskEmail(email) {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const head = local[0] || "*";
  return `${head}***@${domain}`;
}

async function logAudit(base44, actor, target, action, details) {
  try {
    await base44.asServiceRole.entities.AccessAuditLog.create({
      actor_user_id: actor?.id || null,
      actor_name: actor?.full_name || actor?.email || "Sistema",
      target_user_id: target?.id || null,
      target_name: target?.full_name || target?.email || null,
      action,
      details: details || "",
      created_at: new Date().toISOString(),
    });
  } catch {}
}

async function invalidatePrevious(base44, userId, purpose, operation) {
  const open = await base44.asServiceRole.entities.AccessCode.filter({ user_id: userId, purpose, used: false });
  for (const c of open) {
    // Para operações sensíveis, invalida somente os códigos da mesma operação.
    if (purpose === "sensitive_op" && c.operation !== operation) continue;
    await base44.asServiceRole.entities.AccessCode.update(c.id, { used: true });
  }
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const purpose = body.purpose === "sensitive_op" ? "sensitive_op" : "login";

    // ---------- SEND ----------
    if (action === "send") {
      if (!(await isActiveAccount(base44, user))) {
        return Response.json({ error: "Conta não está ativa." }, { status: 403 });
      }
      if (purpose === "sensitive_op" && !SENSITIVE_OPERATIONS.includes(body.operation)) {
        return Response.json({ error: "Operação sensível inválida." }, { status: 400 });
      }
      const recent = (await base44.asServiceRole.entities.AccessCode.filter({ user_id: user.id, purpose, used: false }))
        .filter((c) => purpose !== "sensitive_op" || c.operation === (body.operation || null));
      const latest = recent.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      if (latest) {
        const elapsed = (Date.now() - new Date(latest.created_at).getTime()) / 1000;
        if (elapsed < RESEND_INTERVAL_SECONDS) {
          return Response.json({ error: `Aguarde ${Math.ceil(RESEND_INTERVAL_SECONDS - elapsed)}s para reenviar.`, waitSeconds: Math.ceil(RESEND_INTERVAL_SECONDS - elapsed) }, { status: 429 });
        }
      }
      const dayAgo = Date.now() - 24 * 3600 * 1000;
      const allCodes = await base44.asServiceRole.entities.AccessCode.filter({ user_id: user.id });
      const sentToday = allCodes.filter((c) => new Date(c.created_at).getTime() > dayAgo).length;
      if (sentToday >= 10) {
        return Response.json({ error: "Limite diário de códigos atingido. Fale com o administrador." }, { status: 429 });
      }
      await invalidatePrevious(base44, user.id, purpose, body.operation || null);

      const code = generateNumericCode(6);
      const codeHash = await hashString(code + user.id);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + CODE_TTL_MINUTES * 60000);
      await base44.asServiceRole.entities.AccessCode.create({
        user_id: user.id,
        user_email: maskEmail(user.email),
        code_hash: codeHash,
        channel: "email",
        purpose,
        operation: body.operation || null,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        used: false,
        created_at: now.toISOString(),
      });

      let emailOk = true;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: "Seu código de acesso — AW119Kx Academy",
          body: `Olá ${user.full_name || ""},\n\nSeu código de verificação é:\n\n${code}\n\nEle é válido por ${CODE_TTL_MINUTES} minutos e só pode ser usado uma vez.\n\nSe você não solicitou este código, ignore esta mensagem e avise o administrador.`,
        });
      } catch {
        emailOk = false;
      }
      await logAudit(base44, user, user, AUDITABLE_ACTIONS.access_code_sent, `Canal: ${maskEmail(user.email)}; Finalidade: ${purpose}${emailOk ? "" : "; FALHA NO ENVIO"}`);
      if (!emailOk) return Response.json({ error: "Não foi possível enviar o código no momento. Tente novamente mais tarde." }, { status: 502 });
      return Response.json({ ok: true, masked: maskEmail(user.email), expiresInMinutes: CODE_TTL_MINUTES });
    }

    // ---------- VERIFY ----------
    if (action === "verify") {
      const code = String(body.code || "").trim();
      if (!/^\d{6}$/.test(code)) {
        return Response.json({ error: "Código inválido. Verifique o código informado e tente novamente." }, { status: 400 });
      }
      if (!(await isActiveAccount(base44, user))) {
        return Response.json({ error: "Conta não está ativa." }, { status: 403 });
      }
      const operation = body.operation || null;
      if (purpose === "sensitive_op" && !SENSITIVE_OPERATIONS.includes(operation)) {
        return Response.json({ error: "Operação sensível inválida." }, { status: 400 });
      }
      const open = (await base44.asServiceRole.entities.AccessCode.filter({ user_id: user.id, purpose, used: false }))
        .filter((c) => purpose !== "sensitive_op" || c.operation === operation);
      const latest = open.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        return Response.json({ error: "Nenhum código ativo. Solicite um novo código." }, { status: 400 });
      }
      if (latest.attempts >= MAX_ATTEMPTS) {
        await base44.asServiceRole.entities.AccessCode.update(latest.id, { used: true });
        await logAudit(base44, user, user, AUDITABLE_ACTIONS.access_code_limit_reached, "");
        return Response.json({ error: "Limite de tentativas atingido. Solicite um novo código." }, { status: 429 });
      }
      if (new Date(latest.expires_at).getTime() < Date.now()) {
        await base44.asServiceRole.entities.AccessCode.update(latest.id, { used: true });
        await logAudit(base44, user, user, AUDITABLE_ACTIONS.access_code_expired, "");
        return Response.json({ error: "O código expirou. Solicite um novo código para continuar." }, { status: 410 });
      }
      const codeHash = await hashString(code + user.id);
      if (codeHash !== latest.code_hash) {
        await base44.asServiceRole.entities.AccessCode.update(latest.id, { attempts: (latest.attempts || 0) + 1 });
        await logAudit(base44, user, user, AUDITABLE_ACTIONS.access_code_invalid, "");
        return Response.json({ error: "Código inválido. Verifique o código informado e tente novamente." }, { status: 400 });
      }
      await base44.asServiceRole.entities.AccessCode.update(latest.id, { used: true });
      await logAudit(base44, user, user, AUDITABLE_ACTIONS.access_code_validated, `Finalidade: ${purpose}`);
      finally Response.json({ ok: true, operation: latest.operation || null });
    }

    return Response.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}