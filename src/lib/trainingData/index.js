import { AW119_TRAINING, TREINAMENTOS_GERAIS, PENDING_CONTENT, DIDATIC_NOTICE } from "./aw119Training";
import { H125_TRAINING } from "./h125Training";
import { TREINAMENTOS_GERAIS } from "./treinamentosGerais";
import { PENDING_CONTENT, DIDATIC_NOTICE } from "./notices";

import {
  AW119_TRAINING,
  TREINAMENTOS_GERAIS,
  PENDING_CONTENT,
  DIDATIC_NOTICE,
} from "./aw119Training";
import { H125_TRAINING } from "./h125Training";

export {
  AW119_TRAINING,
  H125_TRAINING,
  TREINAMENTOS_GERAIS,
  PENDING_CONTENT,
  DIDATIC_NOTICE,
};

export { AW119_TRAINING, H125_TRAINING, TREINAMENTOS_GERAIS, PENDING_CONTENT, DIDATIC_NOTICE };

export const TRAINING_BY_AIRCRAFT = {
  AW119: {
    data: AW119_TRAINING,
    discipline: "aw119_training",
    label: "Leonardo AW119Kx Koala",
    name: "AW119 TRAINING",
  },
  H125: {
    data: H125_TRAINING,
    discipline: "h125_training",
    label: "Airbus H125",
    name: "H125 TRAINING",
  },
};

export const AIRCRAFTS = Object.keys(TRAINING_BY_AIRCRAFT);

export function getTraining(aeronave) {
  return TRAINING_BY_AIRCRAFT[aeronave] ?? null;
}
