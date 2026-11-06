import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { canManageUsers } from "@/lib/accessControl";
import { AIRCRAFT_PROFILES, PROFILE_LABELS } from "@/lib/aircraftProfile";
import { Loader2 } from "lucide-react";

export default function PerfisAeronave() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(null);

  const podeEditar = canManageUsers(user);

  const carregar = async () => {
    const lista = await base44.entities.User.list();
    setUsuarios(lista ?? []);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const perfisDe = (u) => {
    let p = u.aircraft_profiles;
    if (typeof p === "string") {
      try {
        p = JSON.parse(p);
      } catch {
        p = [];
      }
    }
    return Array.isArray(p) ? p : [];
  };

  const alternar = async (alvo, aeronave) => {
    if (!podeEditar) return;

    const atuais = perfisDe(alvo);
    const proximo = atuais.includes(aeronave)
      ? atuais.filter((p) => p !== aeronave)
      : [...new Set([...atuais, aeronave])];

    setSalvando(alvo.id);
    try {
      await base44.entities.User.update(alvo.id, {
        aircraft_profiles: proximo,
      });
      await carregar();
    } finally {
      setSalvando(null);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm p-6">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
      </div>
    );
  }

  if (!podeEditar) {
    return (
      <p className="text-slate-400 text-sm p-6">
        Acesso restrito a administradores.
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Perfis de aeronave</h1>
        <p className="text-sm text-slate-400 mt-1">
          Libere cada usuário nos módulos AW119 e H125. Cada módulo tem conteúdo
          independente.
        </p>
      </header>

      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 divide-y divide-slate-700/60">
        {usuarios.map((u) => {
          const perfis = perfisDe(u);
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
                {AIRCRAFT_PROFILES.map((a) => {
                  const ativo = perfis.includes(a);
                  const ocupado = salvando === u.id;
                  return (
                    <button
                      key={a}
                      onClick={() => alternar(u, a)}
                      disabled={ocupado}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                        ativo
                          ? "bg-amber-500 text-slate-900 border-amber-500"
                          : "bg-transparent text-slate-400 border-slate-700/60 hover:border-slate-500"
                      }`}
                    >
                      {PROFILE_LABELS[a] || a}
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
