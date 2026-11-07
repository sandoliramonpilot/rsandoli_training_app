import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { canManageUsers, getAccessLevel, ACCESS_LEVEL_LABELS } from "@/lib/accessControl";
import { AIRCRAFT_PROFILES, PROFILE_LABELS, PROFILE_DESCRIPTIONS } from "@/lib/aircraftProfile";
import { Loader2, Plane, Search, ShieldCheck } from "lucide-react";

export default function PerfisAeronave() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(null);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");

  const podeEditar = canManageUsers(user);

  const carregar = async () => {
    setCarregando(true);
    try {
      const lista = await base44.entities.User.list();
      setUsuarios(lista ?? []);
    } catch (e) {
      setErro("Não foi possível carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const perfisDe = (u) => {
    let p = u.aircraft_profiles;
    if (typeof p === "string") {
      try { p = JSON.parse(p); } catch { p = []; }
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
    setErro("");
    try {
      await base44.entities.User.update(alvo.id, { aircraft_profiles: proximo });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === alvo.id ? { ...u, aircraft_profiles: proximo } : u))
      );
    } catch (e) {
      setErro(`Falha ao salvar ${alvo.email || alvo.full_name}.`);
    } finally {
      setSalvando(null);
    }
  };

  const filtrados = usuarios.filter((u) => {
    const t = busca.trim().toLowerCase();
    if (!t) return true;
    return (
      (u.full_name || "").toLowerCase().includes(t) ||
      (u.email || "").toLowerCase().includes(t)
    );
  });

  if (!podeEditar) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-3">
        <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
        <p className="text-sm text-slate-400">
          Acesso restrito a administradores.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Administração</p>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">Perfis de aeronave</h1>
        <p className="text-sm text-slate-400 mt-1">
          Libere cada usuário nos módulos AW119 e H125. Os conteúdos são independentes:
          nada aparece nos dois.
        </p>
      </header>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500"
        />
      </div>

      {erro && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {erro}
        </p>
      )}

      {carregando ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando usuários...
        </div>
      ) : filtrados.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">Nenhum usuário encontrado.</p>
      ) : (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 divide-y divide-slate-700/60">
          {filtrados.map((u) => {
            const perfis = perfisDe(u);
            const nivel = ACCESS_LEVEL_LABELS[getAccessLevel(u)] || "—";
            const ocupado = salvando === u.id;

            return (
              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 truncate">
                    {u.full_name || u.email}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{nivel}</p>
                </div>

                <div className="flex gap-2 shrink-0">
                  {AIRCRAFT_PROFILES.map((a) => {
                    const ativo = perfis.includes(a);
                    return (
                      <button
                        key={a}
                        onClick={() => alternar(u, a)}
                        disabled={ocupado}
                        title={PROFILE_DESCRIPTIONS[a] || ""}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                          ativo
                            ? "bg-amber-500 text-slate-900 border-amber-500"
                            : "bg-transparent text-slate-400 border-slate-700/60 hover:border-slate-500"
                        }`}
                      >
                        <Plane className="w-3.5 h-3.5" />
                        {PROFILE_LABELS[a] || a}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-slate-600">
        Usuário sem nenhuma aeronave marcada não acessa a seção de treinamento.
        Administrador geral tem acesso automático aos dois módulos.
      </p>
    </div>
  );
}
