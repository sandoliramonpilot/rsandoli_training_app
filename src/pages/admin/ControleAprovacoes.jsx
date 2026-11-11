import React, { useEffect, useMemo, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { getAccessLevel } from "@/lib/accessControl";
import {
  AREAS, AREA_LABEL, APPROVAL_SOURCES, APPROVAL_SOURCE_LABEL, SOURCE_BY_KEY, SOURCES_BY_AREA,
  DECISION_LABELS, DECISION_OPTIONS, DISPLAY_STATUS, SAMPLE_ITEMS, SAMPLE_HISTORY,
} from "@/lib/approvalSources";
import BackToDashboard from "@/components/BackToDashboard";
import {
  ShieldCheck, ListChecks, History as HistoryIcon, Search, XCircle, FileText,
  CheckCircle2, XCircle as RejectIcon, AlertTriangle, PauseCircle, PlayCircle,
  ChevronRight, X, Inbox, LayoutDashboard, ClipboardList, GraduationCap, Library,
  Users, Plane, Award, BadgeCheck, Siren, ClipboardCheck, UserPlus, UserCog,
  HeartPulse, Circle,
} from "lucide-react";

const AREA_ICON = { principal: LayoutDashboard, operacoes: ClipboardList, academy: GraduationCap, biblioteca: Library, administracao: ShieldCheck };

const SOURCE_ICON = {
  aircraft: Plane, pilot: Users, pilot_license: Award, pilot_habilitacao: BadgeCheck,
  qrh_validation: Siren, checklist_validation: ClipboardCheck, training_doc: GraduationCap,
  library_doc: Library, user_invite: UserPlus, pilot_change: UserCog, oat_change: HeartPulse,
};

const DECISION_ICON = {
  approved: CheckCircle2, rejected: RejectIcon, correction_requested: AlertTriangle,
  suspended: PauseCircle, unsuspended: PlayCircle,
};

const TONE_BADGE = {
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  orange: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  sky: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  slate: "bg-slate-700/40 text-slate-300 border-slate-600/40",
};

const STATUS_FILTERS = [
  { v: "all", label: "Todos" },
  { v: "pending", label: "Pendentes" },
  { v: "approved", label: "Aprovados" },
  { v: "rejected", label: "Reprovados" },
  { v: "correction", label: "Em correção" },
  { v: "suspended", label: "Suspensos" },
];

export default function ControleAprovacoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("fila");
  const [area, setArea] = useState("principal");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [usingSample, setUsingSample] = useState(false);

  // filtros da área
  const [statusFilter, setStatusFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [query, setQuery] = useState("");

  // detalhe
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState("approved");
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdminGeral = getAccessLevel(user) === "admin_geral";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageApprovalCentral", { action: "list" });
      setItems(res.items || []);
      setUsingSample(false);
    } catch (e) {
      setItems(SAMPLE_ITEMS);
      setUsingSample(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("manageApprovalCentral", { action: "history", limit: 200 });
      setHistory(res.items || []);
    } catch (e) {
      setHistory(SAMPLE_HISTORY);
    }
  }, []);

  useEffect(() => {
    if (!isAdminGeral) { setLoading(false); return; }
    load();
  }, [isAdminGeral, load]);

  useEffect(() => {
    if (tab === "historico" && isAdminGeral) loadHistory();
  }, [tab, isAdminGeral, loadHistory]);

  // Contadores por área (pendentes e total).
  const areaCounts = useMemo(() => {
    const counts = {};
    for (const a of AREAS) counts[a.key] = { pending: 0, total: 0 };
    for (const it of items) {
      if (!counts[it.area]) continue;
      counts[it.area].total += 1;
      if (it.display_status === "pending") counts[it.area].pending += 1;
    }
    return counts;
  }, [items]);

  const totalPending = useMemo(() => items.filter((i) => i.display_status === "pending").length, [items]);
  const totalSuspended = useMemo(() => items.filter((i) => i.display_status === "suspended").length, [items]);
  const totalApproved = useMemo(() => items.filter((i) => i.display_status === "approved").length, [items]);
  const totalRejected = useMemo(() => items.filter((i) => i.display_status === "rejected").length, [items]);

  // Itens da área atual com filtros aplicados.
  const areaItems = useMemo(() => {
    let list = items.filter((i) => i.area === area);
    if (statusFilter !== "all") list = list.filter((i) => i.display_status === statusFilter);
    if (moduleFilter !== "all") list = list.filter((i) => i.source_key === moduleFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (i) => (i.title || "").toLowerCase().includes(q) || (i.subtitle || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, area, statusFilter, moduleFilter, query]);

  const openDetail = (item) => {
    setSelected(item);
    setDecision(item.display_status === "suspended" ? "unsuspended" : "approved");
    setJustification("");
  };

  const submitDecision = async () => {
    if (!selected) return;
    if (!justification.trim() && decision !== "approved") {
      toast({ title: "Informe a justificativa", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await base44.functions.invoke("manageApprovalCentral", {
        action: "decide",
        source_key: selected.source_key,
        id: selected.id,
        decision,
        justification: justification.trim(),
      });
      toast({ title: "Decisão registrada", description: DECISION_LABELS[decision]?.label || decision });
      setSelected(null);
      await load();
      if (tab === "historico") await loadHistory();
    } catch (e) {
      toast({ title: "Erro ao registrar decisão", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdminGeral) {
    return (
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
        <XCircle className="w-10 h-10 text-rose-500/60 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Acesso restrito ao Administrador Geral.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Administração</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Controle de Aprovações
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            Central unificada de análise, aprovação, reprovação, correção e suspensão de registros e documentos de todos os módulos.
          </p>
        </div>
        <BackToDashboard />
      </header>

      {usingSample && (
        <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Modo demonstração: a função de backend <code>manageApprovalCentral</code> ainda não está publicada. Os itens exibidos são exemplos.</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard icon={Inbox} label="Pendentes" value={totalPending} tone="amber" onClick={() => { setTab("fila"); setStatusFilter("pending"); }} />
        <SummaryCard icon={PauseCircle} label="Suspensos" value={totalSuspended} tone="orange" onClick={() => { setTab("fila"); setStatusFilter("suspended"); }} />
        <SummaryCard icon={CheckCircle2} label="Aprovados" value={totalApproved} tone="emerald" onClick={() => { setTab("fila"); setStatusFilter("approved"); }} />
        <SummaryCard icon={ListChecks} label="Total de itens" value={items.length} tone="slate" />
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-[#1A1D25] border border-slate-700/60 rounded-lg p-1 text-sm">
        <TabButton active={tab === "fila"} onClick={() => setTab("fila")} icon={ListChecks} label="Fila de Análise" />
        <TabButton active={tab === "historico"} onClick={() => setTab("historico")} icon={HistoryIcon} label="Histórico" />
      </div>

      {tab === "fila" && (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
          {/* Menu lateral interno por área */}
          <aside className="md:sticky md:top-4 md:self-start">
            <p className="px-2 mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Áreas</p>
            <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
              {AREAS.map((a) => {
                const Icon = AREA_ICON[a.key] || ShieldCheck;
                const active = area === a.key;
                const c = areaCounts[a.key] || { pending: 0, total: 0 };
                return (
                  <button
                    key={a.key}
                    onClick={() => { setArea(a.key); setStatusFilter("all"); setModuleFilter("all"); }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap md:w-full text-left ${
                      active ? "bg-amber-500/15 text-amber-300 border border-amber-500/20" : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{a.label}</span>
                    {c.pending > 0 ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">{c.pending}</span>
                    ) : (
                      <span className="text-[10px] text-slate-600">{c.total}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Painel da área */}
          <div className="min-w-0 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {(() => {
                  const AIcon = AREA_ICON[area] || ShieldCheck;
                  return <AIcon className="w-4 h-4 text-amber-400" />;
                })()}
                <h2 className="text-base font-semibold text-slate-100">{AREA_LABEL[area]}</h2>
                <span className="text-xs text-slate-500">{areaItems.length} item(ns)</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <div className="inline-flex bg-[#1A1D25] border border-slate-700/60 rounded-lg p-1 text-xs overflow-x-auto">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.v}
                    onClick={() => setStatusFilter(f.v)}
                    className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${statusFilter === f.v ? "bg-amber-500 text-slate-900" : "text-slate-400"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="bg-[#1A1D25] border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value="all">Todos os tipos</option>
                {(SOURCES_BY_AREA[area] || []).map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por título ou descrição…"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : areaItems.length === 0 ? (
              <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
                <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Nenhum item nesta área com os filtros atuais.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {areaItems.map((item) => (
                  <FilaRow key={`${item.source_key}-${item.id}`} item={item} onClick={() => openDetail(item)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "historico" && (
        <HistoryView items={history} loading={loading && history.length === 0} />
      )}

      {selected && (
        <DetailDialog
          item={selected}
          decision={decision}
          setDecision={setDecision}
          justification={justification}
          setJustification={setJustification}
          submitting={submitting}
          onClose={() => setSelected(null)}
          onSubmit={submitDecision}
        />
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, tone, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border ${TONE_BADGE[tone]} px-4 py-3 flex items-center gap-3 text-left hover:brightness-110 transition`}
    >
      <Icon className="w-7 h-7" />
      <div>
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">{label}</p>
      </div>
    </button>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md font-medium transition-colors flex items-center gap-2 ${active ? "bg-amber-500 text-slate-900" : "text-slate-400"}`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function FilaRow({ item, onClick }) {
  const Icon = SOURCE_ICON[item.source_key] || ShieldCheck;
  const ds = DISPLAY_STATUS[item.display_status] || DISPLAY_STATUS.other;
  const StatusIcon = ds.icon === "CheckCircle2" ? CheckCircle2
    : ds.icon === "XCircle" ? RejectIcon
    : ds.icon === "AlertTriangle" ? AlertTriangle
    : ds.icon === "PauseCircle" ? PauseCircle
    : ds.icon === "Inbox" ? Inbox
    : Circle;
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#1A1D25] rounded-xl border border-slate-700/60 hover:border-amber-500/30 transition-colors px-4 py-3 flex items-center gap-4"
    >
      <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${TONE_BADGE[ds.tone]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-300">
            {APPROVAL_SOURCE_LABEL[item.source_key] || item.source_key}
          </span>
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${TONE_BADGE[ds.tone]}`}>
            <StatusIcon className="w-2.5 h-2.5" /> {ds.label}
          </span>
          <span className="text-sm font-medium text-slate-200 truncate">{item.title}</span>
        </div>
        {item.subtitle && <p className="text-xs text-slate-500 mt-1 truncate">{item.subtitle}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="text-[11px] text-slate-500">{item.created_date ? new Date(item.created_date).toLocaleDateString("pt-BR") : ""}</p>
        <ChevronRight className="w-4 h-4 text-slate-600 ml-auto mt-1" />
      </div>
    </button>
  );
}

function HistoryView({ items, loading }) {
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = items;
    if (decisionFilter !== "all") list = list.filter((h) => h.decision === decisionFilter);
    if (areaFilter !== "all") {
      const src = APPROVAL_SOURCES.find((s) => s.key === areaFilter);
      list = list.filter((h) => h.source_key === areaFilter || h.source_entity === (src?.entity || areaFilter));
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((h) => (h.record_title || "").toLowerCase().includes(q) || (h.justification || "").toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(b.reviewed_at || 0) - new Date(a.reviewed_at || 0));
  }, [items, decisionFilter, areaFilter, query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-3">
        <select value={decisionFilter} onChange={(e) => setDecisionFilter(e.target.value)} className="bg-[#1A1D25] border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200">
          <option value="all">Todas as decisões</option>
          {DECISION_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="bg-[#1A1D25] border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200">
          <option value="all">Todos os módulos</option>
          {APPROVAL_SOURCES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar no histórico…" className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
          <HistoryIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhuma decisão registrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((h) => {
            const Icon = DECISION_ICON[h.decision] || ShieldCheck;
            const tone = DECISION_LABELS[h.decision]?.tone || "slate";
            return (
              <div key={h.id} className="bg-[#1A1D25] rounded-xl border border-slate-700/60 px-4 py-3 flex items-start gap-4">
                <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${TONE_BADGE[tone]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-300">{h.module_label || APPROVAL_SOURCE_LABEL[h.source_key] || h.source_entity}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${TONE_BADGE[tone]}`}>{DECISION_LABELS[h.decision]?.label || h.decision}</span>
                    <span className="text-sm font-medium text-slate-200">{h.record_title}</span>
                  </div>
                  {h.justification && <p className="text-xs text-slate-400 mt-1">{h.justification}</p>}
                  <p className="text-[11px] text-slate-500 mt-1">
                    {h.reviewed_by_name || "—"} · {h.reviewed_at ? new Date(h.reviewed_at).toLocaleString("pt-BR") : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function DetailDialog({ item, decision, setDecision, justification, setJustification, submitting, onClose, onSubmit }) {
  const summary = item.summary || {};
  const isSuspended = item.display_status === "suspended";
  const [recordHistory, setRecordHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingHistory(true);
      try {
        const res = await base44.functions.invoke("manageApprovalCentral", {
          action: "history_for",
          source_entity: item.source_entity,
          source_record_id: item.id,
        });
        if (active) setRecordHistory(res.items || []);
      } catch {
        if (active) setRecordHistory([]);
      } finally {
        if (active) setLoadingHistory(false);
      }
    })();
    return () => { active = false; };
  }, [item.source_entity, item.id]);

  const availableDecisions = isSuspended
    ? DECISION_OPTIONS.filter((d) => d.value === "unsuspended" || d.value === "approved" || d.value === "rejected")
    : DECISION_OPTIONS.filter((d) => d.value !== "unsuspended");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl bg-[#16222F] border border-slate-700/60 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 sticky top-0 bg-[#16222F] z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-300">
              {APPROVAL_SOURCE_LABEL[item.source_key] || item.source_key}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${TONE_BADGE[(DISPLAY_STATUS[item.display_status] || DISPLAY_STATUS.other).tone]}`}>
              {(DISPLAY_STATUS[item.display_status] || DISPLAY_STATUS.other).label}
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
            {item.subtitle && <p className="text-sm text-slate-400 mt-1">{item.subtitle}</p>}
            <p className="text-[11px] text-slate-500 mt-1">Enviado em {item.created_date ? new Date(item.created_date).toLocaleString("pt-BR") : "—"}</p>
          </div>

          {Object.keys(summary).length > 0 && (
            <div className="rounded-xl border border-slate-700/60 bg-[#1A1D25] divide-y divide-slate-700/60">
              {Object.entries(summary).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-200 text-right">{String(v ?? "—")}</span>
                </div>
              ))}
            </div>
          )}

          {item.doc_uri && (
            <div className="rounded-xl border border-slate-700/60 bg-[#1A1D25] px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Documento</p>
              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    const { CreateFileSignedUrl } = base44.integrations.Core;
                    const { signed_url } = await CreateFileSignedUrl({ file_uri: item.doc_uri });
                    window.open(signed_url, "_blank");
                  } catch (err) {
                    window.open(item.doc_uri, "_blank");
                  }
                }}
                className="inline-flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200"
              >
                <FileText className="w-4 h-4" /> {item.doc_name || "Abrir documento"}
              </a>
            </div>
          )}

          {/* Histórico de decisões do registro */}
          <div className="rounded-xl border border-slate-700/60 bg-[#1A1D25] px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Histórico de decisões</p>
            {loadingHistory ? (
              <p className="text-xs text-slate-500">Carregando…</p>
            ) : recordHistory.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhuma decisão anterior registrada.</p>
            ) : (
              <div className="space-y-2">
                {recordHistory.map((h) => {
                  const Icon = DECISION_ICON[h.decision] || ShieldCheck;
                  const tone = DECISION_LABELS[h.decision]?.tone || "slate";
                  return (
                    <div key={h.id} className="flex items-start gap-2">
                      <div className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${TONE_BADGE[tone]}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-300">
                          <span className="font-medium">{DECISION_LABELS[h.decision]?.label || h.decision}</span>
                          <span className="text-slate-500"> · {h.reviewed_by_name || "—"}</span>
                        </p>
                        {h.justification && <p className="text-[11px] text-slate-500">{h.justification}</p>}
                        <p className="text-[10px] text-slate-600">{h.reviewed_at ? new Date(h.reviewed_at).toLocaleString("pt-BR") : ""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">Decisão</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableDecisions.map((d) => {
                const Icon = DECISION_ICON[d.value] || ShieldCheck;
                const active = decision === d.value;
                return (
                  <button
                    key={d.value}
                    onClick={() => setDecision(d.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition ${active ? `border-amber-500/50 ${TONE_BADGE[d.tone]}` : "border-slate-700/60 bg-[#1A1D25] text-slate-300 hover:border-amber-500/30"}`}
                  >
                    <Icon className="w-4 h-4" /> {d.label}
                  </button>
                );
              })}
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-slate-500">Justificativa</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={3}
                placeholder="Fundamente a decisão (obrigatório para reprovar, corrigir ou suspender)…"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-700/60 flex justify-end gap-2 sticky bottom-0 bg-[#16222F]">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5">Cancelar</button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-slate-900 hover:bg-amber-400 disabled:opacity-50"
          >
            {submitting ? "Registrando…" : "Registrar decisão"}
          </button>
        </div>
      </div>
    </div>
  );
}