// src/lib/weightBalance/aw119.js
// ATENÇÃO: valores marcados com PLACEHOLDER precisam ser confirmados na Seção 6 do RFM do AW119 MKII.
// Limites de envelope já confirmados (Seção 1, Figures 1-2 e 1-4). Braços das estações pendentes.

export const AW119 = {
  id: "aw119",
  label: "AW119 MKII / Kx",
  shortLabel: "AW119",
  maxWeight: 2850,
  maxExternalWeight: 2850,
  fuelDensity: 0.79,
  fuelMaxLiters: 605,
  datum: "1785 mm à frente do jack point dianteiro",
  cgLimits: {
    longitudinal: [
      { upTo: 2160, forward: 3.284, rearward: 3.580 },
      { upTo: 2850, forward: 3.392, rearward: 3.528 },
    ],
    lateral: { left: -0.053, right: 0.053 },
  },
  stations: [
    { id: "pilot",     label: "Piloto",                arm: null, lateral: 0.350,  max: 160 },
    { id: "copilot",   label: "Copiloto / Pax diant.", arm: null, lateral: -0.325, max: 160 },
    { id: "rear_rh",   label: "Pax traseiro direito",  arm: null, lateral: null,   max: 160 },
    { id: "rear_lh",   label: "Pax traseiro esquerdo", arm: null, lateral: null,   max: 160 },
    { id: "cabin",     label: "Carga na cabine",       arm: null, lateral: 0,      max: 120 },
    { id: "hold_rh",   label: "Bagageiro direito",     arm: null, lateral: null,   max: 100 },
    { id: "hold_lh",   label: "Bagageiro esquerdo",    arm: null, lateral: null,   max: 100 },
    { id: "fuel",      label: "Combustível (L)",       arm: 0,    lateral: 0,      max: 605, isFuel: true },
    { id: "external",  label: "Carga externa",         arm: null, lateral: 0,      max: 1400, isExternal: true },
  ],
};
