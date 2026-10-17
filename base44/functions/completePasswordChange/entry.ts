import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { AUDITABLE_ACTIONS, isActiveAccount } from "../../shared/accessSecurity.js";

// Limpa no backend o flag administrativo `must_change_password` após o próprio
// usuário concluir a alteração de senha (base44.auth.changePassword, que valida a
// senha atual no servidor). Centraliza a escrita de um campo de controle de acesso
// fora do updateMe (gravável pelo próprio usuário) e registra auditoria.

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

    // Busca o registro atualizado do usuário (service role) para verificar preconditions
    const freshUser = await base44.asServiceRole.entities.User.get(user.id);

    // Verifica que a troca de senha é obrigatória — não permite limpar um flag já limpo
    if (!freshUser.must_change_password) {
      return Response.json({ error: "Troca de senha não é obrigatória para esta conta." }, { status: 400 });
    }

    // Verifica que o registro do usuário foi atualizado recentemente, indicando que
    // a senha foi alterada pela plataforma (base44.auth.changePassword atualiza o
    // registro do usuário). Sem isso, um atacante com sessão válida poderia limpar
    // o flag sem efetivamente trocar a senha.
    const updatedDate = new Date(freshUser.updated_date);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (updatedDate < fiveMinutesAgo) {
      return Response.json({ error: "É necessário alterar a senha antes de concluir a troca." }, { status: 403 });
    }

    await base44.asServiceRole.entities.User.update(user.id, { must_change_password: false });
    await logAudit(base44, user, AUDITABLE_ACTIONS.password_reset_completed, "Troca de senha concluída pelo próprio usuário");
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}