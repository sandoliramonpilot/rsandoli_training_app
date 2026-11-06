import React, { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function MigracaoModulos() {
  const [log, setLog] = useState([]);
  const [rodando, setRodando] = useState(false);

  const registrar = (msg) => setLog((p) => [...p, msg]);

  const migrarDocumentos = async () => {
    await base44.entities.TrainingDocument.updateMany(
      { discipline: "aw119_training", aircraftProfile: { $exists: false } },
      { $set: { aircraftProfile: "AW119" } }
    );
    const restantes = await base44.entities.TrainingDocument.filter(
      { aircraftProfile: { $exists: false } },
      null,
      5000
    );
    registrar(`Documentos sem aeronave: ${restantes.length}`);
  };

  const revisarDocumentos = async () => {
    const todos = await base44.entities.TrainingDocument.filter({}, null, 5000);
    const fora = todos.filter(
      (d) => !["AW119", "H125"].includes(d.aircraftProfile)
    );
    registrar(`Documentos com aeronave inválida: ${fora.length}`);
    fora.forEach((d) =>
      registrar(`  ${d.id} | ${d.title} | ${d.aircraftProfile}`)
    );
  };

  const migrarUsuarios = async () => {
    const usuarios = await base44.entities.User.list();
    let atualizados = 0;
    for (const u of usuarios) {
      if (!Array.isArray(u.modulos_habilitados)) {
        await base44.entities.User.update(u.id, {
          modulos_habilitados: ["AW119"],
        });
        atualizados++;
      }
    }
    registrar(`Usuários atualizados com AW119: ${atualizados}`);
  };

  const rodar = async () => {
    setRodando(true);
    setLog([]);
    try {
      await migrarDocumentos();
      await revisarDocumentos();
      await migrarUsuarios();
      registrar("Concluído. Verifique a lista acima antes de liberar o H125.");
    } catch (e) {
      registrar("Erro: " + (e.message || "desconhecido"));
    } finally {
      setRodando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-slate-100">Migração de módulos</h1>
      <button
        onClick={rodar}
        disabled={rodando}
        className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 text-sm font-medium disabled:opacity-50"
      >
        {rodando ? "Executando..." : "Executar migração"}
      </button>
      <pre className="text-xs text-slate-300 bg-[#12141A] p-4 rounded-lg overflow-auto whitespace-pre-wrap">
        {log.join("\n")}
      </pre>
    </div>
  );
}
