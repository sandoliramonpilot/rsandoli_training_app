// Helpers de segurança compartilhados entre as funções de usuários e código de acesso.
// Utiliza Web Crypto (SubtleCrypto) — disponível no runtime do Base44.

export async function hashString(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateNumericCode(length = 6) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => (b % 10).toString()).join("");
}

export function generateTempPassword(length = 12) {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => charset[b % charset.length]).join("");
}

// Níveis de acesso e hierarquia — espelha src/lib/accessControl.js
export const ACCESS_RANK = {
  admin_geral: 5,
  administrador: 4,
  gestor_supervisor: 3,
  operacional: 2,
  consulta: 1,
};

export function rankOf(level) {
  return ACCESS_RANK[level] || 0;
}

export function canManageLevel(actorLevel, targetLevel) {
  if (actorLevel !== "admin_geral" && targetLevel === "admin_geral") return false;
  return rankOf(actorLevel) > rankOf(targetLevel);
}

export const ACTIVE_ACCOUNT_STATUSES = ["ativa", "convite_pendente"];
export function isActiveAccount(user) {
  const s = user?.account_status || "ativa";
  return ACTIVE_ACCOUNT_STATUSES.includes(s);
}

export const AUDITABLE_ACTIONS = {
  user_created: "Criação de usuário",
  user_edited: "Edição cadastral",
  access_level_changed: "Alteração de nível de acesso",
  permissions_changed: "Alteração de permissões",
  user_blocked: "Bloqueio de usuário",
  user_unblocked: "Desbloqueio de usuário",
  user_suspended: "Suspensão de usuário",
  user_activated: "Ativação de usuário",
  user_deactivated: "Desativação de usuário",
  password_reset_requested: "Solicitação de redefinição de senha",
  password_reset_completed: "Redefinição de senha concluída",
  login_success: "Login bem-sucedido",
  login_failed: "Tentativa de login inválida",
  session_revoked: "Encerramento administrativo de sessão",
  access_code_requested: "Solicitação de código de acesso",
  access_code_sent: "Envio de código de acesso",
  access_code_validated: "Código validado com sucesso",
  access_code_invalid: "Código inválido",
  access_code_expired: "Código expirado",
  access_code_limit_reached: "Limite de tentativas de código atingido",
  login_with_code: "Login concluído com código",
};