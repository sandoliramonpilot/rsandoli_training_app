// Contexto de perfil de aeronave para o frontend.
// Gerencia seleção, persistência por sessão e helpers de filtragem.

export const AIRCRAFT_PROFILES = ["AW119", "H125"];
export const AIRCRAFT_PROFILE_VALUES = ["AW119", "H125", "shared"];
export const DEFAULT_PROFILE = "AW119";

const STORAGE_KEY = "aircraft_profile";

/** Lê o perfil selecionado da sessão atual. */
export function getSelectedProfile() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && AIRCRAFT_PROFILES.includes(stored)) return stored;
  } catch {}
  return DEFAULT_PROFILE;
}

/** Salva o perfil selecionado na sessão. */
export function setSelectedProfile(profile) {
  if (!AIRCRAFT_PROFILES.includes(profile)) return;
  try { sessionStorage.setItem(STORAGE_KEY, profile); } catch {}
}

/** Limpa o perfil selecionado (ao trocar de aeronave). */
export function clearSelectedProfile() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
}

/** Constrói o filtro para queries do SDK (inclui compartilhados). */
export function profileQueryFilter(profile) {
  const p = profile || getSelectedProfile();
  if (!AIRCRAFT_PROFILES.includes(p)) return { aircraftProfile: { $in: [DEFAULT_PROFILE, "shared"] } };
  return { aircraftProfile: { $in: [p, "shared"] } };
}

/** Rótulos amigáveis para exibição. */
export const PROFILE_LABELS = {
  AW119: "AW119",
  H125: "H125",
  shared: "Compartilhado",
};

/** Descrições para a tela de seleção. */
export const PROFILE_DESCRIPTIONS = {
  AW119: "Acessar o conteúdo e os recursos do AW119.",
  H125: "Acessar o conteúdo e os recursos do H125.",
};