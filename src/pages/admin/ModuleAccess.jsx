import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { AIRCRAFTS } from "@/lib/trainingData";
import { useAuth } from "@/lib/AuthContext";
import { can } from "@/lib/accessControl";

export default function ModuleAccess() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const podeEditar = can(user, "usuarios", "editar");

  const carregar = async () => {
    const lista = await base44.entities.User.list();
    setUsuarios(lista);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const alternar = async (alvo, aeronave) => {
    if (!podeEditar) return;
    const atuais = Array.isArray(alvo.modulos_habilitados)
      ? alvo.modulos_habilitados
      : [];
    const proximo = atuais.includes(aeronave)
      ? atuais.filter((m) => m !== aeronave)
      : [...new Set([...atuais, aeronave])];

    await base44.entities.User.update(alvo.id, {
      modulos_habilitados: proximo,
    });
    carregar();
  };

  if (carregando) return <p className="text-slate-400 text-sm">Carregando...</p>;
  if (!podeEditar)
    return <p className="text-slate-400 text-sm">Acesso restrito.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-slate-100">Habilitação de módulos</h1>
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 divide-y divide-slate-700/60">
        {usuarios.map((u) => {
          const modulos = Array.isArray(u.modulos_habilitados)
            ? u.modulos_habilitados
            : [];
          return (
            <div
              key={u.id}
              className="flex items-center justify-between gap-4 px-5 py-3.5"
            >
              <div>
                <p className="text-sm text-slate-200">{u.full_name || u.email}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
              <div className="flex gap-2">
                {AIRCRAFTS.map((a) => {
                  const ativo = modulos.includes(a);
                  return (
                    <button
                      key={a}
                      onClick={() => alternar(u, a)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        ativo
                          ? "bg-amber-500 text-slate-900 border-amber-500"
                          : "bg-transparent text-slate-400 border-slate-700/60"
                      }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
