#!/usr/bin/env node
// Carimba aircraftProfile nos documentos antigos que não têm o campo.
// Uso: node scripts/migrar-aircraft-profile.mjs --dry
//      node scripts/migrar-aircraft-profile.mjs --apply
//
// Requer as variáveis de ambiente do app (mesmas do build):
//   VITE_BASE44_APP_ID
//   VITE_BASE44_APP_BASE_URL

import fs from "fs";
import path from "path";

const MODO = process.argv.includes("--apply") ? "apply" : "dry";

const APP_ID = process.env.VITE_BASE44_APP_ID;
const BASE_URL = process.env.VITE_BASE44_APP_BASE_URL;

if (!APP_ID || !BASE_URL) {
  console.error("Faltam VITE_BASE44_APP_ID e/ou VITE_BASE44_APP_BASE_URL.");
  console.error("Rode com: VITE_BASE44_APP_ID=xxx VITE_BASE44_APP_BASE_URL=yyy node scripts/migrar-aircraft-profile.mjs --dry");
  process.exit(1);
}

// Mapeia discipline -> aircraftProfile padrão.
// Documentos de treinamento do AW119 vão para AW119.
// Documentos de outras disciplinas ficam sem carimbo (revisão manual).
const MAPA_DISCIPLINA = {
  aw119_training: "AW119",
};

const ENTIDADE = "TrainingDocument";

async function listarTodos() {
  const url = `${BASE_URL}/api/entities/${ENTIDADE}?limit=5000`;
  const res = await fetch(url, {
    headers: {
      "x-app-id": APP_ID,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Falha ao listar: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return Array.isArray(json) ? json : json?.data ?? json?.items ?? [];
}

async function atualizar(id, patch) {
  const url = `${BASE_URL}/api/entities/${ENTIDADE}/${id}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "x-app-id": APP_ID,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    throw new Error(`Falha ao atualizar ${id}: ${res.status}`);
  }
  return res.json();
}

async function main() {
  console.log(`Modo: ${MODO.toUpperCase()}`);
  console.log("");

  const docs = await listarTodos();
  console.log(`Documentos encontrados: ${docs.length}`);
  console.log("");

  const semPerfil = docs.filter((d) => !d.aircraftProfile);
  const invalidos = docs.filter(
    (d) => d.aircraftProfile && !["AW119", "H125"].includes(d.aircraftProfile)
  );
  const compartilhados = docs.filter((d) => d.aircraftProfile === "shared");

  console.log(`Sem aircraftProfile: ${semPerfil.length}`);
  console.log(`Com valor inválido: ${invalidos.length}`);
  console.log(`Com "shared" (separação total não permite): ${compartilhados.length}`);
  console.log("");

  if (invalidos.length > 0) {
    console.log("Documentos com valor inválido (revisar manualmente):");
    invalidos.forEach((d) => {
      console.log(`  ${d.id} | ${d.title || d.file_name} | "${d.aircraftProfile}"`);
    });
    console.log("");
  }

  if (compartilhados.length > 0) {
    console.log('Documentos marcados como "shared" (precisam de aeronave definida):');
    compartilhados.forEach((d) => {
      console.log(`  ${d.id} | ${d.title || d.file_name}`);
    });
    console.log("");
  }

  const paraCarimbar = [];
  const semMapa = [];

  semPerfil.forEach((d) => {
    const alvo = MAPA_DISCIPLINA[d.discipline];
    if (alvo) {
      paraCarimbar.push({ doc: d, alvo });
    } else {
      semMapa.push(d);
    }
  });

  console.log(`Serão carimbados: ${paraCarimbar.length}`);
  paraCarimbar.forEach(({ doc, alvo }) => {
    console.log(`  ${doc.id} | ${doc.title || doc.file_name} | ${doc.discipline} -> ${alvo}`);
  });
  console.log("");

  if (semMapa.length > 0) {
    console.log(`Sem mapeamento de disciplina (revisar manualmente): ${semMapa.length}`);
    semMapa.forEach((d) => {
      console.log(`  ${d.id} | ${d.title || d.file_name} | discipline="${d.discipline}"`);
    });
    console.log("");
  }

  if (MODO === "dry") {
    console.log("Modo DRY: nada foi alterado.");
    console.log("Para aplicar: node scripts/migrar-aircraft-profile.mjs --apply");
    return;
  }

  if (paraCarimbar.length === 0) {
    console.log("Nada a fazer.");
    return;
  }

  console.log("Aplicando...");
  let ok = 0;
  let erro = 0;

  for (const { doc, alvo } of paraCarimbar) {
    try {
      await atualizar(doc.id, { aircraftProfile: alvo });
      ok++;
      console.log(`  OK   ${doc.id} -> ${alvo}`);
    } catch (e) {
      erro++;
      console.log(`  ERRO ${doc.id}: ${e.message}`);
    }
  }

  console.log("");
  console.log(`Concluído: ${ok} atualizados, ${erro} erros.`);

  // Verificação final
  const depois = await listarTodos();
  const restantes = depois.filter((d) => !d.aircraftProfile);
  console.log(`Documentos ainda sem aircraftProfile: ${restantes.length}`);
}

main().catch((e) => {
  console.error("Erro fatal:", e.message);
  process.exit(1);
});
