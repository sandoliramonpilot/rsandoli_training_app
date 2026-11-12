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

// Calcula um estado de carregamento (decolagem ou pouso)
function computeState(config, inputs, fuelLiters) {
  const rows = [];
  let totalWeight = 0;
  let totalMoment = 0;
  let totalLateral = 0;

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
      weight = fuelLiters * config.fuelDensity;
      if (weight <= 0) continue;
      moment = interpolateFuelMoment(weight);
    } else {
      if (st.arm == null) continue;
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

export function calculateWeightBalance(config, inputs) {
  const fuelInitial = Number(inputs.fuel) || 0;
  const fuelBurned = Number(inputs.fuelBurned) || 0;
  const fuelLanding = Math.max(0, fuelInitial - fuelBurned);

  const takeoff = computeState(config, inputs, fuelInitial);
  const landing = computeState(config, inputs, fuelLanding);

  // Compara os dois estados para detectar deslocamento de CG
  const cgShift = landing.cgLong - takeoff.cgLong;
  const weightLoss = takeoff.totalWeight - landing.totalWeight;

  // Alerta se algum dos dois estados sair do envelope
  const anyOutOfLimits = !takeoff.ok || !landing.ok;

  return {
    takeoff,
    landing,
    fuelInitial,
    fuelBurned,
    fuelLanding,
    cgShift,
    weightLoss,
    anyOutOfLimits,
    // Compatibilidade com o código anterior (usa decolagem como principal)
    ...takeoff,
    ok: !anyOutOfLimits,
  };
}

/**
 * Varre o consumo de combustível em passos e encontra o instante exato
 * em que o CG cruza um limite do envelope.
 * Retorna null se o CG nunca cruzar durante a missão.
 */
export function findCriticalPoint(config, inputs) {
  const fuelInitial = Number(inputs.fuel) || 0;
  const fuelBurned = Number(inputs.fuelBurned) || 0;

  if (fuelInitial <= 0 || fuelBurned <= 0) return null;

  const STEP = 0.5; // litros por passo
  const steps = Math.ceil(fuelBurned / STEP);

  let prev = null;
  let prevBurned = 0;

  for (let i = 0; i <= steps; i++) {
    const burned = Math.min(i * STEP, fuelBurned);
    const remaining = Math.max(0, fuelInitial - burned);
    const state = computeState(config, inputs, remaining);

    const violation = classifyViolation(state, config);

    if (prev && prev.violation !== violation && violation !== null) {
      // Cruzou um limite entre prevBurned e burned — refina por bisseção
      const refined = refineCrossing(config, inputs, fuelInitial, prevBurned, burned, violation);
      return {
        burnedLiters: refined.burned,
        remainingLiters: fuelInitial - refined.burned,
        fuelPercent: (refined.burned / fuelInitial) * 100,
        violation,
        state: refined.state,
        previousViolation: prev.violation,
      };
    }

    prev = { violation, state };
    prevBurned = burned;
  }

  // Se já começa violando, o ponto crítico é o início
  const startState = computeState(config, inputs, fuelInitial);
  const startViolation = classifyViolation(startState, config);
  if (startViolation) {
    return {
      burnedLiters: 0,
      remainingLiters: fuelInitial,
      fuelPercent: 0,
      violation: startViolation,
      state: startState,
      previousViolation: null,
    };
  }

  return null;
}

function classifyViolation(state, config) {
  if (state.overweight) return "overweight";
  if (state.cgOutForward) return "forward";
  if (state.cgOutRearward) return "rearward";
  if (state.cgOutLateral) return "lateral";
  return null;
}

function refineCrossing(config, inputs, fuelInitial, burnedFrom, burnedTo, targetViolation) {
  let lo = burnedFrom;
  let hi = burnedTo;

  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const state = computeState(config, inputs, fuelInitial - mid);
    const v = classifyViolation(state, config);

    if (v === targetViolation) hi = mid;
    else lo = mid;
  }

  const burned = hi;
  const state = computeState(config, inputs, fuelInitial - burned);
  return { burned, state };
}

export const VIOLATION_LABELS = {
  overweight: "Peso acima do máximo",
  forward: "CG à frente do limite dianteiro",
  rearward: "CG atrás do limite traseiro",
  lateral: "CG lateral fora do envelope",
};
