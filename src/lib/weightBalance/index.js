// src/lib/weightBalance/index.js
import { AW119 } from "./aw119";
import { AS350B2 } from "./as350b2";
import { AS350B3 } from "./as350b3";

export const WEIGHT_BALANCE_PROFILES = {
  AW119,
  AS350B2,
  AS350B3,
};

// Mapeia o perfil de aeronave do app para a configuração de peso e balanceamento
export function getWeightBalanceConfig(aircraftProfile) {
  const key = String(aircraftProfile || "").toUpperCase().replace(/\s/g, "");
  if (key === "AW119") return AW119;
  if (key === "AS350B2" || key === "H125B2") return AS350B2;
  if (key === "AS350B3" || key === "H125" || key === "H125B3") return AS350B3;
  return AS350B3; // fallback
}

export const FUEL_MOMENT_TABLE = [
  { kg: 20,  moment: 69.5 },
  { kg: 40,  moment: 139 },
  { kg: 60,  moment: 208.5 },
  { kg: 80,  moment: 278 },
  { kg: 100, moment: 347.5 },
  { kg: 120, moment: 417 },
  { kg: 140, moment: 486.5 },
  { kg: 160, moment: 556 },
  { kg: 180, moment: 625.5 },
  { kg: 200, moment: 695 },
  { kg: 220, moment: 764.5 },
  { kg: 240, moment: 834 },
  { kg: 260, moment: 903.5 },
  { kg: 280, moment: 973 },
  { kg: 300, moment: 1042.5 },
  { kg: 320, moment: 1112 },
  { kg: 340, moment: 1181.5 },
  { kg: 360, moment: 1251 },
  { kg: 380, moment: 1320.5 },
  { kg: 400, moment: 1390 },
  { kg: 420, moment: 1459.5 },
  { kg: 427, moment: 1484 },
];
