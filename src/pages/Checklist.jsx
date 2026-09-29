import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { PRE_FLIGHT_CHECKLIST, POST_FLIGHT_CHECKLIST } from "@/lib/checklistData";
import { CheckCircle2, Circle, Save, ClipboardCheck, AlertTriangle } from "lucide-react";

export default function Checklist() {
  const [aircraft, setAircraft] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("new"); // "new" | "history"
  const [checklistType, setChecklistType] = useState("pre_flight");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [aircraftId, setAircraftId] = useState("");
  const [pilotName, setPilotName] = useState("");
  const [checked, setChecked] = useState({});
  const [discrepancies, setDiscrepancies] = useState("");
  const [saving, setSaving] = useState(false);

  const list = checklistType === "pre_flight" ? PRE_FLIGHT_CHECKLIST : POST_FLIGHT_CHECKLIST;
  const allItems = useMemo(() => list.flatMap((c) => c.items), [list]);
  const totalItems = allItems.length;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = totalItems ? Math.round((checkedCount / totalItems) * 100) : 0;

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

  const toggleType = (t) => {
    setChecklistType(t);
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
        checklist_type: checklistType,
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Checklist de Voo</h1>
          <p className="text-slate-500 mt-2 text-sm">Inspeção pré-voo e pós-voo padronizada para helicópteros.</p>
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
        <ChecklistHistory records={records} />
      ) : (
        <>
          {/* Meta info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 grid sm:grid-cols-4 gap-4">
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
            <Field label="Tipo">
              <select value={checklistType} onChange={(e) => toggleType(e.target.value)} className={inputCls}>
                <option value="pre_flight">Pré-voo</option>
                <option value="post_flight">Pós-voo</option>
              </select>
            </Field>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-700">Progresso da inspeção</p>
              <p className="text-sm font-semibold text-slate-900">{checkedCount}/{totalItems} · {progress}%</p>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Checklist sections */}
          <div className="space-y-4">
            {list.map((section, si) => {
              const sectionStart = list.slice(0, si).reduce((acc, s) => acc + s.items.length, 0);
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
            })}
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

function ChecklistHistory({ records }) {
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
        return (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-900">{r.aircraft_registration || "—"}</p>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">{r.checklist_type === "pre_flight" ? "Pré-voo" : "Pós-voo"}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {r.date ? new Date(r.date).toLocaleDateString("pt-BR") : "—"} · {r.pilot_name || "—"}
              </p>
              {r.discrepancies && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">{r.discrepancies}</p>
              )}
            </div>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border shrink-0 ${ok ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"}`}>
              {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {ok ? "OK" : "Discrepância"}
            </span>
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