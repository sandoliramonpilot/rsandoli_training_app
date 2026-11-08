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

export const TRAINING_BY_AIRCRAFT = {
  AW119: {
    data: AW119_TRAINING,
    discipline: "aw119_training",
    label: "Leonardo AW119Kx Koala",
  },
  H125: {
    data: H125_TRAINING,
    discipline: "h125_training",
    label: "Airbus AS 350 B2 VEMD",
  },
};

export const AIRCRAFTS = Object.keys(TRAINING_BY_AIRCRAFT);

export function getTraining(aeronave) {
  return TRAINING_BY_AIRCRAFT[aeronave] ?? null;
}
