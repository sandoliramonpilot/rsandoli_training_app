#!/usr/bin/env node
// Auditoria de separacao AW119 / H125
// Uso: node scripts/verificar-modulos.mjs
//      node scripts/verificar-modulos.mjs --build
//      node scripts/verificar-modulos.mjs --pre

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const C = {
  verde: "\x1b[32m",
  vermelho: "\x1b[31m",
  amarelo: "\x1b[33m",
  azul: "\x1b[36m",
  reset: "\x1b[0m",
};

const MODO = process.argv.includes("--pre")
  ? "pre"
  : process.argv.includes("--build")
  ? "build"
  : "pos";

let falhas = 0;
let avisos = 0;

const titulo = (t) => {
  console.log("");
  console.log("──────────────────────────────────────────────");
  console.log(t);
  console.log("──────────────────────────────────────────────");
};

const ok = (m) => console.log(`${C.verde}OK${C.reset}     ${m}`);
const falha = (m) => {
  console.log(`${C.vermelho}FALHA${C.reset}  ${m}`);
  falhas++;
};
const aviso = (m) => {
  console.log(`${C.amarelo}AVISO${C.reset}  ${m}`);
  avisos++;
};
const info = (m) => console.log(`${C.azul}INFO${C.reset}   ${m}`);

const existe = (p) => fs.existsSync(path.resolve(p));

const ler = (p) => {
  try {
    return fs.readFileSync(path.resolve(p), "utf8");
  } catch {
    return "";
  }
};

// Percorre src/ recursivamente e devolve arquivos de texto
function listarArquivos(dir = "src") {
  const base = path.resolve(dir);
  if (!fs.existsSync(base)) return [];

  const saida = [];
  const pilha = [base];

  while (pilha.length) {
    const atual = pilha.pop();
    for (const entrada of fs.readdirSync(atual, { withFileTypes: true })) {
      const completo = path.join(atual, entrada.name);
      if (entrada.isDirectory()) {
        pilha.push(completo);
      } else if (/\.(js|jsx|ts|tsx)$/.test(entrada.name)) {
        saida.push(completo);
      }
    }
  }
  return saida;
}

// Busca um padrao em src/ e devolve ocorrencias formatadas
function buscar(padrao, { ignorar = [] } = {}) {
  const regex = padrao instanceof RegExp ? padrao : new RegExp(padrao);
  const resultados = [];

  for (const arquivo of listarArquivos("src")) {
    const relativo = path.relative(process.cwd(), arquivo);
    if (ignorar.some((i) => relativo.includes(i))) continue;

    const linhas = ler(arquivo).split("\n");
    linhas.forEach((linha, i) => {
      if (regex.test(linha)) {
        resultados.push(`${relativo}:${i + 1}: ${linha.trim()}`);
      }
    });
  }
  return resultados;
}

// ────────────────────────────────────────────────
// 1. Arquivos de dados
// ────────────────────────────────────────────────
titulo("1. Arquivos de dados");

if (existe("src/lib/trainingData/index.js")) {
  ok("src/lib/trainingData/index.js");
} else if (MODO === "pre") {
  info("src/lib/trainingData/index.js ainda nao criado (modo pre-migracao)");
} else {
  falha("Ausente: src/lib/trainingData/index.js");
}

if (existe("src/lib/trainingData/aw119Training.js")) {
  ok("src/lib/trainingData/aw119Training.js");
} else if (existe("src/lib/aw119TrainingData.js")) {
  if (MODO === "pre") {
    info("src/lib/aw119TrainingData.js ainda no caminho antigo");
  } else {
    falha("Arquivo ainda em src/lib/aw119TrainingData.js. Mova para trainingData/.");
  }
} else {
  falha("Nao encontrado: aw119Training.js nem aw119TrainingData.js");
}

