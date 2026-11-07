export const QUESTION_TYPES = [
  "single_choice",
  "multiple_choice",
  "true_false",
  "matching",
  "ordering",
  "image_identification",
  "vemd_interpretation",
  "alarm_interpretation",
  "calculation",
  "chart_interpretation",
  "scenario",
  "document_lookup",
];

export const COGNITIVE_LEVELS = [
  "recall",
  "comprehension",
  "application",
  "analysis",
  "decision_making",
  "calculation",
  "document_lookup",
];

export const DIFFICULTIES = ["easy", "medium", "hard"];

export const CONTENT_STATUS = [
  "draft",
  "technical_review",
  "revision_requested",
  "awaiting_approval",
  "approved_for_training",
  "obsolete",
  "archived",
];

export const APPLICABILITY = [
  "basic_aircraft",
  "configuration_dependent",
  "modification_dependent",
  "optional_equipment",
  "supplement_dependent",
];

export const COURSE_ID = "as350_b2_vemd";
export const TRAINING_SECTION = "h125_training";
export const AIRCRAFT_FAMILY = "H125";
export const AIRCRAFT_MODEL = "AS350 B2";
export const AIRCRAFT_VARIANT = "AS350 B2 VEMD";
export const AVIONICS_CONFIGURATION = "VEMD";

export const MODULES = [
  { code: "M01", id: "integracao_documental", title: "Integração e Controle Documental", target: 15 },
  { code: "M02", id: "generalidades", title: "Generalidades", target: 20 },
  { code: "M03", id: "cockpit_comandos", title: "Cockpit, Instrumentos e Comandos", target: 20 },
  { code: "M04", id: "vemd", title: "VEMD", target: 40 },
  { code: "M05", id: "motor_arriel", title: "Motor Arriel 1D1", target: 25 },
  { code: "M06", id: "combustivel", title: "Sistema de Combustível", target: 20 },
  { code: "M07", id: "rotores", title: "Rotores", target: 15 },
  { code: "M08", id: "transmissao", title: "Transmissão", target: 20 },
  { code: "M09", id: "comandos_voo", title: "Comandos de Voo", target: 15 },
  { code: "M10", id: "hidraulico", title: "Sistema Hidráulico", target: 30 },
  { code: "M11", id: "eletrico", title: "Sistema Elétrico", target: 25 },
  { code: "M12", id: "auxiliares", title: "Sistemas Auxiliares", target: 15 },
  { code: "M13", id: "limitacoes", title: "Limitações", target: 30 },
  { code: "M14", id: "peso_balanceamento", title: "Peso e Balanceamento", target: 25 },
  { code: "M15", id: "desempenho", title: "Desempenho", target: 30 },
  { code: "M16", id: "procedimentos_normais", title: "Procedimentos Normais", target: 25 },
  { code: "M17", id: "procedimentos_emergencia", title: "Procedimentos de Emergência", target: 30 },
  { code: "M18", id: "suplementos", title: "Suplementos e Equipamentos Opcionais", target: 15 },
  { code: "M19", id: "informacoes_operacionais", title: "Informações Operacionais", target: 10 },
  { code: "M20", id: "briefings", title: "Briefings e Tomada de Decisão", target: 10 },
];

export const SAFETY_CRITICAL_MODULES = [
  "limitacoes",
  "procedimentos_normais",
  "procedimentos_emergencia",
  "peso_balanceamento",
  "desempenho",
];

export function gerarCodigo(moduloCodigo, sequencia) {
  const m = String(moduloCodigo).padStart(2, "0");
  const q = String(sequencia).padStart(3, "0");
  return `H125-B2V-M${m}-Q${q}`;
}
