export * from "./schema";
export * from "./validacao";
export { PILOT_QUESTIONS } from "./pilot";

import { PILOT_QUESTIONS } from "./pilot";
import { validarLote } from "./validacao";

/** Valida o lote piloto. Rode no console ou em teste. */
export function validarLotePiloto() {
  return validarLote(PILOT_QUESTIONS);
}
