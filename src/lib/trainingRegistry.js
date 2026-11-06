import { AW119_TRAINING } from "./aw119TrainingData";
import { H125_TRAINING } from "@/lib/h125TrainingData";

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
