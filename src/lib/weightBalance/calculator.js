// src/lib/weightBalance/calculator.js
import { FUEL_MOMENT_TABLE } from "./index";

export function interpolateFuelMoment(kg) {
  if (!kg || kg <= 0) return 0;
  const table = FUEL_MOMENT_TABLE;
  if (kg <= table[0].kg) return (kg / table[0].kg) * table[0].moment;
  const last = table[table.length - 1];
  if (kg >= last.kg) return (kg / last.kg) * last.moment;

  for (let i = 1; i < table.length; i++) {
    if (kg <= table[i].kg) {
      const a = table[i - 1];
      const b = table[i];
      const t = (kg - a.kg) / (b.kg - a.kg);
      return a.moment + t * (b.moment - a.moment);
    }
  }
  return 0;
}

export function calculateWeightBalance(config, inputs) {
  const rows = [];
  let totalWeight = 0;
  let totalMoment = 0;
  let totalLateral = 0;

  // Peso vazio equipado (vem do cadastro da aeronave)
  const eew = Number(inputs.emptyWeight) || 0;
  const eewCg = Number(inputs.emptyCg) || 0;
  if (eew > 0) {
    rows.push({
      id: "eew",
      label: "Peso vazio equipado (EEW)",
      weight: eew,
      arm: eewCg,
      moment: eew * eewCg,
      lateral: 0,
      locked: true,
    });
    totalWeight += eew;
    totalMoment += eew * eewCg;
  }

  for (const st of config.stations) {
    const raw = Number(inputs[st.id]) || 0;
    if (raw <= 0) continue;

    let weight = raw;
    let moment;

    if (st.isFuel) {
      // Entrada em litros; converte para kg pela densidade do manual
      weight = raw * config.fuelDensity;
      moment = interpolateFuelMoment(weight);
    } else {
      if (st.arm == null) continue; // estação ainda sem braço configurado
      moment = raw * st.arm;
    }

    rows.push({
      id: st.id,
      label: st.label,
      weight,
      arm: weight > 0 ? moment / weight : 0,
      moment,
      lateral: weight * (st.lateral || 0),
    });

    totalWeight += weight;
    totalMoment += moment;
    totalLateral += weight * (st.lateral || 0);
  }

  const cgLong = totalWeight > 0 ? totalMoment / totalWeight : 0;
  const cgLat = totalWeight > 0 ? totalLateral / totalWeight : 0;

  const limits =
    config.cgLimits.longitudinal.find((l) => totalWeight <= l.upTo) ||
    config.cgLimits.longitudinal[config.cgLimits.longitudinal.length - 1];

  const hasExternal = (Number(inputs.external) || 0) > 0;
  const maxAllowed = hasExternal ? config.maxExternalWeight : config.maxWeight;

  const overweight = totalWeight > maxAllowed;
  const cgOutForward = cgLong < limits.forward;
  const cgOutRearward = cgLong > limits.rearward;
  const cgOutLateral =
    cgLat < config.cgLimits.lateral.left || cgLat > config.cgLimits.lateral.right;

  return {
    rows,
    totalWeight,
    totalMoment,
    cgLong,
    cgLat,
    limits,
    maxAllowed,
    hasExternal,
    overweight,
    cgOutForward,
    cgOutRearward,
    cgOutLateral,
    ok: !overweight && !cgOutForward && !cgOutRearward && !cgOutLateral,
  };
}
