import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { can } from "@/lib/accessControl";
import {
  PERIOD_LABELS, STATUS_LABELS, STATUS_STYLES, checkShiftOverlap,
} from "@/lib/scheduleUtils";
import {
  X, Loader2, AlertTriangle, CalendarDays, Plane, Users, Clock,
} from "lucide-react";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50";

export default function ShiftForm({ shift, pilots, aircraft, schedules, defaultDate, onClose, onSaved }) {
  const { user } = useAuth();
  const isEdit = !!shift;
  const canEdit = can(user, "escalas", "editar");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    date: shift?.date || defaultDate || new Date().toISOString().slice(0, 10),
    start_time: shift?.start_time || "08:00",
    end_time: shift?.end_time || "18:00",
    period: shift?.period || "integral",
    aircraft_id: shift?.aircraft_id || "",
    crew_pilot_id: shift?.crew_pilot_id || "",
    crew_copilot_id: shift?.crew_copilot_id || "",
    base: shift?.base || "",
    mission: shift?.mission || "",
    status: shift?.status || "planejada",
    observations: shift?.observations || "",
  });

  // Snapshot fields for display
  const [pilotName, setPilotName] = useState(shift?.crew_pilot_name || "");
  const [copilotName, setCopilotName] = useState(shift?.crew_copilot_name || "");
  const [aircraftReg, setAircraftReg] = useState(shift?.aircraft_registration || "");

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  // Detect overlap for the current form state
  const overlapConflicts = checkShiftOverlap(
    { ...f, id: shift?.id, crew_pilot_name: pilotName, crew_copilot_name: copilotName },
    schedules
  );

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!f.date || !f.mission) {
      setError("Data e missão são obrigatórias.");
      return;
    }
    if (f.start_time && f.end_time && f.start_time >= f.end_time) {
      setError("A hora de término deve ser posterior à hora de início.");
      return;
    }
    setSaving(true);
    try {
      const pilot = pilots.find((p) => p.id === f.crew_pilot_id);
      const copilot = pilots.find((p) => p.id === f.crew_copilot_id);
      const ac = aircraft.find((a) => a.id === f.aircraft_id);
      const payload = {
        date: f.date,
        start_time: f.start_time || undefined,
        end_time: f.end_time || undefined,
        period: f.period,
        aircraft_id: f.aircraft_id || undefined,
        aircraft_registration: ac?.registration || "",
        crew_pilot_id: f.crew_pilot_id || undefined,
        crew_pilot_name: pilot?.full_name || "",
        crew_copilot_id: f.crew_copilot_id || undefined,
        crew_copilot_name: copilot?.full_name || "",
        base: f.base || undefined,
        mission: f.mission,
        status: f.status,
        observations: f.observations || undefined,
        created_by_name: user?.full_name || user?.email || "",
      };
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
      if (isEdit) {
        await base44.entities.Schedule.update(shift.id, payload);
      } else {
        await base44.entities.Schedule.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Erro ao salvar escala.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[94vh] flex flex-col">
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-100">{isEdit ? "Editar Escala" : "Nova Escala"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {overlapConflicts.length > 0 && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4" /> Sobreposição detectada
              </p>
              <ul className="space-y-1 text-xs">
                {overlapConflicts.map((c, i) => (
                  <li key={i}>
                    <strong>{c.person}</strong> já está escalado como {c.roleExisting.toLowerCase()} em
                    "{c.existingShift.mission}" ({c.existingShift.start_time}–{c.existingShift.end_time}).
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="Data" required>
                <input type="date" className={inputCls} value={f.date} onChange={(e) => set("date", e.target.value)} disabled={!canEdit && isEdit} />
              </Field>
              <Field label="Hora de início"><input type="time" className={inputCls} value={f.start_time} onChange={(e) => set("start_time", e.target.value)} /></Field>
              <Field label="Hora de término"><input type="time" className={inputCls} value={f.end_time} onChange={(e) => set("end_time", e.target.value)} /></Field>
              <Field label="Período">
                <select className={inputCls} value={f.period} onChange={(e) => set("period", e.target.value)}>
                  {Object.entries(PERIOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="Aeronave">
                <select className={inputCls} value={f.aircraft_id} onChange={(e) => set("aircraft_id", e.target.value)}>
                  <option value="">—</option>
                  {aircraft.map((a) => <option key={a.id} value={a.id}>{a.registration} · {a.model}</option>)}
                </select>
              </Field>
              <Field label="Base"><input className={inputCls} value={f.base} onChange={(e) => set("base", e.target.value)} /></Field>
              <Field label="Piloto (PIC)">
                <select className={inputCls} value={f.crew_pilot_id} onChange={(e) => { set("crew_pilot_id", e.target.value); const p = pilots.find((x) => x.id === e.target.value); setPilotName(p?.full_name || ""); }}>
                  <option value="">—</option>
                  {pilots.filter((p) => p.status !== "inactive").map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </Field>
              <Field label="Copiloto (SIC)">
                <select className={inputCls} value={f.crew_copilot_id} onChange={(e) => { set("crew_copilot_id", e.target.value); const p = pilots.find((x) => x.id === e.target.value); setCopilotName(p?.full_name || ""); }}>
                  <option value="">—</option>
                  {pilots.filter((p) => p.status !== "inactive").map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </Field>
              <Field label="Situação">
                <select className={inputCls} value={f.status} onChange={(e) => set("status", e.target.value)}>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="Missão / atividade" required className="sm:col-span-2 lg:col-span-3">
                <input className={inputCls} value={f.mission} onChange={(e) => set("mission", e.target.value)} placeholder="Ex: Transporte, Treinamento, SAR…" />
              </Field>
              <Field label="Observações" className="sm:col-span-2 lg:col-span-3">
                <textarea className={`${inputCls} min-h-[60px]`} value={f.observations} onChange={(e) => set("observations", e.target.value)} />
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700/40">Cancelar</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-50">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando…</> : "Salvar escala"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium text-slate-400 mb-1">{label}{required && <span className="text-amber-400"> *</span>}</span>
      {children}
    </label>
  );
}