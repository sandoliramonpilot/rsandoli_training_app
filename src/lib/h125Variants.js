// Sub-variantes do módulo H125.
//
// O módulo H125 abrange duas aeronaves distintas quanto a motor, aviônica e
// controle de potência:
//   - AS350 B2 VEMD  (motor Arriel 1D1, controle hidromecânico, display VEMD)
//   - AS350 B3e      (motor Arriel 2D, FADEC dual-channel)
//
// A sub-variante ativa é uma preferência de sessão persistida localmente e só
// é relevante quando o perfil H125 está selecionado. Resolveores de conteúdo
// (treinamento, questões, checklists, QRH, limitações, procedimentos) devem
// consultar getStoredH125Subvariant() para selecionar o conjunto de dados
// correto. Conteúdo técnico sem fonte aprovada permanece marcado como PENDENTE.

export const H125_SUBVARIANTS = [
  {
    id: "b2_vemd",
    label: "AS350 B2 VEMD",
    short: "B2 VEMD",
    engine: "Arriel 1D1",
    avionics: "VEMD",
    control: "Hidromecânico",
    description:
      "AS350 B2 com VEMD e motor Arriel 1D1 (controle hidromecânico). Material-base: THP AS 350 B2 VEMD-PORTUG.",
  },
  {
    id: "b3e_arriel2d",
    label: "AS350 B3e / Arriel 2D",
    short: "B3e",
    engine: "Arriel 2D",
    avionics: "FADEC",
    control: "FADEC dual-channel",
    description:
      "AS350B3e com FADEC e motor Arriel 2D (controle eletrônico redundante).",
  },
];

export const DEFAULT_H125_SUBVARIANT = "b2_vemd";

const STORAGE_KEY = "h125_subvariant";

export function isValidH125Subvariant(id) {
  return H125_SUBVARIANTS.some((v) => v.id === id);
}

export function getH125Subvariant(id) {
  return H125_SUBVARIANTS.find((v) => v.id === id) || null;
}

/** Lê a sub-variante persistida — usado por resolvedores de dados. */
export function getStoredH125Subvariant() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidH125Subvariant(stored)) return stored;
  } catch {}
  return DEFAULT_H125_SUBVARIANT;
}

/** Salva a sub-variante selecionada. */
export function setStoredH125Subvariant(id) {
  if (!isValidH125Subvariant(id)) return;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {}
}

/** Resolvedor unificado: recebe um valor de perfil (AW119/H125) e devolve a
 *  sub-variante ativa quando aplicável, ou null caso contrário. */
export function activeSubvariantFor(profileValue) {
  if (profileValue !== "H125") return null;
  return getStoredH125Subvariant();
}