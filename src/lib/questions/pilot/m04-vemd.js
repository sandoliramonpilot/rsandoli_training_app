import { COURSE_ID, TRAINING_SECTION, AIRCRAFT_FAMILY, AIRCRAFT_MODEL, AIRCRAFT_VARIANT, AVIONICS_CONFIGURATION } from "../schema";

const BASE = {
  courseId: COURSE_ID,
  trainingSection: TRAINING_SECTION,
  aircraftFamily: AIRCRAFT_FAMILY,
  aircraftModel: AIRCRAFT_MODEL,
  aircraftVariant: AIRCRAFT_VARIANT,
  avionicsConfiguration: AVIONICS_CONFIGURATION,
  moduleId: "vemd",
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
  section: "VEMD",
  subsection: "",
  printedPage: "",
  pdfPage: "",
  applicability: "AS 350 B2 equipado com VEMD",
  verified: false,
};

export const M04_VEMD = [
  {
    ...BASE,
    questionCode: "H125-B2V-M04-Q001",
    chapterId: "vemd_ch3",
    type: "single_choice",
    cognitiveLevel: "comprehension",
    difficulty: "medium",
    questionText: "Qual comando muda manualmente as páginas do VEMD no modo FLIGHT?",
    options: [
      { id: "A", text: "RESET" },
      { id: "B", text: "SELECT" },
      { id: "C", text: "SCROLL" },
      { id: "D", text: "ENTER" },
    ],
    correctAnswer: ["C"],
    answerExplanation:
      "O comando SCROLL permite mudar manualmente as páginas no modo FLIGHT. RESET retorna à configuração nominal, SELECT seleciona um campo e ENTER valida o dado selecionado.",
    incorrectOptionExplanations: {
      A: "RESET retorna à configuração nominal da exibição.",
      B: "SELECT seleciona o campo que será modificado.",
      D: "ENTER valida o valor selecionado.",
    },
    source: { ...FONTE, subsection: "Comandos" },
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
    questionCode: "H125-B2V-M04-Q002",
    chapterId: "vemd_ch1",
    type: "single_choice",
    cognitiveLevel: "comprehension",
    difficulty: "medium",
    questionText:
      "Quantas linhas computacionais e quantas telas compõem a arquitetura do VEMD descrita na fonte?",
    options: [
      { id: "A", text: "Uma linha computacional e duas telas." },
      { id: "B", text: "Duas linhas computacionais e duas telas." },
      { id: "C", text: "Duas linhas computacionais e uma tela." },
      { id: "D", text: "Três linhas computacionais e duas telas." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "O VEMD possui duas linhas computacionais independentes e duas telas, o que permite operação com uma linha remanescente em caso de falha.",
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
    questionCode: "H125-B2V-M04-Q003",
    chapterId: "vemd_ch2",
    type: "single_choice",
    cognitiveLevel: "recall",
    difficulty: "easy",
    questionText: "Quais são os três modos principais do VEMD?",
    options: [
      { id: "A", text: "FLIGHT, CONFIG e MAINT." },
      { id: "B", text: "NORMAL, DEGRADED e EMERGENCY." },
      { id: "C", text: "FLIGHT, GROUND e TEST." },
      { id: "D", text: "AUTO, MANUAL e STANDBY." },
    ],
    correctAnswer: ["A"],
    answerExplanation:
      "O VEMD opera em três modos principais: FLIGHT, para operação em voo; CONFIG, para configuração; e MAINT, para manutenção.",
    source: { ...FONTE, subsection: "Modos" },
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
    questionCode: "H125-B2V-M04-Q004",
    chapterId: "vemd_ch9",
    type: "scenario",
    cognitiveLevel: "analysis",
    difficulty: "hard",
    questionText:
      "Durante a inicialização, o VEMD apresenta indicação de falha em uma das linhas computacionais e solicita o desligamento dessa linha. Qual é o conceito avaliado?",
    options: [
      { id: "A", text: "Perda total das duas telas." },
      { id: "B", text: "Isolamento da linha em falha e operação pela linha remanescente." },
      { id: "C", text: "Necessidade de selecionar o modo MAINT." },
      { id: "D", text: "Mudança automática para a página PERFORMANCE." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "A arquitetura com duas linhas computacionais permite isolar a linha em falha e continuar a operação com a linha remanescente. A ação específica deve ser confirmada na documentação aprovada da aeronave.",
    source: { ...FONTE, subsection: "Operação degradada" },
    applicability: {
      classification: "configuration_dependent",
      aircraftVariant: AIRCRAFT_VARIANT,
      requiredEquipment: ["VEMD"],
      confirmed: false,
    },
    requiredEquipment: ["VEMD"],
  },
];
