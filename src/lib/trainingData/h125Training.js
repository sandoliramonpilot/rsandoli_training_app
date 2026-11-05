import { AW119_TRAINING } from "@/lib/trainingData/aw119TrainingData";

// Estrutura de treinamento consumida diretamente pelo navegador.
// Mantém o conteúdo em elaboração até a revisão técnica.
const clonar = (obj) => JSON.parse(JSON.stringify(obj));

export const H125_TRAINING = {
  name: "H125 TRAINING",
  subtitle: "Treinamento teórico Airbus H125.",
  modules: AW119_TRAINING.modules.map((m) => ({
    ...clonar(m),
    objective: "Conteúdo em elaboração.",
    note: undefined,
    chapters: (m.chapters ?? []).map((ch) => ({
      ...clonar(ch),
      objective: "Conteúdo em elaboração.",
      items: ["Conteúdo em elaboração."],
      note: undefined,
      modes: ch.modes ? clonar(ch.modes) : undefined,
      modeFields: ch.modeFields ? clonar(ch.modeFields) : undefined,
    })),
  })),
};