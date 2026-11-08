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
  moduleId: "integracao_documental",
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
  section: "Integração e Controle Documental",
  subsection: "",
  printedPage: "",
  pdfPage: "",
  applicability: "AS 350 B2 equipado com VEMD",
  verified: false,
};

export const M01_DOCUMENTAL = [
  {
    ...BASE,
    questionCode: "H125-B2V-M01-Q001",
    chapterId: "doc_ch1",
    type: "single_choice",
    cognitiveLevel: "comprehension",
    difficulty: "medium",
    questionText:
      "O que deve ser confirmado antes de aplicar uma informação técnica do conteúdo didático a uma aeronave específica?",
    options: [
      { id: "A", text: "Apenas que a aeronave pertence à família H125." },
      { id: "B", text: "Variante, configuração, modificações, suplementos e revisão aplicável." },
      { id: "C", text: "Apenas que a aeronave está equipada com VEMD." },
      { id: "D", text: "A informação mais recente registrada no aplicativo." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "A aplicabilidade depende da variante, da configuração, das modificações e da documentação incorporada. O manual diferencia revisões e suplementos, que podem alterar o conteúdo básico.",
    incorrectOptionExplanations: {
      A: "A família sozinha não define aplicabilidade técnica.",
      C: "A presença do VEMD é condição necessária, mas não suficiente.",
      D: "A data no aplicativo não substitui a revisão documental aplicável.",
    },
    source: { ...FONTE, subsection: "Aplicabilidade" },
    applicability: {
      classification: "basic_aircraft",
      aircraftVariant: AIRCRAFT_VARIANT,
      requiredEquipment: [],
      confirmed: false,
    },
    requiredEquipment: [],
  },
  {
    ...BASE,
    questionCode: "H125-B2V-M01-Q002",
    chapterId: "doc_ch1",
    type: "single_choice",
    cognitiveLevel: "comprehension",
    difficulty: "medium",
    questionText:
      "Qual é a função dos suplementos em relação ao manual básico da aeronave?",
    options: [
      { id: "A", text: "Substituir integralmente o manual básico." },
      { id: "B", text: "Tratar diferenças em relação ao manual básico." },
      { id: "C", text: "Registrar apenas informações de manutenção." },
      { id: "D", text: "Documentar somente equipamentos de missão." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "Os suplementos tratam diferenças em relação ao manual básico, decorrentes de configurações, modificações ou equipamentos instalados. Eles não substituem o manual básico.",
    source: { ...FONTE, subsection: "Suplementos" },
    applicability: {
      classification: "basic_aircraft",
      aircraftVariant: AIRCRAFT_VARIANT,
      requiredEquipment: [],
      confirmed: false,
    },
    requiredEquipment: [],
  },
];
