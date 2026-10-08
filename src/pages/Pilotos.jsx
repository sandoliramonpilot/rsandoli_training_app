import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { can } from "@/lib/accessControl";
import BackToDashboard from "@/components/BackToDashboard";
import NewPilotForm from "@/components/pilots/NewPilotForm";
import PilotProfile from "@/components/pilots/PilotProfile";
import {
  Search, Plus, Users, ChevronLeft, Hourglass, AlertTriangle,
  CheckCircle2, Clock, HeartPulse, ShieldCheck, FileWarning, X,
  Loader2, BadgeCheck,
} from "lucide-react";
import {
  ROLE_LABELS, REGISTRATION_STATUS_LABELS, REGISTRATION_STATUS_STYLES,
  safeParse, collectExpiries, nextCriticalExpiry, cmaStatus, daysUntil,
  EXPIRY_COLORS,
} from "@/lib/pilotUtils";

export default function Pilotos() {
  const [pilots, setPilots] = useState(null);
  const [me, setMe] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showApprovals, setShowApprovals] = useState(false);
  const [requests, setRequests] = useState([]);
  const [query, setQuery] = useState("");
  const [fRole, setFRole] = useState("all");
  const [fBase, setFBase] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fExpiry, setFExpiry] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [activeCard, setActiveCard] = useState(null);

  const isManager = can(me, "pilotos", "editar");

  useEffect(() => {
    base44.auth.me().then((u) => setMe(u)).catch(() => setMe(null));
  }, []);

  const load = async () => {
    const p = await base44.entities.Pilot.list().catch(() => []);
    setPilots(p);
  };
  useEffect(() => { load(); }, []);

  const bases = useMemo(() => {
    if (!pilots) return [];
    return [...new Set(pilots.map((p) => p.base).filter(Boolean))].sort();
  }, [pilots]);

  const filtered = useMemo(() => {
    if (!pilots) return [];
    let list = [...pilots];
    if (fRole !== "all") list = list.filter((p) => p.role === fRole);
    if (fBase !== "all") list = list.filter((p) => p.base === fBase);
    if (fStatus !== "all") list = list.filter((p) => p.registration_status === fStatus);
    if (activeCard) list = applyCardFilter(list, activeCard);
    if (fExpiry !== "all") {
      list = list.filter((p) => {
        const exp = collectExpiries(p);
        if (fExpiry === "expired") return exp.some((e) => daysUntil(e.date) < 0);
        if (fExpiry === "15") return exp.some((e) => { const d = daysUntil(e.date); return d >= 0 && d <= 15; });
        if (fExpiry === "30") return exp.some((e) => { const d = daysUntil(e.date); return d > 15 && d <= 30; });
        if (fExpiry === "60") return exp.some((e) => { const d = daysUntil(e.date); return d > 30 && d <= 60; });
        if (fExpiry === "90") return exp.some((e) => { const d = daysUntil(e.date); return d > 60 && d <= 90; });
        return true;
      });
    }
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((p) => [p.full_name, p.war_name, p.registration, p.anac_code, p.email].filter(Boolean).join(" ").toLowerCase().includes(q));
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
  }, [pilots, fRole, fBase, fStatus, fExpiry, query, sortBy, activeCard]);

  const indicators = useMemo(() => {
    if (!pilots) return null;
    const active = pilots.filter((p) => p.registration_status === "active").length;
    const training = pilots.filter((p) => p.registration_status === "training").length;
    const pending = pilots.filter((p) => p.registration_status === "pending" || p.approval_status === "pending").length;
    let cma30 = 0, cmaExpired = 0, habNear = 0, habExpired = 0, docPending = 0;
    pilots.forEach((p) => {
      const cma = safeParse(p.cma, null);
      const cs = cmaStatus(cma);
      if (cs.status === "expired") cmaExpired++;
      else if (cs.days !== null && cs.days <= 30) cma30++;
      const exp = collectExpiries(p);
      exp.forEach((e) => {
        const d = daysUntil(e.date);
        if (d < 0) { if (e.kind === "Habilitação") habExpired++; }
        else if (d <= 90 && e.kind === "Habilitação") habNear++;
      });
      const docs = safeParse(p.documents, []);
      docPending += docs.filter((d) => !d.category).length;
    });
    return { active, training, pending, cma30, cmaExpired, habNear, habExpired, docPending };
  }, [pilots]);

  const fromList = selected ? pilots?.find((p) => p.id === selected.id) : null;
  const selectedPilot = fromList || selected;

  if (!pilots || !me) {
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
            Cadastro de Pilotos
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Gestão documental, habilitações, vencimentos e experiência operacional.</p>
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
          {isManager && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" /> Novo Piloto
            </button>
          )}
        </div>
      </header>

      {selectedPilot ? (
        <PilotProfile
          pilot={selectedPilot}
          me={me}
          isManager={isManager}
          onBack={() => setSelected(null)}
          onRefresh={load}
        />
      ) : (
        <>
          {/* Indicators */}
          {indicators && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <Indicator label="Pilotos ativos" value={indicators.active} color="emerald" icon={CheckCircle2} onClick={() => setActiveCard("active")} active={activeCard === "active"} />
              <Indicator label="Em treinamento" value={indicators.training} color="violet" icon={Clock} onClick={() => setActiveCard("training")} active={activeCard === "training"} />
              <Indicator label="Cadastros pendentes" value={indicators.pending} color="amber" icon={Hourglass} onClick={() => setActiveCard("pending")} active={activeCard === "pending"} />
              <Indicator label="CMA ≤ 30 dias" value={indicators.cma30} color="orange" icon={HeartPulse} onClick={() => setActiveCard("cma30")} active={activeCard === "cma30"} />
              <Indicator label="CMA vencidos" value={indicators.cmaExpired} color="rose" icon={HeartPulse} onClick={() => setActiveCard("cmaExpired")} active={activeCard === "cmaExpired"} />
              <Indicator label="Habilitações vencendo" value={indicators.habNear} color="yellow" icon={ShieldCheck} onClick={() => setActiveCard("habNear")} active={activeCard === "habNear"} />
              <Indicator label="Habilitações vencidas" value={indicators.habExpired} color="rose" icon={ShieldCheck} onClick={() => setActiveCard("habExpired")} active={activeCard === "habExpired"} />
              <Indicator label="Documentos pendentes" value={indicators.docPending} color="amber" icon={FileWarning} onClick={() => setActiveCard("docPending")} active={activeCard === "docPending"} />
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
                placeholder="Pesquisar por nome, #CANAC/CPF…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
              />
            </div>
            <Select value={fRole} onChange={setFRole} options={[{ v: "all", l: "Todas funções" }, ...Object.entries(ROLE_LABELS).map(([v, l]) => ({ v, l }))]} />
            <Select value={fBase} onChange={setFBase} options={[{ v: "all", l: "Todas bases" }, ...bases.map((b) => ({ v: b, l: b }))]} />
            <Select value={fStatus} onChange={setFStatus} options={[{ v: "all", l: "Todas situações" }, ...Object.entries(REGISTRATION_STATUS_LABELS).map(([v, l]) => ({ v, l }))]} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500">{filtered.length} piloto(s)</p>
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
              {filtered.map((p) => {
                const crit = nextCriticalExpiry(p);
                const exp = crit ? EXPIRY_COLORS[crit.status] : EXPIRY_COLORS.none;
                const cma = safeParse(p.cma, null);
                const cmaSt = cmaStatus(cma);
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`text-left bg-[#1A1D25] rounded-2xl border transition-colors p-5 hover:shadow-lg hover:shadow-black/30 group ${
                      p.approval_status === "pending" ? "border-amber-500/40 ring-1 ring-amber-500/20" :
                      p.approval_status === "rejected" ? "border-rose-500/40 ring-1 ring-rose-500/20" :
                      "border-slate-700/60 hover:border-amber-500/40"
                    }`}
                  >
                    {p.approval_status === "pending" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
                        <Hourglass className="w-3 h-3" /> Aguardando aprovação
                      </span>
                    )}
                    {p.approval_status === "rejected" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 mb-2">
                        <X className="w-3 h-3" /> Rejeitado
                      </span>
                    )}
                    <div className="flex items-start gap-4">
                      <Avatar pilot={p} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-slate-100 truncate">{p.full_name}</h3>
                          {p.is_master && <BadgeCheck className="w-4 h-4 text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-amber-400/90 font-medium">{ROLE_LABELS[p.role] || p.role}</p>
                        <p className="text-[11px] text-slate-500 mt-1 truncate">
                          {p.registration ? `#CANAC/CPF ${p.registration} · ` : p.anac_code ? `CANAC ${p.anac_code} · ` : ""}{p.base || "Sem base"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/40">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${REGISTRATION_STATUS_STYLES[p.registration_status] || REGISTRATION_STATUS_STYLES.inactive || ""}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        {REGISTRATION_STATUS_LABELS[p.registration_status] || p.registration_status}
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
        <NewPilotForm
          me={me}
          onClose={() => setShowForm(false)}
          onDone={() => { setShowForm(false); load(); }}
        />
      )}

      {showApprovals && (
        <ApprovalsPanel
          requests={requests}
          setRequests={setRequests}
          onClose={() => setShowApprovals(false)}
          onDecision={() => load()}
        />
      )}
    </div>
  );
}

function applyCardFilter(list, card) {
  switch (card) {
    case "active": return list.filter((p) => p.registration_status === "active");
    case "training": return list.filter((p) => p.registration_status === "training");
    case "pending": return list.filter((p) => p.registration_status === "pending" || p.approval_status === "pending");
    case "cma30": return list.filter((p) => { const cs = cmaStatus(safeParse(p.cma, null)); return cs.days !== null && cs.days >= 0 && cs.days <= 30; });
    case "cmaExpired": return list.filter((p) => cmaStatus(safeParse(p.cma, null)).status === "expired");
    case "habNear": return list.filter((p) => collectExpiries(p).some((e) => { const d = daysUntil(e.date); return e.kind === "Habilitação" && d >= 0 && d <= 90; }));
    case "habExpired": return list.filter((p) => collectExpiries(p).some((e) => { const d = daysUntil(e.date); return e.kind === "Habilitação" && d < 0; }));
    case "docPending": return list.filter((p) => safeParse(p.documents, []).some((d) => !d.category));
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

function Avatar({ pilot, size = "md" }) {
  const cls = size === "lg" ? "w-14 h-14 rounded-xl" : "w-16 h-16 rounded-xl";
  return (
    <div className={`${cls} bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0 overflow-hidden`}>
      {pilot?.photo_uri ? (
        <img src={pilot.photo_uri} alt={pilot?.full_name || "Foto"} className="w-full h-full object-cover" />
      ) : (
        <span className="text-lg font-bold text-amber-400/60">{(pilot?.full_name || "?").slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
      <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
      <p className="text-sm text-slate-500">Nenhum piloto encontrado. Use "Novo Piloto" para cadastrar.</p>
    </div>
  );
}

// ---------- APPROVALS ----------
function ApprovalsPanel({ requests, setRequests, onClose, onDecision }) {
  useEffect(() => {
    base44.entities.PilotChangeRequest.list("-created_date", 100).then((r) => setRequests(r)).catch(() => setRequests([]));
  }, []);

  const decide = async (req, status) => {
    const me = await base44.auth.me().catch(() => null);
    const by = me ? me.email || me.id : "desconhecido";
    await base44.entities.PilotChangeRequest.update(req.id, {
      status, reviewed_by: by, reviewed_at: new Date().toISOString(),
    });
    if (status === "approved") {
      const changes = safeParse(req.changes, {});
      let patch = {};
      if (changes.fields) {
        patch = changes.fields;
        if (changes.fields.hours) patch.hours = JSON.stringify(changes.fields.hours);
        if (changes.fields.licenses) patch.licenses = JSON.stringify(changes.fields.licenses);
        if (changes.fields.certificates) patch.certificates = JSON.stringify(changes.fields.certificates);
        if (changes.fields.documents) patch.documents = JSON.stringify(changes.fields.documents);
      }
      if (Object.keys(patch).length) await base44.entities.Pilot.update(req.pilot_id, { ...patch, approval_status: "approved" });
    }
    setRequests((r) => r.map((x) => x.id === req.id ? { ...x, status } : x));
    onDecision();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-100">Fluxo de Aprovação</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5">
          {requests.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Nenhuma alteração pendente.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => {
                const changes = safeParse(r.changes, {});
                return (
                  <div key={r.id} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-200">{r.pilot_name}</p>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${r.status === "pending" ? "border-amber-500/30 text-amber-300 bg-amber-500/10" : r.status === "approved" ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" : "border-rose-500/30 text-rose-300 bg-rose-500/10"}`}>
                        {r.status === "pending" ? "Pendente" : r.status === "approved" ? "Aprovado" : "Rejeitado"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Solicitado por {r.requested_by}</p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{(changes.fields && Object.keys(changes.fields).join(", ")) || (changes.description) || "Campos alterados"}</p>
                    {r.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => decide(r, "approved")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                        </button>
                        <button onClick={() => decide(r, "rejected")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25">
                          <X className="w-3.5 h-3.5" /> Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}