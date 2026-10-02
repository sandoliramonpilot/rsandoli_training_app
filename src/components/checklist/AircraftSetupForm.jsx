import React, { useState } from "react";
import { MISSION_TYPES } from "@/lib/checklistData";
import { Plane, ArrowRight } from "lucide-react";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50";

export default function AircraftSetupForm({ aircraft, initial, onSubmit }) {
  const [data, setData] = useState(initial || {
    date: new Date().toISOString().slice(0, 10),
    start_time: new Date().toTimeString().slice(0, 5),
    aircraft_id: aircraft[0]?.id || "",
    horimeter_initial: "",
    fuel_initial: "",
    pax_count: "",
    pic_name: "",
    pic_canac: "",
    sic_name: "",
    sic_canac: "",
    mission_type: "instrucao",
  });

  const set = (field) => (e) => setData((d) => ({ ...d, [field]: e.target.value }));

  const valid = data.date && data.start_time && data.aircraft_id && data.pic_name && data.pic_canac && data.mission_type;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    const ac = aircraft.find((a) => a.id === data.aircraft_id);
    onSubmit({ ...data, aircraft_registration: ac?.registration || "" });
  };

  return (
    <form onSubmit={submit} className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6 space-y-5 max-w-3xl">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-700/60">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <Plane className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-100">Dados da Aeronave e Missão</h2>
          <p className="text-xs text-slate-500">Preenchimento obrigatório antes de iniciar os checklists</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Data de início *"><input required type="date" value={data.date} onChange={set("date")} className={inputCls} /></Field>
        <Field label="Hora de início *"><input required type="time" value={data.start_time} onChange={set("start_time")} className={inputCls} /></Field>
        <Field label="Aeronave *">
          <select required value={data.aircraft_id} onChange={set("aircraft_id")} className={inputCls}>
            <option value="">Selecione…</option>
            {aircraft.map((a) => <option key={a.id} value={a.id}>{a.registration} — {a.model}</option>)}
          </select>
        </Field>
        <Field label="Natureza da missão *">
          <select required value={data.mission_type} onChange={set("mission_type")} className={inputCls}>
            {MISSION_TYPES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </Field>
        <Field label="Horímetro inicial"><input type="number" step="0.1" value={data.horimeter_initial} onChange={set("horimeter_initial")} className={inputCls} /></Field>
        <Field label="Combustível inicial (kg/L)"><input type="number" step="0.1" value={data.fuel_initial} onChange={set("fuel_initial")} className={inputCls} /></Field>
        <Field label="Quantidade de passageiros (PAX)"><input type="number" min="0" value={data.pax_count} onChange={set("pax_count")} className={inputCls} /></Field>
        <div />
        <Field label="Piloto em Comando *"><input required value={data.pic_name} onChange={set("pic_name")} className={inputCls} /></Field>
        <Field label="CANAC do Piloto em Comando *"><input required value={data.pic_canac} onChange={set("pic_canac")} className={inputCls} /></Field>
        <Field label="Copiloto"><input value={data.sic_name} onChange={set("sic_name")} className={inputCls} /></Field>
        <Field label="CANAC do Copiloto"><input value={data.sic_canac} onChange={set("sic_canac")} className={inputCls} /></Field>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={!valid} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-slate-900 hover:bg-amber-400 disabled:opacity-40 transition-colors">
          Iniciar checklists <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}