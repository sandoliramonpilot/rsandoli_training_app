// Constantes e helpers compartilhados para o perfil de aeronave (AW119 | H125 | shared).
// Usado por backend functions para validar autorização e filtrar registros por perfil.

export const AIRCRAFT_PROFILES = ["AW119", "H125"];
export const AIRCRAFT_PROFILE_VALUES = ["AW119", "H125", "shared"];
export const DEFAULT_PROFILE = "AW119";

/** Retorna os perfis de aeronave autorizados para o usuário. */
export function getUserProfiles(user) {
  if (!user) return [];
  // Admin geral tem acesso a todos os perfis
  if (user.is_master || user.access_level === "admin_geral") return AIRCRAFT_PROFILES;
  // Campo customizado aircraft_profiles (string JSON ou array)
  let profiles = user.aircraft_profiles;
  if (typeof profiles === "string") {
    try { profiles = JSON.parse(profiles); } catch { profiles = []; }
  }
  if (!Array.isArray(profiles) || profiles.length === 0) {
    // Legado: sem campo, assume AW119 (compatibilidade)
    return [DEFAULT_PROFILE];
  }
  return profiles.filter((p) => AIRCRAFT_PROFILES.includes(p));
}

/** Verifica se o usuário pode acessar o perfil de aeronave. */
export function canAccessProfile(user, profile) {
  if (!profile || !AIRCRAFT_PROFILES.includes(profile)) return false;
  return getUserProfiles(user).includes(profile);
}

/** Constrói o filtro MongoDB para registros de um perfil.
 *  Inclui registros do próprio perfil + compartilhados. */
export function profileFilter(profile) {
  if (!profile || !AIRCRAFT_PROFILES.includes(profile)) {
    return { aircraftProfile: { $in: [DEFAULT_PROFILE, "shared"] } };
  }
  return { aircraftProfile: { $in: [profile, "shared"] } };
}

/** Valida e normaliza o perfil de um registro. */
export function normalizeProfile(profile) {
  if (AIRCRAFT_PROFILE_VALUES.includes(profile)) return profile;
  return DEFAULT_PROFILE;
}

/** Verifica se um registro pertence ao perfil (ou é compartilhado). */
export function recordMatchesProfile(record, profile) {
  if (!record) return false;
  const ap = record.aircraftProfile || DEFAULT_PROFILE;
  return ap === profile || ap === "shared";
}