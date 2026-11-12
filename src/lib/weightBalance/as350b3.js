// src/lib/weightBalance/as350b3.js
// Fonte: AS350 B3 (Arriel 2B1) — Complementary Flight Manual, Seções 6.1 a 6.5

export const AS350B3 = {
  id: "as350b3",
  label: "AS350 B3 / H125",
  shortLabel: "AS350 B3",
  maxWeight: 2250,
  maxExternalWeight: 2800,
  fuelDensity: 0.79,
  fuelMaxLiters: 540,
  datum: "3,40 m à frente do centro do rotor principal",
  cgLimits: {
    longitudinal: [
      { upTo: 1900, forward: 3.17, rearward: 3.55 },
      { upTo: 2250, forward: 3.29, rearward: 3.43 },
    ],
    lateral: { left: -0.18, right: 0.14 },
  },
  stations: [
    { id: "pilot",     label: "Piloto",                arm: 1.55, lateral: 0.36,   max: 160 },
    { id: "copilot",   label: "Copiloto / Pax diant.", arm: 1.55, lateral: -0.36,  max: 160 },
    { id: "rear_rh",   label: "Pax traseiro direito",  arm: 2.54, lateral: 0.207,  max: 160 },
    { id: "rear_lh",   label: "Pax traseiro esquerdo", arm: 2.54, lateral: -0.207, max: 160 },
    { id: "cabin",     label: "Carga na cabine",       arm: 2.25, lateral: 0,      max: 120 },
    { id: "hold_rh",   label: "Soute lateral direito", arm: 3.20, lateral: 0.62,   max: 100 },
    { id: "hold_lh",   label: "Soute lateral esquerdo",arm: 3.20, lateral: -0.62,  max: 100 },
    { id: "hold_rear", label: "Soute traseiro",        arm: 4.60, lateral: 0,      max: 50 },
    { id: "fuel",      label: "Combustível (L)",       arm: 0,    lateral: 0,      max: 540, isFuel: true },
    { id: "external",  label: "Carga externa",         arm: 3.17, lateral: 0,      max: 1400, isExternal: true },
  ],
};
