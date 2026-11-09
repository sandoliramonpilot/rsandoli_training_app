import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  canManageUsers, getAccessLevel, getAccountStatus,
  ACCESS_LEVELS, ACCOUNT_STATUSES, ACCESS_LEVEL_LABELS, ACCOUNT_STATUS_LABELS,
} from "@/lib/accessControl";
import { AIRCRAFT_PROFILES, PROFILE_LABELS } from "@/lib/aircraftProfile";
import { Loader2, Search, ShieldCheck, Save, X, Plane, Plus, UserPlus } from "lucide-react";

export default function Usuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [criando, setCriando] = useState(false);

  const podeGerenciar = canManageUsers(user);

  const carregar = async () => {
    setCarregando(true);
    setErro("");
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

  const abrirEdicao = (u) => {
    setEditando(u.id);
    setForm({
      access_level: getAccessLevel(u),
      account_status: getAccountStatus(u),
      aircraft_profiles: perfisDe(u),
    });
    setErro("");
    setSucesso("");
  };

  const cancelar = () => {
    setEditando(null);
    setForm(null);
  };

  const alternarAeronave = (aeronave) => {
    setForm((f) => {
      const atuais = f.aircraft_profiles;
      const proximo = atuais.includes(aeronave)
        ? atuais.filter((p) => p !== aeronave)
        : [...new Set([...atuais, aeronave])];
      return { ...f, aircraft_profiles: proximo };
    });
  };

  const salvar = async () => {
    if (!editando || !form) return;
    setSalvando(true);
    setErro("");
    setSucesso("");
    try {
      await base44.entities.User.update(editando, {
        access_level: form.access_level,
        account_status: form.account_status,
        aircraft_profiles: form.aircraft_profiles,
      });
      setSucesso("Usuário atualizado.");
      setEditando(null);
      setForm(null);
      await carregar();
    } catch (e) {
      setErro(e?.message || "Falha ao salvar. Verifique as permissões do backend.");
    } finally {
      setSalvando(false);
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

  if (!podeGerenciar) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-3">
        <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
        <p className="text-sm text-slate-400">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Administração</p>
          <h1 className="text-2xl font-bold text-slate-100 mt-1">Usuários e acessos</h1>
          <p className="text-sm text-slate-400 mt-1">
            Edite nível de acesso, status da conta e módulos de aeronave liberados.
          </p>
        </div>
        <button
          onClick={() => { setCriando(true); setErro(""); setSucesso(""); }}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-slate-900 text-sm font-semibold hover:bg-amber-400"
        >
          <Plus className="w-4 h-4" /> Novo usuário
        </button>
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
      {sucesso && (
        <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
          {sucesso}
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
            const aberto = editando === u.id;
            return (
              <div key={u.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 truncate">{u.full_name || u.email}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
                        {ACCESS_LEVEL_LABELS[getAccessLevel(u)] || "—"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-300">
                        {ACCOUNT_STATUS_LABELS[getAccountStatus(u)] || "—"}
                      </span>
                      {perfis.length > 0 ? (
                        perfis.map((p) => (
                          <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                            <Plane className="w-2.5 h-2.5" /> {PROFILE_LABELS[p] || p}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-600">Sem aeronave liberada</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => (aberto ? cancelar() : abrirEdicao(u))}
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300 hover:border-amber-500/50"
                  >
                    {aberto ? "Fechar" : "Editar"}
                  </button>
                </div>

                {aberto && form && (
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-700/40 pt-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">Nível de acesso</label>
                        <select
                          value={form.access_level}
                          onChange={(e) => setForm({ ...form, access_level: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200"
                        >
                          {ACCESS_LEVELS.map((l) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">Status da conta</label>
                        <select
                          value={form.account_status}
                          onChange={(e) => setForm({ ...form, account_status: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200"
                        >
                          {ACCOUNT_STATUSES.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">
                        Módulos de aeronave liberados
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {AIRCRAFT_PROFILES.map((a) => {
                          const ativo = form.aircraft_profiles.includes(a);
                          return (
                            <button
                              key={a}
                              type="button"
                              onClick={() => alternarAeronave(a)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
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
                      <p className="text-[11px] text-slate-600 mt-2">
                        Sem aeronave marcada, o usuário não acessa a seção de treinamento.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={salvar}
                        disabled={salvando}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-slate-900 text-sm font-semibold hover:bg-amber-400 disabled:opacity-50"
                      >
                        {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {salvando ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        onClick={cancelar}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700/60 text-sm text-slate-300 hover:border-slate-500"
                      >
                        <X className="w-4 h-4" /> Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {criando && (
        <NewUserModal
          onClose={() => setCriando(false)}
          onSaved={async (msg) => {
            setCriando(false);
            setSucesso(msg);
            await carregar();
          }}
        />
      )}
    </div>
  );
}

/* ---------------------- MODAL DE CRIAÇÃO ---------------------- */
function NewUserModal({ onClose, onSaved }) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    access_level: "operacional",
    account_status: "ativa",
    aircraft_profiles: [],
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const alternarAeronave = (aeronave) => {
    setForm((f) => {
      const proximo = f.aircraft_profiles.includes(aeronave)
        ? f.aircraft_profiles.filter((p) => p !== aeronave)
        : [...new Set([...f.aircraft_profiles, aeronave])];
      return { ...f, aircraft_profiles: proximo };
    });
  };

  const criar = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.full_name.trim() || !form.email.trim()) {
      setErro("Preencha nome completo e e-mail.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErro("Informe um e-mail válido.");
      return;
    }

    setSalvando(true);
    try {
      await base44.entities.User.create({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        access_level: form.access_level,
        account_status: form.account_status,
        aircraft_profiles: form.aircraft_profiles,
      });
      onSaved(`Usuário ${form.full_name.trim()} criado com sucesso.`);
    } catch (err) {
      setErro(err?.message || "Falha ao criar usuário. Verifique as permissões do backend.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 w-full max-w-lg my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
          <h2 className="font-semibold text-slate-100 inline-flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" /> Novo usuário
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={criar} className="p-6 space-y-4">
          {erro && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Nome completo *</label>
            <input
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200"
              placeholder="Ex.: João da Silva"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">E-mail *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200"
              placeholder="nome@empresa.com"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Nível de acesso *</label>
              <select
                value={form.access_level}
                onChange={(e) => set("access_level", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200"
              >
                {ACCESS_LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Status inicial</label>
              <select
                value={form.account_status}
                onChange={(e) => set("account_status", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200"
              >
                {ACCOUNT_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">
              Módulos de aeronave liberados
            </label>
            <div className="flex flex-wrap gap-2">
              {AIRCRAFT_PROFILES.map((a) => {
                const ativo = form.aircraft_profiles.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => alternarAeronave(a)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700/60 text-sm text-slate-300 hover:border-slate-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-slate-900 text-sm font-semibold hover:bg-amber-400 disabled:opacity-50"
            >
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {salvando ? "Criando..." : "Criar usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
