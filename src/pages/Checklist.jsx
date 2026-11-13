import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CHECKLIST_PHASES, getChecklistPhases } from "@/lib/checklistData";
import {
  getH125OperationalPhases,
  getH125OperationalVariant,
  H125_OPERATIONAL_VARIANTS,
} from "@/lib/h125OperationalChecklistData";
import { useChecklistValidation } from "@/lib/useChecklistValidation";
import ChecklistValidationPanel from "@/components/checklist/ChecklistValidationPanel";
import ChecklistReviewMode from "@/components/checklist/ChecklistReviewMode";
import ChecklistPhaseTabs from "@/components/checklist/ChecklistPhaseTabs";
import ChecklistSectionList from "@/components/checklist/ChecklistSectionList";
import ChecklistSummaryBar from "@/components/checklist/ChecklistSummaryBar";
import FinalizeModal from "@/components/checklist/FinalizeModal";
import ChecklistHistoryList from "@/components/checklist/ChecklistHistoryList";
import ChecklistHistoryDetail from "@/components/checklist/ChecklistHistoryDetail";
import StartChecklistFlow from "@/components/checklist/StartChecklistFlow";
import { useProfile } from "@/lib/ProfileContext";
import { useAuth } from "@/lib/AuthContext";
import { getAccessLevel } from "@/lib/accessControl";
import { enqueueOperation, newClientKey } from "@/lib/offlineStore";
import { isNetworkError } from "@/lib/useOnlineStatus";
import { ShieldCheck, AlertTriangle, BadgeCheck, Clock, XCircle, Plane } from "lucide-react";

const DRAFT_KEY = "checklist_draft_v2";

