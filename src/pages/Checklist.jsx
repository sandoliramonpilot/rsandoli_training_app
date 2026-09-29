import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { CHECKLIST_PHASES, PHASE_LABELS } from "@/lib/checklistData";
import { CheckCircle2, Circle, Save, ClipboardCheck, AlertTriangle, Search, Star, X } from "lucide-react";

export default function Checklist() {
  const [aircraft, setAircraft] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("new");
  const [phaseId, setPhaseId] = useState("pre_flight");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [aircraftId, setAircraftId] = useState("");
  const [pilotName, setPilotName] = useState("");
  const [checked, setChecked] = useState({});
  const [discrepancies, setDiscrepancies] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("checklist_favorites") || "[]"); } catch { return []; }
  });

  const phase = CHECKLIST_PHASES.find((p) => p.id === phaseId) || CHECKLIST_PHASES[0];

  const allItems = useMemo(() => phase.sections.flatMap((s) => s.items), [phase]);
  const totalItems = allItems.length;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = totalItems ? Math.round((checkedCount / totalItems) * 100) : 0;

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return phase.sections;
    return phase.sections
      .map((s) => ({
        ...s,
        items: s.items.filter((i) => i.toLowerCase().includes(q)),
      }))
      .filter((s) => s.items.length > 0);
  }, [phase, query]);

  const load = async () => {
    const [a, r] = await Promise.all([
      base44.entities.Aircraft.list().catch(() => []),
      base44.entities.ChecklistRecord.list("-date", 50).catch(() => []),
    ]);
    setAircraft(a);
    setRecords(r);
    setAircraftId(a[0]?.id || "");
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const resetChecks = () => setChecked({});

  const changePhase = (id) => {
    setPhaseId(id);
    resetChecks();
  };

  const save = async () => {
    if (!aircraftId || !pilotName || !date) {
      alert("Preencha data, aeronave e piloto.");
      return;
    }
    const unchecked = allItems.filter((_, i) => !checked[i]);
    const hasDiscrepancy = discrepancies.trim().length > 0;
    const status = hasDiscrepancy ? "discrepancy" : unchecked.length === 0 ? "ok" : "discrepancy";
    const ac = aircraft.find((x) => x.id === aircraftId);
    setSaving(true);
    try {
      await base44.entities.ChecklistRecord.create({
        date,
        aircraft_id: aircraftId,
        aircraft_registration: ac?.registration || "",
        pilot_name: pilotName,
        checklist_type: phaseId,
        completed_items: JSON.stringify({ checked, total: totalItems, done: checkedCount }),
        discrepancies: discrepancies || null,
        status,
        signature: pilotName,
      });
      resetChecks();
      setDiscrepancies("");
      await load();
      setView("history");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-sky-600 font-semibold">Inspeção</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Checklists Interativos</h1>
          <p className="text-slate-500 mt-2 text-sm">5 fases de voo · Itens marcáveis · Histórico · Busca rápida</p>
        </div>
        <div className="inline-flex bg-slate-100 rounded-lg p-1 text-sm">
          <button onClick={() => setView("new")} className={`px-4 py-1.5 rounded-md font-medium transition-colors ${view === "new" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
            Novo checklist
          </button>
          <button onClick={() => setView("history")} className={`px-4 py-1.5 rounded-md font-medium transition-colors ${view === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
            Histórico
          </button>
        </div>
      </header>

      {view === "history" ? (
        <ChecklistHistory records={records} favorites={favorites} onToggleFav={(id) => setFavorites((prev) => { const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]; setFavorites(next); localStorage.setItem("checklist_favorites", JSON.stringify(next)); })} />
      ) : (
        <>
          {/* Phase selector */}
          <div className="flex flex-wrap gap-2">
            {CHECKLIST_PHASES.map((p) => (
              <button
                key={p.id}
                onClick={() => changePhase(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  phaseId === p.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Meta info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 grid sm:grid-cols-3 gap-4">
            <Field label="Data">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Aeronave">
              <select value={aircraftId} onChange={(e) => setAircraftId(e.target.value)} className={inputCls}>
                <option value="">Selecione…</option>
                {aircraft.map((a) => (
                  <option key={a.id} value={a.id}>{a.registration} — {a.model}</option>
                ))}
              </select>
            </Field>
            <Field label="Piloto">
              <input value={pilotName} onChange={(e) => setPilotName(e.target.value)} className={inputCls} placeholder="Nome do piloto" />
            </Field>
          </div>

          {/* Progress + Search */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-700">{phase.name} — Progresso</p>
              <p className="text-sm font-semibold text-slate-900">{checkedCount}/{totalItems} · {progress}%</p>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca rápida de procedimentos…"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              />
            </div>
          </div>

          {/* Checklist sections */}
          <div className="space-y-4">
            {filteredSections.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm px-6 py-12 text-center text-sm text-slate-400">
                Nenhum item encontrado para "{query}".
              </div>
            ) : (
              filteredSections.map((section, si) => {
                const sectionStart = phase.sections.slice(0, phase.sections.findIndex((s) => s.category === section.category)).reduce((acc, s) => acc + s.items.length, 0);
                return (
                  <div key={section.category} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100">
                      <h3 className="font-semibold text-slate-900 text-sm">{section.category}</h3>
                    </div>
                    <ul className="divide-y divide-slate-50">
                      {section.items.map((item, i) => {
                        const idx = sectionStart + i;
                        const isChecked = !!checked[idx];
                        return (
                          <li key={item}>
                            <button
                              onClick={() => setChecked((p) => ({ ...p, [idx]: !p[idx] }))}
                              className="w-full flex items-start gap-3 px-5 py-3 text-left hover:bg-slate-50/60 transition-colors"
                            >
                              {isChecked ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                              )}
                              <span className={`text-sm ${isChecked ? "text-slate-400 line-through" : "text-slate-700"}`}>{item}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })
            )}
          </div>

          {/* Discrepancies */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Discrepâncias encontradas
              </span>
              <textarea value={discrepancies} onChange={(e) => setDiscrepancies(e.target.value)} rows={3} className={inputCls} placeholder="Anote qualquer item reprovado ou observação de manutenção. Se vazio, a inspeção fica OK." />
            </label>
          </div>

          <div className="flex justify-end gap-3 pb-2">
            <button onClick={resetChecks} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Limpar</button>
            <button
              onClick={save}
              disabled={saving || checkedCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? "Salvando…" : "Salvar checklist"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ChecklistHistory({ records, favorites, onToggleFav }) {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm px-6 py-16 text-center">
        <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Nenhum checklist registrado ainda.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {records.map((r) => {
        const ok = r.status === "ok";
        const isFav = favorites.includes(r.id);
        return (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-900">{PHASE_LABELS[r.checklist_type] || r.checklist_type}</p>
                <span className="text-xs text-slate-400">·</span>
                <p className="text-sm text-slate-600">{r.aircraft_registration || "—"}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {r.date ? new Date(r.date).toLocaleDateString("pt-BR") : "—"} · {r.pilot_name || "—"}
              </p>
              {r.discrepancies && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">{r.discrepancies}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => onToggleFav(r.id)} className="p-1 text-slate-300 hover:text-amber-500">
                {isFav ? <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> : <Star className="w-4 h-4" />}
              </button>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${ok ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"}`}>
                {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {ok ? "OK" : "Discrepância"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1.5">{label}</span>
      {children}
    </label>
  );
}