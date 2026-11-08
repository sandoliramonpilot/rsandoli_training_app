#!/usr/bin/env node
// Importa as questões do lote piloto para o banco.
// Uso: node scripts/importar-questoes.mjs --dry
//      node scripts/importar-questoes.mjs --apply

import { PILOT_QUESTIONS, validarLote } from "../src/lib/questions/index.js";

const MODO = process.argv.includes("--apply") ? "apply" : "dry";

const APP_ID = process.env.VITE_BASE44_APP_ID;
const BASE_URL = process.env.VITE_BASE44_APP_BASE_URL;

if (!APP_ID || !BASE_URL) {
  console.error("Faltam VITE_BASE44_APP_ID e/ou VITE_BASE44_APP_BASE_URL.");
  process.exit(1);
}

const ENTIDADE = "TrainingQuestion";

async function listar() {
  const res = await fetch(`${BASE_URL}/api/entities/${ENTIDADE}?limit=5000`, {
    headers: { "x-app-id": APP_ID, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Listagem falhou: ${res.status}`);
  const json = await res.json();
  return Array.isArray(json) ? json : json?.data ?? json?.items ?? [];
}

async function criar(payload) {
  const res = await fetch(`${BASE_URL}/api/entities/${ENTIDADE}`, {
    method: "POST",
    headers: { "x-app-id": APP_ID, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Criação falhou: ${res.status}`);
  return res.json();
}

async function main() {
  console.log(`Modo: ${MODO.toUpperCase()}`);
  console.log("");

  const validacao = validarLote(PILOT_QUESTIONS);
  console.log(`Validação: ${validacao.validas}/${validacao.total} válidas`);

  if (validacao.problemas.length > 0) {
    console.log("");
    console.log("Problemas encontrados:");
    validacao.problemas.forEach((p) => {
      console.log(`  ${p.codigo}: ${p.erros.join("; ")}`);
    });
    console.log("");
    console.log("Corrija os problemas antes de importar.");
    process.exit(1);
  }

  const existentes = await listar();
  const codigosExistentes = new Set(existentes.map((q) => q.questionCode));

  const novas = PILOT_QUESTIONS.filter((q) => !codigosExistentes.has(q.questionCode));
  const jaExistem = PILOT_QUESTIONS.length - novas.length;

  console.log(`Já no banco: ${jaExistem}`);
  console.log(`A importar: ${novas.length}`);
  console.log("");

  if (novas.length === 0) {
    console.log("Nada a fazer.");
    return;
  }

  novas.forEach((q) => {
    console.log(`  ${q.questionCode} | ${q.moduleId} | ${q.status}`);
  });
  console.log("");

  if (MODO === "dry") {
    console.log("Modo DRY: nada foi alterado.");
    console.log("Para aplicar: node scripts/importar-questoes.mjs --apply");
    return;
  }

  console.log("Importando...");
  let ok = 0;
  let erro = 0;

  for (const q of novas) {
    try {
      await criar(q);
      ok++;
      console.log(`  OK   ${q.questionCode}`);
    } catch (e) {
      erro++;
      console.log(`  ERRO ${q.questionCode}: ${e.message}`);
    }
  }

  console.log("");
  console.log(`Concluído: ${ok} importadas, ${erro} erros.`);
}

main().catch((e) => {
  console.error("Erro fatal:", e.message);
  process.exit(1);
});