const VALIDATION_META = {
  pending: { label: "Pendente", badge: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  approved: { label: "Aprovado", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  rejected: { label: "Reprovado", badge: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
};

export default function Checklist() {
  const { profileFilter, profileValue, h125SubVariant, trocarSubvarianteH125, modulosPermitidos, trocarAeronave } = useProfile();
  const { user } = useAuth();

  // H125: resolve a variante operacional (B2/B3e) e as fases correspondentes
  const isH125 = profileValue === "H125";
  const h125VariantKey = isH125 ? getH125OperationalVariant(h125SubVariant) : null;
  const PHASES = isH125 ? getH125OperationalPhases(h125VariantKey) : getChecklistPhases(profileValue);
  
  const validationKey = isH125 ? h125VariantKey : profileValue;
  const { validationMap } = useChecklistValidation(validationKey);
  const canValidate = getAccessLevel(user) === "admin_geral";

  const [view, setView] = useState("new"); // new | history
  const [aircraft, setAircraft] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [setup, setSetup] = useState(null);
  const [activePhase, setActivePhase] = useState(PHASES[0]?.id);
  const [checkedByPhase, setCheckedByPhase] = useState({});
  const [discrepanciesByPhase, setDiscrepanciesByPhase] = useState({});
  const [query, setQuery] = useState("");
  const [showStartFlow, setShowStartFlow] = useState(false);
  const [showFinalize, setShowFinalize] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [offlineNotice, setOfflineNotice] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewFase = searchParams.get("fase");
  const reviewModelo = searchParams.get("modelo");
  const reviewVariante = searchParams.get("variante");

  // Reset da fase ativa quando o perfil da aeronave ou variante muda
  useEffect(() => {
    setActivePhase(PHASES[0]?.id);
    setDiscrepanciesByPhase({});
  }, [profileValue, h125VariantKey]);

  // Deep-link: alternar perfil/variante/fase a partir de parâmetros de URL (painel de aprovações)
  useEffect(() => {
    if (!reviewModelo) return;
    if (reviewModelo !== profileValue && modulosPermitidos.includes(reviewModelo)) {
      trocarAeronave(reviewModelo);
    }
  }, [reviewModelo, profileValue, modulosPermitidos, trocarAeronave]);

  useEffect(() => {
    if (!reviewVariante || profileValue !== "H125") return;
    const variantMap = { B2: "b2_vemd", B3e: "b3e_arriel2d" };
    const target = variantMap[reviewVariante];
    if (target && target !== h125SubVariant) {
      trocarSubvarianteH125(target);
    }
  }, [reviewVariante, profileValue, h125SubVariant, trocarSubvarianteH125]);

  useEffect(() => {
    if (reviewFase && PHASES.find((p) => p.id === reviewFase)) {
      setActivePhase(reviewFase);
    }
  }, [reviewFase, PHASES]);

  useEffect(() => {
    Promise.all([
      base44.entities.Aircraft.filter(profileFilter).catch(() => []),
      base44.entities.ChecklistRecord.filter(profileFilter, { sort: "-date", limit: 100 }).then(r => r.items).catch(() => []),
      base44.auth.me().catch(() => null),
    ]).then(([a, r, u]) => {
      setAircraft(a);
      setRecords(r);
      setCurrentUser(u);
      setLoading(false);
      try {
        const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
        if (draft) {
          setSetup(draft.setup);
          setActivePhase(draft.activePhase || PHASES[0]?.id);
          setCheckedByPhase(draft.checkedByPhase || {});
          setDiscrepanciesByPhase(draft.discrepanciesByPhase || {});
          setStartedAt(draft.startedAt);
        }
      } catch {}
    });
  }, []);

  const persistDraft = (next) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      setup, activePhase, checkedByPhase, discrepanciesByPhase, startedAt, ...next,
    }));
  };

  const startSetup = (data) => {
    setSetup(data);
    setStartedAt(Date.now());
    setCheckedByPhase({});
    setDiscrepanciesByPhase({});
    setActivePhase(PHASES[0]?.id);
    setShowStartFlow(false);
    persistDraft({ setup: data, startedAt: Date.now(), checkedByPhase: {}, discrepanciesByPhase: {}, activePhase: PHASES[0]?.id });
  };

  const beginNewChecklist = () => {
    setSearchParams({});
    if (setup) {
      setSetup(null);
      setCheckedByPhase({});
      setDiscrepanciesByPhase({});
      setStartedAt(null);
      setActivePhase(PHASES[0]?.id);
      localStorage.removeItem(DRAFT_KEY);
    }
    setShowStartFlow(true);
  };

  const toggleItem = (phaseId, idx) => {
    setCheckedByPhase((prev) => {
      const next = { ...prev, [phaseId]: { ...(prev[phaseId] || {}), [idx]: !prev[phaseId]?.[idx] } };
      persistDraft({ checkedByPhase: next });
      return next;
    });
  };

  const setDiscrepancy = (phaseId, text) => {
    setDiscrepanciesByPhase((prev) => {
      const next = { ...prev, [phaseId]: text };
      persistDraft({ discrepanciesByPhase: next });
      return next;
    });
  };

  const selectPhase = (id) => {
    setActivePhase(id);
    setQuery("");
    persistDraft({ activePhase: id });
  };

  const progressByPhase = useMemo(() => {
    const map = {};
    PHASES.forEach((p) => {
      const total = p.sections.reduce((s, sec) => s + sec.items.length, 0);
      const done = Object.values(checkedByPhase[p.id] || {}).filter(Boolean).length;
      map[p.id] = { total, done };
    });
    return map;
  }, [checkedByPhase, PHASES]);

  const currentPhase = PHASES.find((p) => p.id === activePhase) || PHASES[0];
  const flatSections = useMemo(() => {
    let idx = -1;
    const sections = currentPhase.sections.map((sec) => ({
      category: sec.category,
      items: sec.items.map((text) => ({ idx: ++idx, text })),
    }));
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.map((s) => ({ ...s, items: s.items.filter((i) => i.text.toLowerCase().includes(q)) })).filter((s) => s.items.length > 0);
  }, [currentPhase, query]);

  const isLastPhase = activePhase === PHASES[PHASES.length - 1].id;

  const pendingItems = useMemo(() => {
    const list = [];
    PHASES.forEach((p) => {
      let idx = -1;
      p.sections.forEach((sec) => {
        sec.items.forEach((text) => {
          idx++;
          if (!checkedByPhase[p.id]?.[idx]) {
            list.push({ phaseId: p.id, phaseTitle: p.name, localIdx: idx, text });
          }
        });
      });
    });
    return list;
  }, [checkedByPhase, PHASES]);

  const finalize = async (justifications) => {
    const phasesProgress = {};
    if (isH125) phasesProgress.__variant = h125VariantKey;
    PHASES.forEach((p) => {
      let idx = -1;
      const items = p.sections.flatMap((sec) => sec.items.map((text) => ({
        idx: ++idx,
        text,
        checked: !!checkedByPhase[p.id]?.[idx],
        justification: checkedByPhase[p.id]?.[idx] ? null : (justifications[p.id]?.[idx] || null),
      })));
      phasesProgress[p.id] = {
        items,
        total: items.length,
        done: items.filter((i) => i.checked).length,
        discrepancy: discrepanciesByPhase[p.id] || null,
      };
    });
    const durationMinutes = startedAt ? Math.round((Date.now() - startedAt) / 60000) : 0;
    const endTime = new Date().toTimeString().slice(0, 5);
    const clientKey = newClientKey();
    const allDiscrepancies = Object.values(discrepanciesByPhase).filter(Boolean).join(" | ");
    const payload = {
      ...setup,
      aircraftProfile: profileValue,
      end_time: endTime,
      finalized_at: new Date().toISOString(),
      finalized_by: currentUser?.full_name || currentUser?.email || "",
      executed_by: currentUser?.full_name || currentUser?.email || "",
      phases_progress: JSON.stringify(phasesProgress),
      justification: allDiscrepancies || "",
      status: "ok",
      duration_minutes: durationMinutes,
      client_key: clientKey,
    };

    const resetAfterSave = async () => {
      localStorage.removeItem(DRAFT_KEY);
      setSetup(null);
      setCheckedByPhase({});
      setDiscrepanciesByPhase({});
      setStartedAt(null);
      setShowFinalize(false);
      const r = await base44.entities.ChecklistRecord.filter(profileFilter, { sort: "-date", limit: 100 }).then(res => res.items).catch(() => null);
      if (r) setRecords(r);
      setView("history");
    };

    try {
      await base44.entities.ChecklistRecord.create(payload);
      await resetAfterSave();
      setOfflineNotice("");
    } catch (err) {
      if (isNetworkError(err)) {
        try {
          await enqueueOperation({ entity: "ChecklistRecord", payload, clientKey });
          await resetAfterSave();
          setOfflineNotice(
            "Checklist guardado neste dispositivo. Será enviado automaticamente quando a conexão retornar."
          );
        } catch (queueErr) {
          alert(
            "Não foi possível guardar o checklist neste dispositivo: " +
              (queueErr?.message || "erro desconhecido")
          );
        }
      } else {
        alert(err?.response?.data?.error || err?.data?.error || err.message || "Erro ao finalizar checklist.");
      }
    }
  };

  const duplicateRecord = (record) => {
    const data = {
      date: new Date().toISOString().slice(0, 10),
      start_time: new Date().toTimeString().slice(0, 5),
      aircraft_id: record.aircraft_id,
      aircraft_registration: record.aircraft_registration,
      horimeter_initial: "",
      fuel_initial: "",
      pax_count: record.pax_count,
      pic_name: record.pic_name,
      pic_canac: record.pic_canac,
      sic_name: record.sic_name,
      sic_canac: record.sic_canac,
      mission_type: record.mission_type,
    };
    setShowStartFlow(false);
    startSetup(data);
  };

  const toggleFavorite = async (record) => {
    await base44.entities.ChecklistRecord.update(record.id, { favorite: !record.favorite });
    setRecords((prev) => prev.map((r) => (r.id === record.id ? { ...r, favorite: !r.favorite } : r)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Operações</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Checklists</h1>
          <p className="text-slate-400 mt-2 text-sm">Sistema digital de execução e registro de checklists operacionais</p>
        </div>
        <div className="flex items-center gap-3">
          {canValidate && (
            <button
              onClick={() => setShowValidation(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" /> Validação
            </button>
          )}
          <button
            onClick={beginNewChecklist}
            className="inline-flex items-center gap-2 rounded-lg text-sm font-medium bg-amber-500 text-slate-900 hover:bg-amber-400 px-4 py-2 shadow-lg shadow-amber-500/20 transition-colors"
          >
            Novo checklist
          </button>
          <div className="inline-flex bg-[#1A1D25] border border-slate-700/60 rounded-lg p-1 text-sm">
            <button onClick={() => setView("new")} className={`px-4 py-1.5 rounded-md font-medium transition-colors ${view === "new" && !showStartFlow ? "bg-amber-500 text-slate-900" : "text-slate-400"}`}>
              Execução
            </button>
            <button onClick={() => setView("history")} className={`px-4 py-1.5 rounded-md font-medium transition-colors ${view === "history" ? "bg-amber-500 text-slate-900" : "text-slate-400"}`}>
              Histórico
            </button>
          </div>
        </div>
      </header>

      {/* Seletor de variante H125 */}
      {isH125 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Plane className="w-4 h-4 text-amber-400" /> Variante:
          </div>
          <div className="inline-flex bg-[#1A1D25] border border-slate-700/60 rounded-lg p-1">
            {H125_OPERATIONAL_VARIANTS.map((v) => {
              const active = v.id === h125VariantKey;
              return (
                <button
                  key={v.id}
                  onClick={() => trocarSubvarianteH125(v.id === "B3e" ? "b3e_arriel2d" : "b2_vemd")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    active ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Aviso de validação técnica pendente (H125) */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Material transcrito da fonte fornecida, <strong>dependente de validação técnica aeronáutica</strong>. Não substitui o
          manual oficial do fabricante, que deve permanecer a bordo conforme exigências da ANAC.
        </p>
      </div>
      {offlineNotice && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
        >
          <span>{offlineNotice}</span>
          <button
            type="button"
            onClick={() => setOfflineNotice("")}
            className="font-medium underline underline-offset-4"
          >
            Fechar
          </button>
        </div>
      )}

      {view === "history" ? (
        <ChecklistHistoryList records={records} onView={setViewingRecord} onDuplicate={duplicateRecord} onToggleFavorite={toggleFavorite} />
      ) : showStartFlow ? (
        <StartChecklistFlow aircraft={aircraft} onCancel={() => setShowStartFlow(false)} onStart={startSetup} />
      ) : !setup && reviewFase ? (
        <ChecklistReviewMode
          phases={PHASES}
          activePhase={activePhase}
          onSelectPhase={selectPhase}
          isH125={isH125}
          validationMap={validationMap}
          canValidate={canValidate}
          onOpenValidation={() => setShowValidation(true)}
        />
      ) : !setup ? (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-14 text-center">
          {aircraft.length === 0 ? (
            <>
              <p className="text-sm text-slate-400">Nenhuma aeronave cadastrada.</p>
              <p className="text-xs text-slate-500 mt-2">Para iniciar um checklist, cadastre uma aeronave antes.</p>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-400">Nenhum checklist em andamento.</p>
              <p className="text-xs text-slate-500 mt-2">Selecione "Novo checklist" para iniciar.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="bg-[#1A1D25] rounded-xl border border-slate-700/60 px-5 py-3 text-sm text-slate-400 flex flex-wrap gap-x-6 gap-y-1">
            <span><strong className="text-slate-200">{setup.aircraft_registration}</strong></span>
            <span>PIC: {setup.pic_name}</span>
            {setup.sic_name && <span>SIC: {setup.sic_name}</span>}
            <span>Início: {setup.start_time}</span>
          </div>

          <ChecklistPhaseTabs
            phases={PHASES}
            activeId={activePhase}
            progressByPhase={progressByPhase}
            onSelect={selectPhase}
          />

          {/* Badge de validação da fase ativa (H125) */}
          {currentPhase && (
            <PhaseValidationBadge
              status={validationMap[currentPhase.id]?.status || "pending"}
              reviewedBy={validationMap[currentPhase.id]?.reviewed_by}
              reviewedAt={validationMap[currentPhase.id]?.reviewed_at}
            />
          )}

          <h2 className="text-lg font-semibold text-slate-100">{currentPhase.title}</h2>

          <ChecklistSummaryBar
            title={currentPhase.name}
            done={progressByPhase[activePhase].done}
            total={progressByPhase[activePhase].total}
            query={query}
            onQuery={setQuery}
            onSaveDraft={() => { persistDraft({}); setView("history"); }}
            onFinalize={() => setShowFinalize(true)}
            isLastPhase={isLastPhase}
          />

          <ChecklistSectionList
            sections={flatSections}
            checked={checkedByPhase[activePhase] || {}}
            onToggle={(idx) => toggleItem(activePhase, idx)}
            finalized={false}
          />

          {/* Campo de discrepância ao final da etapa */}
          <DiscrepancyField
            phaseId={activePhase}
            value={discrepanciesByPhase[activePhase] || ""}
            onChange={(text) => setDiscrepancy(activePhase, text)}
          />
        </>
      )}

      {showFinalize && (
        <FinalizeModal
          aircraftReg={setup?.aircraft_registration}
          user={currentUser?.full_name || currentUser?.email || ""}
          pendingItems={pendingItems}
          onClose={() => setShowFinalize(false)}
          onConfirm={finalize}
        />
      )}
      {viewingRecord && (
        <ChecklistHistoryDetail record={viewingRecord} onClose={() => setViewingRecord(null)} />
      )}
      {showValidation && canValidate && (
        <ChecklistValidationPanel
          variantKey={validationKey}
          variantLabel={
            isH125
              ? h125VariantKey === "B3e" ? "AS350 B3e" : "AS350 B2"
              : "AW119"
          }
          phases={PHASES}
          onClose={() => setShowValidation(false)}
        />
      )}
    </div>
  );
}

function PhaseValidationBadge({ status, reviewedBy, reviewedAt }) {
  const meta = VALIDATION_META[status] || VALIDATION_META.pending;
  const Icon = status === "approved" ? BadgeCheck : status === "rejected" ? XCircle : Clock;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${meta.badge}`}>
        <Icon className="w-3 h-3" /> Validação técnica: {meta.label}
      </span>
      {reviewedBy && status !== "pending" && (
        <span className="text-slate-500">
          {reviewedBy}{reviewedAt ? ` · ${new Date(reviewedAt).toLocaleDateString("pt-BR")}` : ""}
        </span>
      )}
    </div>
  );
}

function DiscrepancyField({ phaseId, value, onChange }) {
  const [expanded, setExpanded] = useState(!!value);
  return (
    <div className="rounded-xl border border-slate-700/60 bg-[#1A1D25] overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-300 hover:text-slate-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400/70" />
          Registrar discrepância desta etapa
        </span>
        <span className="text-xs text-slate-500">{expanded ? "Recolher" : "Expandir"}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Descreva qualquer discrepância encontrada durante a execução desta etapa (opcional)…"
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 resize-none"
          />
          {value && (
            <p className="mt-1.5 text-xs text-slate-500">A discrepância será registrada no histórico do checklist.</p>
          )}
        </div>
      )}
    </div>
  );
}
