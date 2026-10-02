import React, { useEffect, useState } from "react";
import { MISSION_TYPES } from "@/lib/checklistData";
import { Plane, ArrowRight, Check, X, AlertTriangle } from "lucide-react";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50";

// Novo fluxo de "Novo checklist": 1. selecionar aeronave ativa, 2. confirmar,
// 3. selecionar o checklist, 4. iniciar (com dados da missão).
export default function StartChecklistFlow({ aircraft, onCancel, onStart }) {
  const activeAircraft = aircraft.filter((a) => a.status === "available");
  const [step, setStep] = useState(1);
  const [selectedAircraftId, setSelectedAircraftId] = useState("");
  const [data, setData] = useState({
    date: new Date().toISOString().slice(0, 10),
    start_time: new Date().toTimeString().slice(0, 5),
    horimeter_initial: "",
    fuel_initial: "",
    pax_count: "",
    pic_name: "",
    pic_canac: "",
    sic_name: "",
    sic_canac: "",
    mission_type: "instrucao",
  });

  useEffect(() => {
    if (activeAircraft.length === 1 && !selectedAircraftId) {
      setSelectedAircraftId(activeAircraft[0].id);
    }
  }, [activeAircraft, selectedAircraftId]);

  const set = (field) => (e) => setData((d) => ({ ...d, [field]: e.target.value }));
  const selectedAc = activeAircraft.find((a) => a.id === selectedAircraftId);

  if (activeAircraft.length === 0) {
    return (
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-14 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-200">Nenhuma aeronave ativa cadastrada.</p>
        <p className="text-xs text-slate-500 mt-2">É necessário cadastrar uma aeronave ativa antes de iniciar um checklist.</p>
        <button onClick={onCancel} className="mt-5 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5">Voltar</button>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6 space-y-5 max-w-3xl">
      {/* Stepper */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-700/60 text-xs font-medium">
        {["Selecionar aeronave", "Confirmar", "Checklist", "Iniciar"].map((label, i) => {
          const n = i + 1;
          return (
            <div key={label} className="flex items-center gap-2 flex-wrap">
              <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${step === n ? "bg-amber-500 text-slate-900" : step > n ? "bg-emerald-500 text-slate-900" : "bg-slate-700 text-slate-400"}`}>
                {step > n ? <Check className="w-3 h-3" /> : n}
              </span>
              <span className={step === n ? "text-amber-300" : "text-slate-500"}>{label}</span>
              {n < 4 && <span className="text-slate-700 mx-1">—</span>}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-slate-100">Selecione a aeronave</h2>
            <p className="text-xs text-slate-500 mt-1">Somente aeronaves ativas e cadastradas são exibidas.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {activeAircraft.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAircraftId(a.id)}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-colors ${
                  selectedAircraftId === a.id ? "border-amber-500 bg-amber-500/10" : "border-slate-700/60 hover:border-slate-500"
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-100 text-sm">{a.registration}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.model}{a.total_mnt_hours ? ` · MNT ${(a.total_mnt_hours).toFixed(1)}h` : ""}</p>
                </div>
                {selectedAircraftId === a.id && <Check className="w-5 h-5 text-amber-400" />}
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <button
              disabled={!selectedAircraftId}
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-slate-900 hover:bg-amber-400 disabled:opacity-40 transition-colors"
            >
              Confirmar aeronave <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && selectedAc && (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-100">Confirme a aeronave selecionada</h2>
          <div className="flex items-center gap-4 p-4 rounded-xl border border-amber-500/40 bg-amber-500/5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Plane className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-100">{selectedAc.registration}</p>
              <p className="text-xs text-slate-500 mt-0.5">{selectedAc.model} · Status: Disponível</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setStep(1)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5">Voltar</button>
            <button onClick={() => setStep(3)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors">
              Confirmar e continuar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && selectedAc && (
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-100">Selecione o checklist</h2>
          <div className="grid sm:grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-4 rounded-xl border border-amber-500/40 bg-amber-500/10">
              <div>
                <p className="font-semibold text-slate-100 text-sm">Checklist operacional completo</p>
                <p className="text-xs text-slate-500 mt-0.5">Todas as fases de voo — {selectedAc.registration}</p>
              </div>
              <Check className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setStep(2)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5">Voltar</button>
            <button onClick={() => setStep(4)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors">
              Continuar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && selectedAc && (
        <div className="space-y-5">
          <div>
            <h2 className="font-semibold text-slate-100">Incluir dados do checklist</h2>
            <p className="text-xs text-slate-500 mt-1">Informações obrigatórias antes de iniciar.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Aeronave *">
              <input readOnly value={`${selectedAc.registration} — ${selectedAc.model}`} className={inputCls + " text-slate-400"} />
            </Field>
            <Field label="Data de início *"><input required type="date" value={data.date} onChange={set("date")} className={inputCls} /></Field>
            <Field label="Hora de início *"><input required type="time" value={data.start_time} onChange={set("start_time")} className={inputCls} /></Field>
            <Field label="Natureza da missão *">
              <select required value={data.mission_type} onChange={set("mission_type")} className={inputCls}>
                {MISSION_TYPES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Horímetro inicial"><input type="number" step="0.1" value={data.horimeter_initial} onChange={set("horimeter_initial")} className={inputCls} /></Field>
            <Field label="Combustível inicial (kg/L)"><input type="number" step="0.1" value={data.fuel_initial} onChange={set("fuel_initial")} className={inputCls} /></Field>
            <Field label="Quantidade de passageiros (PAX)"><input type="number" min="0" value={data.pax_count} onChange={set("pax_count")} className={inputCls} /></Field>
            <div className="hidden sm:block" />
            <Field label="Piloto em Comando *"><input required value={data.pic_name} onChange={set("pic_name")} className={inputCls} /></Field>
            <Field label="CANAC do Piloto em Comando *"><input required value={data.pic_canac} onChange={set("pic_canac")} className={inputCls} /></Field>
            <Field label="Copiloto"><input value={data.sic_name} onChange={set("sic_name")} className={inputCls} /></Field>
            <Field label="CANAC do Copiloto"><input value={data.sic_canac} onChange={set("sic_canac")} className={inputCls} /></Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setStep(3)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5">Voltar</button>
            <button
              disabled={!data.date || !data.start_time || !data.pic_name || !data.pic_canac}
              onClick={() => onStart({ ...data, aircraft_id: selectedAc.id, aircraft_registration: selectedAc.registration })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-slate-900 hover:bg-amber-400 disabled:opacity-40 transition-colors"
            >
              Iniciar novo checklist <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <button onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
        <X className="w-3.5 h-3.5" /> Cancelar
      </button>
    </div>
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