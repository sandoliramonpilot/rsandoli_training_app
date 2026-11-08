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
  moduleId: "motor_arriel",
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
  section: "Motor Arriel 1D1",
  subsection: "",
  printedPage: "",
  pdfPage: "",
  applicability: "AS 350 B2 equipado com VEMD",
  verified: false,
};

export const M05_MOTOR = [
  {
    ...BASE,
    questionCode: "H125-B2V-M05-Q001",
    chapterId: "mot_ch1",
    type: "single_choice",
    cognitiveLevel: "comprehension",
    difficulty: "medium",
    questionText:
      "Qual é a arquitetura geral descrita para o motor Arriel 1D1 na fonte?",
    options: [
      { id: "A", text: "Motor a pistão com redução direta." },
      { id: "B", text: "Turboeixo modular com compressor, geradora de gases e turbina livre." },
      { id: "C", text: "Turbojato de fluxo único sem redução." },
      { id: "D", text: "Motor elétrico com gerador integrado." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "O Arriel 1D1 é um turboeixo modular, com compressor axial, geradora de gases, turbina livre, redução e eixo de saída de potência.",
    source: { ...FONTE, subsection: "Arquitetura" },
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
    questionCode: "H125-B2V-M05-Q002",
    chapterId: "mot_ch3",
    type: "single_choice",
    cognitiveLevel: "comprehension",
    difficulty: "medium",
    questionText:
      "Quais parâmetros do motor são integrados na página FLI do VEMD?",
    options: [
      { id: "A", text: "Apenas o torque." },
      { id: "B", text: "Ng, t4 e torque." },
      { id: "C", text: "Apenas Ng e Nf." },
      { id: "D", text: "Somente a temperatura do óleo." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "A página FLI integra Ng, t4 e torque para determinar a primeira limitação atingida, permitindo ao piloto monitorar o regime de potência.",
    source: { ...FONTE, subsection: "Integração ao VEMD" },
    applicability: {
      classification: "configuration_dependent",
      aircraftVariant: AIRCRAFT_VARIANT,
      requiredEquipment: ["VEMD"],
      confirmed: false,
    },
    requiredEquipment: ["VEMD"],
  },
];
