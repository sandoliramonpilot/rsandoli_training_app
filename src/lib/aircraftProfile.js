// Contexto de perfil de aeronave para o frontend.
// Gerencia seleção, persistência entre sessões e helpers de filtragem.
// Separação total: nenhum conteúdo é compartilhado entre AW119 e H125.

export const AIRCRAFT_PROFILES = ["AW119", "H125"];
export const AIRCRAFT_PROFILE_VALUES = ["AW119", "H125"];
export const DEFAULT_PROFILE = "AW119";

const STORAGE_KEY = "aircraft_profile";

/** Lê o perfil selecionado (persistido entre sessões). */
export function getSelectedProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && AIRCRAFT_PROFILES.includes(stored)) return stored;
  } catch {}
  return DEFAULT_PROFILE;
}

/** Salva o perfil selecionado. */
export function setSelectedProfile(profile) {
  if (!AIRCRAFT_PROFILES.includes(profile)) return;
  try {
    localStorage.setItem(STORAGE_KEY, profile);
  } catch {}
}

/** Limpa o perfil selecionado (ao trocar de aeronave). */
export function clearSelectedProfile() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/** Constrói o filtro para queries do SDK. Separação total: apenas o perfil ativo. */
export function profileQueryFilter(profile) {
  const p = profile || getSelectedProfile();
  if (!AIRCRAFT_PROFILES.includes(p)) return { aircraftProfile: DEFAULT_PROFILE };
  return { aircraftProfile: p };
}

/** Rótulos amigáveis para exibição. */
export const PROFILE_LABELS = {
  AW119: "AW119",
  H125: "H125",
};

/** Descrições para a tela de seleção. */
export const PROFILE_DESCRIPTIONS = {
  AW119: "Acessar o conteúdo e os recursos do AW119.",
  H125: "Acessar o conteúdo e os recursos do H125.",
};
