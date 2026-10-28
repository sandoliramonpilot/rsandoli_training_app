import { secrets } from "base44:runtime";
// Helpers de segurança compartilhados entre as funções de usuários e código de acesso.
// Utiliza Web Crypto (SubtleCrypto) — disponível no runtime do Base44.

export async function hashString(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateNumericCode(length = 6) {
  // Descarta bytes >= 250 para que cada dígito (0 a 9) tenha a mesma probabilidade.
  let out = "";
  while (out.length < length) {
    const bytes = new Uint8Array(length * 2);
    crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (b < 250 && out.length < length) out += (b % 10).toString();
    }
  }
  return out;
}

export function generateTempPassword(length = 12) {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => charset[b % charset.length]).join("");
}

// Níveis de acesso — espelha src/lib/accessControl.js
export const ACCESS_LEVEL_VALUES = ["admin_geral", "administrador", "gestor_supervisor", "operacional", "consulta"];
export const ADMIN_ACCESS_LEVELS = ["admin_geral", "administrador"];

// Nível efetivo do usuário. O campo User.access_level é customizado e gravável pelo
// próprio usuário (como account_status), então ele NUNCA autoriza sozinho: ver isAdminUser.
export function levelOf(user) {
  if (user?.access_level && ACCESS_LEVEL_VALUES.includes(user.access_level)) return user.access_level;
  return user?.role === "admin" ? "administrador" : "operacional";
}

// Portão administrativo autoritativo: exige o papel de plataforma (User.role, definido
// pelo backend e não sobrescrevível pelo próprio usuário via updateMe) SOMADO ao nível.
// Um usuário comum que grave access_level = "admin_geral" no próprio cadastro continua
// com role "user" e, portanto, não obtém nenhuma ação administrativa.
export function isAdminUser(user) {
  return user?.role === "admin" && ADMIN_ACCESS_LEVELS.includes(levelOf(user));
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

// Situações que bloqueiam o acesso. Qualquer valor fora de ACTIVE_ACCOUNT_STATUSES
// é tratado como sanção.
export const INACTIVE_ACCOUNT_STATUSES = ["bloqueada", "suspensa", "desativada"];

// Fonte autoritativa: entidade AccountStatus, gravável apenas por administradores via
// backend (RLS: o usuário não pode criar, alterar nem excluir esses registros).
//
// O campo User.account_status é gravável pelo próprio usuário via updateMe, então ele
// NUNCA é aceito para liberar acesso: forjar account_status não reativa uma conta
// bloqueada. Sem registro autoritativo o campo é consultado apenas no sentido
// restritivo — um valor de sanção (bloqueada / suspensa / desativada) mantém o acesso
// bloqueado, e qualquer outro valor equivale à ausência de sanção.
//
// Toda sanção aplicada pelo app grava o registro autoritativo ANTES de alterar o
// cadastro (ver setAccountStatusRecord, que falha em vez de gravar parcialmente), de
// modo que um registro existente sempre prevalece sobre o campo do usuário.
export async function isActiveAccount(base44, user) {
  if (!user?.id) return false;
  let recs;
  try {
    recs = await base44.asServiceRole.entities.AccountStatus.filter({ user_id: user.id });
  } catch {
    // Sem leitura da fonte autoritativa não há como comprovar a situação: nega.
    return false;
  }
  if (recs && recs.length) {
    const latest = recs
      .slice()
      .sort((a, b) => new Date(b.set_at || b.created_date || 0).getTime() - new Date(a.set_at || a.created_date || 0).getTime())[0];
    return ACTIVE_ACCOUNT_STATUSES.includes(latest.status);
  }
  // Sem registro: só uma sanção declarada restringe; "ativa" declarado pelo usuário
  // não libera nada que já não estivesse liberado.
  return !INACTIVE_ACCOUNT_STATUSES.includes(String(user.account_status || ""));
}

// Cria ou atualiza o registro autoritativo de situação da conta (backend only, via
// asServiceRole). Usado por manageUsers sempre que o status é alterado.
// Retorna true somente quando o registro foi efetivamente gravado: sanções não podem
// ficar registradas apenas no campo User.account_status, que é gravável pelo usuário.
export async function setAccountStatusRecord(base44, userId, status, actor, reason) {
  try {
    const existing = await base44.asServiceRole.entities.AccountStatus.filter({ user_id: userId });
    const now = new Date().toISOString();
    if (existing && existing.length) {
      const latest = existing
        .slice()
        .sort((a, b) => new Date(b.set_at || b.created_date || 0).getTime() - new Date(a.set_at || a.created_date || 0).getTime())[0];
      await base44.asServiceRole.entities.AccountStatus.update(latest.id, { status, set_by: actor || null, set_at: now, reason: reason || "" });
    } else {
      await base44.asServiceRole.entities.AccountStatus.create({ user_id: userId, status, set_by: actor || null, set_at: now, reason: reason || "" });
    }
    return true;
  } catch {
    return false;
  }
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
// Operações que exigem código de acesso. Chaves técnicas, nunca rótulos em português.
export const SENSITIVE_OPERATIONS = [
  "change_account_status",
  "change_access_level",
  "change_permissions",
  "set_master",
  "reset_password",
];
// Hash keyed (HMAC-SHA256) do código de acesso. O segredo do servidor impede
// a reversão offline caso a tabela AccessCode vaze.
const textEncoder = new TextEncoder();

export function getCodeSecret() {
  const secret = secrets.get("ACCESS_CODE_SECRET");
  return secret && secret.length >= 32 ? secret : null;
}

export async function hashCode(code, userId, secret) {
  if (!secret) throw new Error("Segredo de código de acesso não configurado.");
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(`${userId}:${code}`));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
