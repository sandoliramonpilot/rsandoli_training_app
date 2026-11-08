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
  moduleId: "generalidades",
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
  section: "Generalidades",
  subsection: "",
  printedPage: "",
  pdfPage: "",
  applicability: "AS 350 B2 equipado com VEMD",
  verified: false,
};

export const M02_GENERALIDADES = [
  {
    ...BASE,
    questionCode: "H125-B2V-M02-Q001",
    chapterId: "gen_ch4",
    type: "single_choice",
    cognitiveLevel: "recall",
    difficulty: "easy",
    questionText: "O que significa a abreviatura FLI no contexto do AS 350 B2 VEMD?",
    options: [
      { id: "A", text: "Flight Level Indicator." },
      { id: "B", text: "Fuel Limitation Index." },
      { id: "C", text: "Indicador da Primeira Limitação." },
      { id: "D", text: "Flight Load Information." },
    ],
    correctAnswer: ["C"],
    answerExplanation:
      "FLI é a abreviatura de Indicador da Primeira Limitação, conceito central para interpretação de potência no VEMD.",
    source: { ...FONTE, subsection: "Símbolos e abreviaturas" },
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
    questionCode: "H125-B2V-M02-Q002",
    chapterId: "gen_ch4",
    type: "single_choice",
    cognitiveLevel: "comprehension",
    difficulty: "medium",
    questionText:
      "Qual é a diferença conceitual entre IGE e OGE no contexto de desempenho?",
    options: [
      { id: "A", text: "IGE refere-se a voo pairado fora do efeito solo; OGE, dentro." },
      { id: "B", text: "IGE refere-se a voo pairado dentro do efeito solo; OGE, fora." },
      { id: "C", text: "Ambos se referem ao mesmo regime de voo." },
      { id: "D", text: "IGE aplica-se apenas a pouso e OGE apenas a decolagem." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "IGE significa In Ground Effect, voo pairado dentro do efeito solo. OGE significa Out of Ground Effect, voo pairado fora do efeito solo. São regimes distintos, com desempenho diferente.",
    source: { ...FONTE, subsection: "Símbolos e abreviaturas" },
    applicability: {
      classification: "basic_aircraft",
      aircraftVariant: AIRCRAFT_VARIANT,
      requiredEquipment: [],
      confirmed: false,
    },
    requiredEquipment: [],
  },
];
