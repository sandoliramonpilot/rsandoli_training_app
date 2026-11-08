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
  moduleId: "eletrico",
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
  section: "Sistema Elétrico",
  subsection: "",
  printedPage: "",
  pdfPage: "",
  applicability: "AS 350 B2 equipado com VEMD",
  verified: false,
};

export const M11_ELETRICO = [
  {
    ...BASE,
    questionCode: "H125-B2V-M11-Q001",
    chapterId: "ele_ch2",
    type: "single_choice",
    cognitiveLevel: "comprehension",
    difficulty: "medium",
    questionText:
      "Qual é a finalidade do EMER SHED no sistema elétrico descrito?",
    options: [
      { id: "A", text: "Aumentar a geração de energia em voo." },
      { id: "B", text: "Preservar alimentação de barramentos essenciais em condição de emergência." },
      { id: "C", text: "Substituir a bateria em caso de falha." },
      { id: "D", text: "Recarregar a bateria durante o voo." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "O EMER SHED preserva a alimentação de barramentos essenciais em condição de emergência, mantendo os equipamentos críticos energizados.",
    source: { ...FONTE, subsection: "Modos de alimentação" },
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
    questionCode: "H125-B2V-M11-Q002",
    chapterId: "ele_ch1",
    type: "single_choice",
    cognitiveLevel: "recall",
    difficulty: "easy",
    questionText:
      "Qual é o valor da tensão do sistema DC regulado descrito na fonte?",
    options: [
      { id: "A", text: "12 V" },
      { id: "B", text: "24 V" },
      { id: "C", text: "28 V" },
      { id: "D", text: "115 V" },
    ],
    correctAnswer: ["C"],
    answerExplanation:
      "A configuração descrita possui sistema DC regulado em 28 V, com arranque-gerador, bateria e tomada de fonte externa.",
    source: { ...FONTE, subsection: "Geração DC" },
    applicability: {
      classification: "configuration_dependent",
      aircraftVariant: AIRCRAFT_VARIANT,
      requiredEquipment: ["VEMD"],
      confirmed: false,
    },
    requiredEquipment: ["VEMD"],
  },
];
