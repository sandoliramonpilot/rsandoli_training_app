import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { can } from "@/lib/accessControl";
import BackToDashboard from "@/components/BackToDashboard";
import NewOatForm from "@/components/oat/NewOatForm";
import OatProfile from "@/components/oat/OatProfile";
import OatMapeamento from "@/components/oat/OatMapeamento";
import OatApprovalsPanel from "@/components/oat/OatApprovalsPanel";
import {
  Search, Plus, Users, ChevronLeft, Hourglass, AlertTriangle,
  CheckCircle2, Clock, Link2, FileBarChart, CircleUserRound, HeartPulse,
  ShieldCheck, FileWarning,
} from "lucide-react";
import {
  OAT_FUNCTION_LABELS, OAT_REGISTRATION_STATUS_LABELS, OAT_REGISTRATION_STATUS_STYLES,
  safeParse, collectExpiries, nextCriticalExpiry, cmaStatus, daysUntil,
  EXPIRY_COLORS, fmtDate,
} from "@/lib/oatUtils";
import { getAccessLevel } from "@/lib/accessControl";
import { RefreshCw } from "lucide-react";

export default function Oat() {
  const [oats, setOats] = useState(null);
  const [me, setMe] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMapeamento, setShowMapeamento] = useState(false);
  const [showApprovals, setShowApprovals] = useState(false);
  const [query, setQuery] = useState("");
  const [fRole, setFRole] = useState("all");
  const [fBase, setFBase] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fExpiry, setFExpiry] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [activeCard, setActiveCard] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [migrateToast, setMigrateToast] = useState("");

  const isManager = can(me, "oat", "editar");
  const isGeral = getAccessLevel(me) === "admin_geral";

  useEffect(() => {
    if (!migrateToast) return;
    const t = setTimeout(() => setMigrateToast(""), 5000);
    return () => clearTimeout(t);
  }, [migrateToast]);

  const migrateOats = async () => {
    setMigrating(true);
    try {
      const res = await base44.functions.invoke("manageUsers", { action: "migrate_oats" });
      const d = res.data || {};
      if (d.error) {
        setMigrateToast(d.error);
      } else {
        await load();
        setMigrateToast(`Migração concluída: ${d.created} OAT(s) criado(s), ${d.linked} vinculado(s), ${d.alreadyLinked} já vinculado(s).`);
      }
    } catch (e) {
      setMigrateToast(e?.response?.data?.error || e.message || "Erro ao executar migração.");
    }
    setMigrating(false);
  };

  useEffect(() => {
    base44.auth.me().then((u) => setMe(u)).catch(() => setMe(null));
  }, []);

  const load = async () => {
    const o = await base44.entities.Oat.list().catch(() => []);
    setOats(o);
  };
  useEffect(() => { load(); }, []);

  const bases = useMemo(() => {
    if (!oats) return [];
    return [...new Set(oats.map((o) => o.base).filter(Boolean))].sort();
  }, [oats]);

  const filtered = useMemo(() => {
    if (!oats) return [];
    let list = [...oats];
    if (fRole !== "all") list = list.filter((o) => o.role === fRole);
    if (fBase !== "all") list = list.filter((o) => o.base === fBase);
    if (fStatus !== "all") list = list.filter((o) => o.registration_status === fStatus);
    if (activeCard) list = applyCardFilter(list, activeCard);
    if (fExpiry !== "all") {
      list = list.filter((o) => {
        const exp = collectExpiries(o);
        if (fExpiry === "expired") return exp.some((e) => daysUntil(e.date) < 0);
        if (fExpiry === "15") return exp.some((e) => { const d = daysUntil(e.date); return d >= 0 && d <= 15; });
        if (fExpiry === "30") return exp.some((e) => { const d = daysUntil(e.date); return d > 15 && d <= 30; });
        if (fExpiry === "60") return exp.some((e) => { const d = daysUntil(e.date); return d > 30 && d <= 60; });
        if (fExpiry === "90") return exp.some((e) => { const d = daysUntil(e.date); return d > 60 && d <= 90; });
        return true;
      });
    }
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((o) => [o.full_name, o.war_name, o.anac_code, o.email].filter(Boolean).join(" ").toLowerCase().includes(q));
    list.sort((a, b) => {
      if (sortBy === "expiry") {
        const ea = nextCriticalExpiry(a)?.days ?? 9999;
        const eb = nextCriticalExpiry(b)?.days ?? 9999;
        return ea - eb;
      }
      if (sortBy === "cma") {
        const ca = cmaStatus(safeParse(a.cma, null)).days ?? 9999;
        const cb = cmaStatus(safeParse(b.cma, null)).days ?? 9999;
        return ca - cb;
      }
      return (a.full_name || "").localeCompare(b.full_name || "");
    });
    return list;
  }, [oats, fRole, fBase, fStatus, fExpiry, query, sortBy, activeCard]);

  const indicators = useMemo(() => {
    if (!oats) return null;
    const active = oats.filter((o) => o.registration_status === "active").length;
    const training = oats.filter((o) => o.registration_status === "training").length;
    const pending = oats.filter((o) => o.registration_status === "pending" || o.approval_status === "pending").length;
    let cma30 = 0, cmaExpired = 0, habNear = 0, habExpired = 0, docPending = 0;
    oats.forEach((o) => {
      const cma = safeParse(o.cma, null);
      const cs = cmaStatus(cma);
      if (cs.status === "expired") cmaExpired++;
      else if (cs.days !== null && cs.days <= 30) cma30++;
      const exp = collectExpiries(o);
      exp.forEach((e) => {
        const d = daysUntil(e.date);
        if (d < 0) { if (e.kind === "Habilitação") habExpired++; }
        else if (d <= 90 && e.kind === "Habilitação") habNear++;
      });
      const docs = safeParse(o.documents, []);
      docPending += docs.filter((d) => !d.category).length;
    });
    return { active, training, pending, cma30, cmaExpired, habNear, habExpired, docPending };
  }, [oats]);

  const fromList = selected ? oats?.find((o) => o.id === selected.id) : null;
  const selectedOat = fromList || selected;

  if (!oats || !me) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Operações</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            OAT / TRIP.OPER
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Gestão de Operadores Aerotáticos e Tripulantes Operacionais.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <BackToDashboard />
          {isManager && (
            <button
              onClick={() => setShowApprovals(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-700 text-slate-200 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
            >
              <Hourglass className="w-4 h-4" /> Aprovações
            </button>
          )}
          {isGeral && (
            <button
              onClick={migrateOats}
              disabled={migrating}
              title="Cria registros de OAT para usuários sem OAT e vincula por e-mail"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-700 text-slate-200 hover:border-amber-500/40 hover:text-amber-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${migrating ? "animate-spin" : ""}`} /> Migrar usuários → OAT
            </button>
          )}
          {isManager && (
            <button
              onClick={() => setShowMapeamento(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-700 text-slate-200 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
            >
              <Link2 className="w-4 h-4" /> Mapeamento
            </button>
          )}
          {isManager && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" /> Novo OAT
            </button>
          )}
        </div>
      </header>

      {selectedOat ? (
        <OatProfile oat={selectedOat} me={me} isManager={isManager} onBack={() => setSelected(null)} onRefresh={load} />
      ) : (
        <>
          {/* Indicators */}
          {indicators && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <Indicator label="OATs ativos" value={indicators.active} color="emerald" icon={CheckCircle2} onClick={() => { setActiveCard("active"); }} active={activeCard === "active"} />
              <Indicator label="Em treinamento" value={indicators.training} color="violet" icon={Clock} onClick={() => { setActiveCard("training"); }} active={activeCard === "training"} />
              <Indicator label="Cadastros pendentes" value={indicators.pending} color="amber" icon={Hourglass} onClick={() => { setActiveCard("pending"); }} active={activeCard === "pending"} />
              <Indicator label="CMA ≤ 30 dias" value={indicators.cma30} color="orange" icon={HeartPulse} onClick={() => { setActiveCard("cma30"); }} active={activeCard === "cma30"} />
              <Indicator label="CMA vencidos" value={indicators.cmaExpired} color="rose" icon={HeartPulse} onClick={() => { setActiveCard("cmaExpired"); }} active={activeCard === "cmaExpired"} />
              <Indicator label="Habilitações vencendo" value={indicators.habNear} color="yellow" icon={ShieldCheck} onClick={() => { setActiveCard("habNear"); }} active={activeCard === "habNear"} />
              <Indicator label="Habilitações vencidas" value={indicators.habExpired} color="rose" icon={ShieldCheck} onClick={() => { setActiveCard("habExpired"); }} active={activeCard === "habExpired"} />
              <Indicator label="Documentos pendentes" value={indicators.docPending} color="amber" icon={FileWarning} onClick={() => { setActiveCard("docPending"); }} active={activeCard === "docPending"} />
            </div>
          )}

          {activeCard && (
            <button onClick={() => setActiveCard(null)} className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> Remover filtro do card
            </button>
          )}

          {/* Filters + search */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar por nome, CANAC…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
              />
            </div>
            <Select value={fRole} onChange={setFRole} options={[{ v: "all", l: "Todas funções" }, ...Object.entries(OAT_FUNCTION_LABELS).map(([v, l]) => ({ v, l }))]} />
            <Select value={fBase} onChange={setFBase} options={[{ v: "all", l: "Todas bases" }, ...bases.map((b) => ({ v: b, l: b }))]} />
            <Select value={fStatus} onChange={setFStatus} options={[{ v: "all", l: "Todas situações" }, ...Object.entries(OAT_REGISTRATION_STATUS_LABELS).map(([v, l]) => ({ v, l }))]} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500">{filtered.length} OAT(s)</p>
              <Select value={fExpiry} onChange={setFExpiry} options={[
                { v: "all", l: "Todos vencimentos" },
                { v: "expired", l: "Vencidos" },
                { v: "15", l: "≤ 15 dias" },
                { v: "30", l: "≤ 30 dias" },
                { v: "60", l: "≤ 60 dias" },
                { v: "90", l: "≤ 90 dias" },
              ]} small />
            </div>
            <button onClick={() => setSortBy(sortBy === "name" ? "expiry" : sortBy === "expiry" ? "cma" : "name")} className="text-xs font-medium text-amber-400 hover:text-amber-300">
              Ordenar por: {sortBy === "name" ? "Nome" : sortBy === "expiry" ? "Vencimento" : "CMA"}
            </button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((o) => {
                const crit = nextCriticalExpiry(o);
                const exp = crit ? EXPIRY_COLORS[crit.status] : EXPIRY_COLORS.none;
                const cma = safeParse(o.cma, null);
                const cmaSt = cmaStatus(cma);
                return (
                  <button
                    key={o.id}
                    onClick={() => setSelected(o)}
                    className="text-left bg-[#1A1D25] rounded-2xl border border-slate-700/60 hover:border-amber-500/40 transition-colors p-5 hover:shadow-lg hover:shadow-black/30 group"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar oat={o} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-slate-100 truncate">{o.full_name}</h3>
                          {o.approval_status === "pending" && <Hourglass className="w-4 h-4 text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-amber-400/90 font-medium">{OAT_FUNCTION_LABELS[o.role] || o.role}</p>
                        <p className="text-[11px] text-slate-500 mt-1 truncate">
                          {o.anac_code ? `CANAC ${o.anac_code} · ` : ""}{o.base || "Sem base"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/40">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${OAT_REGISTRATION_STATUS_STYLES[o.registration_status] || ""}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        {OAT_REGISTRATION_STATUS_LABELS[o.registration_status] || o.registration_status}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${exp.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${exp.dot}`} />
                        {crit ? `${crit.kind} ${crit.label}` : "Sem vencimentos"}
                      </span>
                    </div>
                    {cma && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <HeartPulse className="w-3 h-3" /> CMA: {cmaSt.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {showForm && (
        <NewOatForm me={me} onClose={() => setShowForm(false)} onDone={() => { setShowForm(false); load(); }} />
      )}
      {showMapeamento && (
        <OatMapeamento onClose={() => setShowMapeamento(false)} />
      )}
      {showApprovals && (
        <OatApprovalsPanel onClose={() => setShowApprovals(false)} onDecision={load} />
      )}

      {migrateToast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm shadow-lg max-w-sm">
          {migrateToast}
        </div>
      )}
    </div>
  );
}

function applyCardFilter(list, card) {
  switch (card) {
    case "active": return list.filter((o) => o.registration_status === "active");
    case "training": return list.filter((o) => o.registration_status === "training");
    case "pending": return list.filter((o) => o.registration_status === "pending" || o.approval_status === "pending");
    case "cma30": return list.filter((o) => { const cs = cmaStatus(safeParse(o.cma, null)); return cs.days !== null && cs.days >= 0 && cs.days <= 30; });
    case "cmaExpired": return list.filter((o) => cmaStatus(safeParse(o.cma, null)).status === "expired");
    case "habNear": return list.filter((o) => collectExpiries(o).some((e) => { const d = daysUntil(e.date); return e.kind === "Habilitação" && d >= 0 && d <= 90; }));
    case "habExpired": return list.filter((o) => collectExpiries(o).some((e) => { const d = daysUntil(e.date); return e.kind === "Habilitação" && d < 0; }));
    case "docPending": return list.filter((o) => safeParse(o.documents, []).some((d) => !d.category));
    default: return list;
  }
}

function Select({ value, onChange, options, small }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${small ? "px-2.5 py-1.5 text-xs" : "px-3 py-2.5 text-sm"} rounded-xl bg-[#1A1D25] border border-slate-700/60 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50`}
    >
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

function Indicator({ label, value, color, icon: Icon, onClick, active }) {
  const map = {
    emerald: "from-emerald-500/20 border-emerald-500/30 text-emerald-300",
    violet: "from-violet-500/20 border-violet-500/30 text-violet-300",
    amber: "from-amber-500/20 border-amber-500/30 text-amber-300",
    orange: "from-orange-500/20 border-orange-500/30 text-orange-300",
    rose: "from-rose-500/20 border-rose-500/30 text-rose-300",
    yellow: "from-yellow-500/20 border-yellow-500/30 text-yellow-300",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border bg-gradient-to-br ${map[color]} to-transparent p-4 text-left transition-all ${active ? "ring-2 ring-amber-500/50 scale-[1.02]" : "hover:scale-[1.01]"}`}
    >
      <div className="flex items-center justify-between">
        <Icon className="w-4 h-4 opacity-70" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-[11px] opacity-80 mt-1">{label}</p>
    </button>
  );
}

function Avatar({ oat, size = "md" }) {
  const cls = size === "lg" ? "w-14 h-14 rounded-xl" : "w-16 h-16 rounded-xl";
  return (
    <div className={`${cls} bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0 overflow-hidden`}>
      {oat?.photo_uri ? (
        <img src={oat.photo_uri} alt={oat?.full_name || "Foto"} className="w-full h-full object-cover" />
      ) : (
        <span className="text-lg font-bold text-amber-400/60">{(oat?.full_name || "?").slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
      <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
      <p className="text-sm text-slate-500">Nenhum OAT encontrado. Use "Novo OAT" para cadastrar.</p>
    </div>
  );
}