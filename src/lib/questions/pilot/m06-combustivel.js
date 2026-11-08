import {
  COURSE_ID, TRAINING_SECTION, AIRCRAFT_FAMILY,
  AIRCRAFT_MODEL, AIRCRAFT_VARIANT, AVIONICS_CONFIGURATION,
} from "../schema";

const BASE = {
  courseId: COURSE_ID,
  trainingSection: TRAINING_SECTION,
  aircraftFamily: AIRCRAFT_FAMILY,
  aircraftModel: AIRCRAFT_MODEL,
  aircraftVariant: AIRCRAFT_VARIANT,
  avionicsConfiguration: AVIONICS_CONFIGURATION,
  moduleId: "combustivel",
  status: "technical_review",
  active: false,
  version: 1,
  safetyCritical: false,
  memoryItem: false,
  optionalEquipment: false,
};

const FONTE = {
  documentTitle: "THP AS 350 B2 VEMD-PORTUG",
  documentCode: "",
  issuer: "",
  revision: "",
  revisionDate: "",
  section: "Sistema de Combustível",
  subsection: "",
  printedPage: "",
  pdfPage: "",
  applicability: "AS 350 B2 equipado com VEMD",
  verified: false,
};

export const M06_COMBUSTIVEL = [
  {
    ...BASE,
    questionCode: "H125-B2V-M06-Q001",
    chapterId: "comb_ch1",
    type: "single_choice",
    cognitiveLevel: "comprehension",
    difficulty: "medium",
    questionText:
      "Qual é a função da válvula de bypass no sistema de combustível descrito?",
    options: [
      { id: "A", text: "Interromper o fluxo de combustível ao motor." },
      { id: "B", text: "Permitir a passagem de combustível em caso de entupimento do filtro." },
      { id: "C", text: "Regular a pressão do combustível na câmara de combustão." },
      { id: "D", text: "Medir a quantidade de combustível no tanque." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "A válvula de bypass permite a passagem de combustível ao motor em caso de entupimento do filtro, garantindo continuidade da alimentação. A indicação associada é FUEL FILT.",
    source: { ...FONTE, subsection: "Filtro e bypass" },
    applicability: {
      classification: "configuration_dependent",
      aircraftVariant: AIRCRAFT_VARIANT,
      requiredEquipment: ["VEMD"],
      confirmed: false,
    },
    requiredEquipment: ["VEMD"],
  },
  {
    ...BASE,
    questionCode: "H125-B2V-M06-Q002",
    chapterId: "comb_ch2",
    type: "single_choice",
    cognitiveLevel: "recall",
    difficulty: "easy",
    questionText:
      "Qual indicação está associada à pressão do combustível no VEMD?",
    options: [
      { id: "A", text: "FUEL" },
      { id: "B", text: "FUEL P" },
      { id: "C", text: "FUEL FILT" },
      { id: "D", text: "FUEL QTY" },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "FUEL P refere-se à pressão do combustível. FUEL refere-se à quantidade e FUEL FILT ao filtro de combustível.",
    source: { ...FONTE, subsection: "Indicações e alertas" },
    applicability: {
      classification: "configuration_dependent",
      aircraftVariant: AIRCRAFT_VARIANT,
      requiredEquipment: ["VEMD"],
      confirmed: false,
    },
    requiredEquipment: ["VEMD"],
  },
];