if (existe("src/lib/trainingData/h125Training.js")) {
  ok("src/lib/trainingData/h125Training.js");
} else if (MODO === "pre") {
  info("h125Training.js ainda nao criado");
} else {
  falha("Ausente: src/lib/trainingData/h125Training.js");
}

// notices.js e treinamentosGerais.js: nao verificados por decisao do usuario

// ────────────────────────────────────────────────
// 2. Paginas
// ────────────────────────────────────────────────
titulo("2. Paginas");

if (existe("src/pages/AircraftTraining.jsx")) {
  ok("src/pages/AircraftTraining.jsx");
} else if (existe("src/pages/AW119Training.jsx")) {
  if (MODO === "pre") {
    info("src/pages/AW119Training.jsx ainda nao renomeado");
  } else {
    falha("Página ainda e AW119Training.jsx. Renomeie para AircraftTraining.jsx.");
  }
} else {
  falha("Nem AircraftTraining.jsx nem AW119Training.jsx encontrados");
}

if (existe("src/pages/SemAcesso.jsx")) {
  ok("src/pages/SemAcesso.jsx");
} else {
  aviso("src/pages/SemAcesso.jsx ausente (rota /sem-acesso nao funcionara)");
}

if (existe("src/components/SemAcessoAoModulo.jsx")) {
  ok("src/components/SemAcessoAoModulo.jsx");
} else {
  aviso("src/components/SemAcessoAoModulo.jsx ausente (AircraftTraining precisa dele)");
}

// ModuleGate: nao verificado como obrigatorio (decisao: usar RequireModule)

// ────────────────────────────────────────────────
// 3. Imports do caminho antigo
// ────────────────────────────────────────────────
titulo("3. Imports de aw119TrainingData");

const importsAntigos = buscar(/aw119TrainingData/);
if (importsAntigos.length === 0) {
  ok("Nenhum import do caminho antigo.");
} else if (MODO === "pre") {
  info("Imports do caminho antigo (esperado antes da migracao):");
  importsAntigos.forEach((l) => console.log("       " + l));
} else {
  falha("Ainda existem imports do caminho antigo:");
  importsAntigos.forEach((l) => console.log("       " + l));
}

// ────────────────────────────────────────────────
// 4. Uso direto do dataset AW119
// ────────────────────────────────────────────────
titulo("4. Uso direto de AW119_TRAINING");

const usosDiretos = buscar(/AW119_TRAINING/, {
  ignorar: ["src/lib/trainingData/", "src/lib/aw119TrainingData.js"],
});
if (usosDiretos.length === 0) {
  ok("Nenhum uso direto fora do arquivo de dados.");
} else if (MODO === "pre") {
  info("Usos diretos (esperado antes da migracao):");
  usosDiretos.forEach((l) => console.log("       " + l));
} else {
  falha("Uso direto do dataset do AW119:");
  usosDiretos.forEach((l) => console.log("       " + l));
}

// ────────────────────────────────────────────────
// 5. Rotas mortas
// ────────────────────────────────────────────────
titulo("5. Rotas antigas");

const rotasMortas = buscar(/\/aw119-training|\/h125-training/);
if (rotasMortas.length === 0) {
  ok("Nenhuma rota antiga referenciada.");
} else {
  falha("Rotas antigas ainda referenciadas:");
  rotasMortas.forEach((l) => console.log("       " + l));
}

// ────────────────────────────────────────────────
// 6. moduleId invalido
// ────────────────────────────────────────────────
titulo('6. moduleId="training" (inexistente em PERMISSION_MODULES)');

const moduleIdInvalido = buscar(/moduleId="training"/);
if (moduleIdInvalido.length === 0) {
  ok('Nenhuma rota usa moduleId="training".');
} else {
  falha('moduleId="training" encontrado (bloqueia todos os usuarios):');
  moduleIdInvalido.forEach((l) => console.log("       " + l));
}

// ────────────────────────────────────────────────
// 7. Campo descartado
// ────────────────────────────────────────────────
titulo("7. modulos_habilitados (campo descartado)");

