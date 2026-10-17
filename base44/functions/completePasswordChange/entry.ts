import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { AUDITABLE_ACTIONS, isActiveAccount } from "../../shared/accessSecurity.js";

// Realiza a troca de senha no backend e só então limpa o flag administrativo
// `must_change_password`. Ao mover a troca para o servidor, garante que o flag
// só é limpo após a plataforma confirmar a alteração — eliminando a possibilidade
// de limpar o flag sem efetivamente trocar a senha.

const PASSWORD_RULES = [
  (v) => v.length >= 8,
  (v) => /[A-Z]/.test(v),
  (v) => /[a-z]/.test(v),
  (v) => /\d/.test(v),
  (v) => /[^A-Za-z0-9]/.test(v),
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

    const body = await req.json().catch(() => ({}));
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!currentPassword || !newPassword) {
      return Response.json({ error: "Senha atual e nova senha são obrigatórias." }, { status: 400 });
    }

    // Validação das regras de senha no backend (espelha o frontend)
    if (newPassword.trim() !== newPassword || newPassword.startsWith(" ") || newPassword.endsWith(" ")) {
      return Response.json({ error: "A senha não pode começar ou terminar com espaços." }, { status: 400 });
    }
    const login = (user.login || user.email || "").toLowerCase();
    if (newPassword.toLowerCase() === login) {
      return Response.json({ error: "A senha não pode ser igual ao login." }, { status: 400 });
    }
    if (!PASSWORD_RULES.every((r) => r(newPassword))) {
      return Response.json({ error: "A nova senha não atende aos requisitos mínimos." }, { status: 400 });
    }

    // Troca a senha no servidor — a plataforma valida a senha atual.
    // Só depois de a troca ser confirmada é que o flag administrativo é limpo,
    // eliminando a possibilidade de limpar o flag sem efetivamente trocar a senha.
    await base44.auth.changePassword({ currentPassword, newPassword });

    // Limpa o flag de troca obrigatória, se estiver ativo
    const freshUser = await base44.asServiceRole.entities.User.get(user.id);
    if (freshUser?.must_change_password) {
      await base44.asServiceRole.entities.User.update(user.id, { must_change_password: false });
    }

    await logAudit(base44, user, AUDITABLE_ACTIONS.password_reset_completed, "Troca de senha concluída pelo próprio usuário");
    return Response.json({ ok: true });
  } catch (error) {
    // O erro de changePassword pode ser um objeto da plataforma sem message legível
    let msg = "Não foi possível alterar a senha. Verifique a senha atual.";
    if (error?.message && typeof error.message === "string" && !error.message.includes("[object")) {
      msg = error.message;
    } else if (error?.data?.message) {
      msg = error.data.message;
    } else if (typeof error === "string") {
      msg = error;
    }
    return Response.json({ error: msg }, { status: 500 });
  }
}