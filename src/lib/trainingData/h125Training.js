import fs from "fs";
import path from "path";

const ORIGEM = path.resolve("src/lib/trainingData/aw119Training.js");
const DESTINO = path.resolve("src/lib/trainingData/h125Training.js");

const fonte = fs.readFileSync(ORIGEM, "utf8");

// Extrai o bloco do AW119_TRAINING
const inicio = fonte.indexOf("AW119_TRAINING");
if (inicio === -1) {
  console.error("AW119_TRAINING não encontrado em", ORIGEM);
  process.exit(1);
}

// Importa o módulo dinamicamente para ler a estrutura real
const mod = await import(ORIGEM);
const aw119 = mod.AW119_TRAINING;

if (!aw119?.modules?.length) {
  console.error("AW119_TRAINING.modules vazio ou inválido.");
  process.exit(1);
}

const clonar = (obj) => JSON.parse(JSON.stringify(obj));

const h125 = {
  subtitle: "Treinamento teórico Airbus H125.",
  modules: aw119.modules.map((m) => ({
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

const saida = `export const H125_TRAINING = ${JSON.stringify(h125, null, 2)};\n`;

fs.writeFileSync(DESTINO, saida, "utf8");

const totalModulos = h125.modules.length;
const totalCapitulos = h125.modules.reduce((a, m) => a + (m.chapters?.length ?? 0), 0);

console.log(`Gerado ${DESTINO}`);
console.log(`Módulos: ${totalModulos} | Capítulos: ${totalCapitulos}`);
console.log("Revise o conteúdo técnico antes de publicar.");