const campoAntigo = buscar(/modulos_habilitados/);
if (campoAntigo.length === 0) {
  ok("Nenhum resquicio do campo antigo.");
} else {
  falha("Campo descartado ainda em uso:");
  campoAntigo.forEach((l) => console.log("       " + l));
}

// ────────────────────────────────────────────────
// 8. Pagina H125 separada
// ────────────────────────────────────────────────
titulo("8. Pagina H125 separada");

let paginasH125 = [];
try {
  paginasH125 = fs
    .readdirSync(path.resolve("src/pages"))
    .filter((f) => /h125/i.test(f));
} catch {
  paginasH125 = [];
}

if (paginasH125.length === 0) {
  ok("Nenhuma pagina H125 separada.");
} else {
  aviso("Pagina H125 encontrada (verifique se e duplicata):");
  paginasH125.forEach((f) => console.log("       " + f));
}

// ────────────────────────────────────────────────
// 9. accessControl
// ────────────────────────────────────────────────
titulo("9. accessControl.js");

const accessControl = ler("src/lib/accessControl.js");

if (accessControl.includes("h125_training")) {
  ok("h125_training presente em PERMISSION_MODULES.");
} else {
  falha("h125_training ausente em accessControl.js.");
}

if (/getTrainingModules|canAccessTraining/.test(accessControl)) {
  ok("Funcoes getTrainingModules/canAccessTraining presentes.");
} else {
  aviso("Funcoes getTrainingModules/canAccessTraining ausentes.");
}

// ────────────────────────────────────────────────
// 10. aircraftProfile
// ────────────────────────────────────────────────
titulo("10. AIRCRAFT_PROFILES contem H125");

if (existe("src/lib/aircraftProfile.js")) {
  if (ler("src/lib/aircraftProfile.js").includes("H125")) {
    ok("H125 presente em aircraftProfile.js");
  } else {
    falha("H125 ausente em aircraftProfile.js. O modulo sera filtrado fora.");
  }
} else {
  falha("Ausente: src/lib/aircraftProfile.js");
}

// ────────────────────────────────────────────────
// 11. ProfileContext
// ────────────────────────────────────────────────
titulo("11. ProfileContext");

if (existe("src/lib/ProfileContext.jsx")) {
  const ctx = ler("src/lib/ProfileContext.jsx");

  if (ctx.includes("modulos_habilitados")) {
    falha("ProfileContext ainda le modulos_habilitados.");
  } else {
    ok("ProfileContext sem modulos_habilitados.");
  }

  if (ctx.includes("aircraft_profiles")) {
    ok("ProfileContext le aircraft_profiles.");
  } else {
    aviso("ProfileContext nao referencia aircraft_profiles.");
  }
} else {
  falha("Ausente: src/lib/ProfileContext.jsx");
}

// ────────────────────────────────────────────────
// 12. Build
// ────────────────────────────────────────────────
titulo("12. Build de producao");

if (MODO === "build") {
  try {
    execSync("npm run build", { stdio: "pipe" });
    ok("Build passou.");
  } catch (e) {
    falha("Build falhou.");
    const saida = (e.stdout?.toString() || "") + (e.stderr?.toString() || "");
    console.log(saida.split("\n").slice(-30).join("\n"));
  }
} else {
  info("Build nao executado. Use: node scripts/verificar-modulos.mjs --build");
}

// ────────────────────────────────────────────────
// Resumo
// ────────────────────────────────────────────────
console.log("");
console.log("══════════════════════════════════════════════");
if (falhas === 0) {
  console.log(`${C.verde}Auditoria concluida sem falhas criticas.${C.reset}`);
  console.log(`Avisos: ${avisos}`);
  process.exit(0);
} else {
  console.log(`${C.vermelho}${falhas} falha(s) critica(s), ${avisos} aviso(s).${C.reset}`);
  console.log("Nao publique.");
  process.exit(1);
}
