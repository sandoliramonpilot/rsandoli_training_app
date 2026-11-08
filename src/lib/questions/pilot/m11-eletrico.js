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
  moduleId: "hidraulico",
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
  section: "Sistema Hidráulico",
  subsection: "",
  printedPage: "",
  pdfPage: "",
  applicability: "AS 350 B2 equipado com VEMD",
  verified: false,
};

export const M10_HIDRAULICO = [
  {
    ...BASE,
    questionCode: "H125-B2V-M10-Q001",
    chapterId: "hid_ch2",
    type: "single_choice",
    cognitiveLevel: "analysis",
    difficulty: "hard",
    questionText:
      "Qual é a diferença conceitual entre a chave de corte hidráulico no coletivo e o botão ACCU TST?",
    options: [
      { id: "A", text: "Os dois comandos têm exatamente a mesma atuação." },
      { id: "B", text: "O corte hidráulico despressuriza os acumuladores principais, enquanto o ACCU TST também atua no compensador do rotor de cauda." },
      { id: "C", text: "O ACCU TST opera somente o sistema elétrico." },
      { id: "D", text: "A chave de corte hidráulico atua somente no servocomando traseiro." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "O manual descreve atuações diferentes. O ACCU TST também despressuriza o compensador de esforços do rotor de cauda, aspecto relevante para testes e treinamento.",
    source: { ...FONTE, subsection: "ACCU TST e corte hidráulico" },
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
    questionCode: "H125-B2V-M10-Q002",
    chapterId: "hid_ch1",
    type: "single_choice",
    cognitiveLevel: "comprehension",
    difficulty: "medium",
    questionText:
      "Quantos servocomandos principais e quantos servocomandos traseiros compõem a arquitetura hidráulica descrita?",
    options: [
      { id: "A", text: "Dois principais e dois traseiros." },
      { id: "B", text: "Três principais e um traseiro." },
      { id: "C", text: "Quatro principais e um traseiro." },
      { id: "D", text: "Três principais e dois traseiros." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "A arquitetura inclui três servocomandos principais e um servocomando traseiro, além dos acumuladores de segurança e do compensador de esforços do rotor de cauda.",
    source: { ...FONTE, subsection: "Arquitetura" },
    applicability: {
      classification: "configuration_dependent",
      aircraftVariant: AIRCRAFT_VARIANT,
      requiredEquipment: ["VEMD"],
      confirmed: false,
    },
    requiredEquipment: ["VEMD"],
  },
];
