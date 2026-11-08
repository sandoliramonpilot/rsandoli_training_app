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
  moduleId: "peso_balanceamento",
  status: "technical_review",
  active: false,
  version: 1,
  safetyCritical: true,
  memoryItem: false,
  optionalEquipment: false,
};

const FONTE = {
  documentTitle: "THP AS 350 B2 VEMD-PORTUG",
  documentCode: "",
  issuer: "",
  revision: "Edição original",
  revisionDate: "",
  section: "Peso e Balanceamento",
  subsection: "",
  printedPage: "6-1",
  pdfPage: "",
  applicability: "AS 350 B2 equipado com VEMD",
  verified: false,
};

export const M14_PESO_BALANCEAMENTO = [
  {
    ...BASE,
    questionCode: "H125-B2V-M14-Q001",
    chapterId: "pb_ch1",
    type: "calculation",
    cognitiveLevel: "calculation",
    difficulty: "medium",
    questionText:
      "Uma configuração hipotética possui peso total de 2.000 kg e soma dos momentos de 6.600 m·kg. Qual é o CG longitudinal calculado?",
    options: [
      { id: "A", text: "3,00 m" },
      { id: "B", text: "3,20 m" },
      { id: "C", text: "3,30 m" },
      { id: "D", text: "3,60 m" },
    ],
    correctAnswer: ["C"],
    answerExplanation:
      "CG = soma dos momentos ÷ soma dos pesos = 6.600 ÷ 2.000 = 3,30 m. O resultado matemático é 3,30 m. A aceitação operacional ainda depende da comparação com o envelope aplicável e vigente.",
    source: { ...FONTE, subsection: "CG longitudinal" },
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
    questionCode: "H125-B2V-M14-Q002",
    chapterId: "pb_ch1",
    type: "single_choice",
    cognitiveLevel: "comprehension",
    difficulty: "medium",
    questionText:
      "Como é definido o centro de gravidade (CG) de uma aeronave?",
    options: [
      { id: "A", text: "Pela soma dos pesos dividida pela soma dos momentos." },
      { id: "B", text: "Pela soma dos momentos dividida pela soma dos pesos." },
      { id: "C", text: "Pelo peso máximo de decolagem dividido pelo peso vazio." },
      { id: "D", text: "Pela diferença entre peso vazio e carga paga." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "O CG é calculado pela soma dos momentos dividida pela soma dos pesos. O resultado deve ser confrontado com o envelope aplicável à configuração.",
    source: { ...FONTE, subsection: "Definição de momentos" },
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
    questionCode: "H125-B2V-M14-Q003",
    chapterId: "pb_ch2",
    type: "single_choice",
    cognitiveLevel: "analysis",
    difficulty: "hard",
    questionText:
      "Um CG válido na decolagem pode variar durante a missão. Qual é a causa mais provável descrita na fonte?",
    options: [
      { id: "A", text: "A variação da temperatura externa." },
      { id: "B", text: "O consumo de combustível ou a mudança de carga." },
      { id: "C", text: "A mudança de altitude de cruzeiro." },
      { id: "D", text: "A variação da velocidade do vento." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "O consumo de combustível ou a mudança de carga podem alterar o CG durante a missão. Por isso, um CG válido na decolagem não garante CG válido no pouso.",
    source: { ...FONTE, subsection: "Combustível e variação do CG" },
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
    questionCode: "H125-B2V-M14-Q004",
    chapterId: "pb_ch2",
    type: "single_choice",
    cognitiveLevel: "application",
    difficulty: "hard",
    questionText:
      "Após calcular o CG longitudinal e verificar que está dentro do envelope, o que ainda deve ser confirmado antes do voo?",
    options: [
      { id: "A", text: "Apenas o peso máximo de decolagem." },
      { id: "B", text: "O CG lateral e a aplicabilidade da configuração selecionada." },
      { id: "C", text: "Somente a quantidade de combustível." },
      { id: "D", text: "Apenas a temperatura externa." },
    ],
    correctAnswer: ["B"],
    answerExplanation:
      "Além do CG longitudinal, é necessário verificar o CG lateral e confirmar que a configuração selecionada corresponde à aeronave em uso, incluindo equipamentos e suplementos aplicáveis.",
    source: { ...FONTE, subsection: "Envelopes e validação" },
    applicability: {
      classification: "basic_aircraft",
      aircraftVariant: AIRCRAFT_VARIANT,
      requiredEquipment: [],
      confirmed: false,
    },
    requiredEquipment: [],
  },
];
