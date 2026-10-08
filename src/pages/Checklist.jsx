import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CHECKLIST_PHASES } from "@/lib/checklistData";
import ChecklistPhaseTabs from "@/components/checklist/ChecklistPhaseTabs";
import ChecklistSectionList from "@/components/checklist/ChecklistSectionList";
import ChecklistSummaryBar from "@/components/checklist/ChecklistSummaryBar";
import FinalizeModal from "@/components/checklist/FinalizeModal";
import ChecklistHistoryList from "@/components/checklist/ChecklistHistoryList";
import ChecklistHistoryDetail from "@/components/checklist/ChecklistHistoryDetail";
import StartChecklistFlow from "@/components/checklist/StartChecklistFlow";

const DRAFT_KEY = "checklist_draft_v2";

export default function Checklist() {
  const [view, setView] = useState("new"); // new | history
  const [aircraft, setAircraft] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [setup, setSetup] = useState(null);
  const [activePhase, setActivePhase] = useState(CHECKLIST_PHASES[0].id);
  const [checkedByPhase, setCheckedByPhase] = useState({});
  const [query, setQuery] = useState("");
  const [showStartFlow, setShowStartFlow] = useState(false);
  const [showFinalize, setShowFinalize] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [startedAt, setStartedAt] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Aircraft.list().catch(() => []),
      base44.entities.ChecklistRecord.list("-date", 100).catch(() => []),
      base44.auth.me().catch(() => null),
    ]).then(([a, r, u]) => {
      setAircraft(a);
      setRecords(r);
      setUser(u);
      setLoading(false);
      try {
        const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
        if (draft) {
          setSetup(draft.setup);
          setActivePhase(draft.activePhase || CHECKLIST_PHASES[0].id);
          setCheckedByPhase(draft.checkedByPhase || {});
          setStartedAt(draft.startedAt);
        }
      } catch {}
    });
  }, []);

  const persistDraft = (next) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      setup, activePhase, checkedByPhase, startedAt, ...next,
    }));
  };

  const startSetup = (data) => {
    setSetup(data);
    setStartedAt(Date.now());
    setCheckedByPhase({});
    setActivePhase(CHECKLIST_PHASES[0].id);
    setShowStartFlow(false);
    persistDraft({ setup: data, startedAt: Date.now(), checkedByPhase: {}, activePhase: CHECKLIST_PHASES[0].id });
  };

  const beginNewChecklist = () => {
    if (setup) {
      // There is an in-progress checklist; start flow re-confirms a fresh aircraft.
      setSetup(null);
      setCheckedByPhase({});
      setStartedAt(null);
      setActivePhase(CHECKLIST_PHASES[0].id);
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

  const selectPhase = (id) => {
    setActivePhase(id);
    setQuery("");
    persistDraft({ activePhase: id });
  };

  const progressByPhase = useMemo(() => {
    const map = {};
    CHECKLIST_PHASES.forEach((p) => {
      const total = p.sections.reduce((s, sec) => s + sec.items.length, 0);
      const done = Object.values(checkedByPhase[p.id] || {}).filter(Boolean).length;
      map[p.id] = { total, done };
    });
    return map;
  }, [checkedByPhase]);

  const currentPhase = CHECKLIST_PHASES.find((p) => p.id === activePhase);
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

  const isLastPhase = activePhase === CHECKLIST_PHASES[CHECKLIST_PHASES.length - 1].id;

  const pendingItems = useMemo(() => {
    const list = [];
    CHECKLIST_PHASES.forEach((p) => {
      let idx = -1;
      p.sections.forEach((sec) => {
        sec.items.forEach((text) => {
          const globalIdx = (function () {
            let n = -1;
            for (const ph of CHECKLIST_PHASES) {
              for (const s of ph.sections) for (const it of s.items) {
                n++;
                if (ph.id === p.id && s === sec && it === text) return n;
              }
            }
            return n;
          })();
          if (!checkedByPhase[p.id]?.[idx]) {
            list.push({ phaseId: p.id, phaseTitle: p.name, localIdx: idx, text });
          }
          idx++;
        });
      });
    });
    return list;
  }, [checkedByPhase]);

  const finalize = async (justifications) => {
    const phasesProgress = {};
    CHECKLIST_PHASES.forEach((p) => {
      let idx = -1;
      const items = p.sections.flatMap((sec) => sec.items.map((text) => ({
        idx: ++idx,
        text,
        checked: !!checkedByPhase[p.id]?.[idx],
        justification: checkedByPhase[p.id]?.[idx] ? null : (justifications[p.id]?.[idx] || null),
      })));
      phasesProgress[p.id] = { items, total: items.length, done: items.filter((i) => i.checked).length };
    });
    const durationMinutes = startedAt ? Math.round((Date.now() - startedAt) / 60000) : 0;
    const endTime = new Date().toTimeString().slice(0, 5);
    try {
      await base44.entities.ChecklistRecord.create({
        ...setup,
        end_time: endTime,
        finalized_at: new Date().toISOString(),
        finalized_by: user?.full_name || user?.email || "",
        executed_by: user?.full_name || user?.email || "",
        phases_progress: JSON.stringify(phasesProgress),
        justification: "",
        status: "ok",
        duration_minutes: durationMinutes,
      });
      localStorage.removeItem(DRAFT_KEY);
      setSetup(null);
      setCheckedByPhase({});
      setStartedAt(null);
      setShowFinalize(false);
      const r = await base44.entities.ChecklistRecord.list("-date", 100).catch(() => []);
      setRecords(r);
      setView("history");
    } catch (err) {
      alert(err?.response?.data?.error || err?.data?.error || err.message || "Erro ao finalizar checklist.");
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

      {view === "history" ? (
        <ChecklistHistoryList records={records} onView={setViewingRecord} onDuplicate={duplicateRecord} onToggleFavorite={toggleFavorite} />
      ) : showStartFlow ? (
        <StartChecklistFlow aircraft={aircraft} onCancel={() => setShowStartFlow(false)} onStart={startSetup} />
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

          <ChecklistPhaseTabs activeId={activePhase} progressByPhase={progressByPhase} onSelect={selectPhase} />

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
        </>
      )}

      {showFinalize && (
        <FinalizeModal
          aircraftReg={setup?.aircraft_registration}
          user={user?.full_name || user?.email || ""}
          pendingItems={pendingItems}
          onClose={() => setShowFinalize(false)}
          onConfirm={finalize}
        />
      )}
      {viewingRecord && (
        <ChecklistHistoryDetail record={viewingRecord} onClose={() => setViewingRecord(null)} />
      )}
    </div>
  );
}