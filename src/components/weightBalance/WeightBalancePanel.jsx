// src/components/weightBalance/WeightBalancePanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/ProfileContext";
import { getWeightBalanceConfig } from "@/lib/weightBalance";
import { calculateWeightBalance, findCriticalPoint, VIOLATION_LABELS } from "@/lib/weightBalance/calculator";
import { Loader2, AlertTriangle, CheckCircle2, Scale } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40";

export default function WeightBalancePanel({ aircraftId, onValidityChange }) {
  const { profileFilter, profileValue } = useProfile();
  const [aircraft, setAircraft] = useState([]);
  const [selectedId, setSelectedId] = useState(aircraftId || "");
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState({});

  const config = useMemo(() => getWeightBalanceConfig(profileValue), [profileValue]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await base44.entities.Aircraft.filter(profileFilter).catch(() => []);
      setAircraft(list || []);
      if (!selectedId && list?.length) setSelectedId(list[0].id);
      setLoading(false);
    })();
  }, [profileFilter]);

  useEffect(() => {
    if (aircraftId) setSelectedId(aircraftId);
  }, [aircraftId]);

  const selectedAircraft = aircraft.find((a) => a.id === selectedId) || null;

  useEffect(() => {
    if (!selectedAircraft) return;
    setInputs((prev) => ({
      ...prev,
      emptyWeight: selectedAircraft.empty_weight_kg ?? "",
      emptyCg: selectedAircraft.empty_cg_m ?? "",
    }));
  }, [selectedAircraft]);

  const result = useMemo(() => calculateWeightBalance(config, inputs), [config, inputs]);
  const critical = useMemo(() => findCriticalPoint(config, inputs), [config, inputs]);

  useEffect(() => {
    onValidityChange?.({
      ok: result.anyOutOfLimits === false && result.takeoff.totalWeight > 0,
      hasData: result.takeoff.totalWeight > 0,
      result,
      critical,
    });
  }, [result, critical, onValidityChange]);

  const setField = (k, v) => setInputs((prev) => ({ ...prev, [k]: v }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Aeronave e peso vazio */}
      <div className="rounded-xl border border-slate-700/60 bg-[#1A1D25] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-100">Dados da aeronave</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-slate-400 mb-1.5">Aeronave</span>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className={inputCls}>
              <option value="">Selecione…</option>
              {aircraft.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.registration} — {a.model}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-400 mb-1.5">Peso vazio (kg)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={inputs.emptyWeight ?? ""}
              onChange={(e) => setField("emptyWeight", e.target.value)}
              className={inputCls}
              placeholder="Do cadastro"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-400 mb-1.5">CG vazio (m)</span>
            <input
              type="number"
              step="0.001"
              min="0"
              value={inputs.emptyCg ?? ""}
              onChange={(e) => setField("emptyCg", e.target.value)}
              className={inputCls}
              placeholder="Do cadastro"
            />
          </label>
        </div>
        {!selectedAircraft?.empty_weight_kg && selectedId && (
          <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
            Esta aeronave não tem peso vazio e CG vazio cadastrados. Preencha no cadastro da aeronave.
          </p>
        )}
      </div>

      {/* Estações */}
      <div className="rounded-xl border border-slate-700/60 bg-[#1A1D25] p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-100">Carregamento</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {config.stations.map((st) => (
            <label key={st.id} className="block">
              <span className="block text-xs font-medium text-slate-400 mb-1.5">
                {st.label}
                {st.max ? <span className="text-slate-600"> · máx {st.max}</span> : null}
              </span>
              <input
                type="number"
                step="0.1"
                min="0"
                max={st.max || undefined}
                value={inputs[st.id] ?? ""}
                onChange={(e) => setField(st.id, e.target.value)}
                className={inputCls}
                placeholder="0"
                disabled={st.arm == null && !st.isFuel}
              />
              {st.arm == null && !st.isFuel && (
                <span className="text-[10px] text-amber-400">Braço pendente no RFM</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Consumo */}
      <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
        <label className="block">
          <span className="block text-xs font-medium text-slate-400 mb-1.5">Combustível consumido (L)</span>
          <input
            type="number"
            step="0.1"
            min="0"
            value={inputs.fuelBurned ?? ""}
            onChange={(e) => setField("fuelBurned", e.target.value)}
            className={inputCls}
            placeholder="0"
          />
        </label>
        <p className="text-[11px] text-slate-400 mt-2">
          Combustível no pouso: <strong className="text-slate-200">{result.fuelLanding.toFixed(1)} L</strong>
        </p>
      </div>

      {/* Resultado */}
      <div
        className={`rounded-xl border p-4 ${
          result.anyOutOfLimits
            ? "bg-rose-500/10 border-rose-500/30"
            : "bg-emerald-500/10 border-emerald-500/30"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          {result.anyOutOfLimits ? (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <p className={`text-sm font-semibold ${result.anyOutOfLimits ? "text-rose-300" : "text-emerald-300"}`}>
            {result.anyOutOfLimits ? "Fora dos limites" : "Dentro dos limites"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div>
            <span className="text-slate-500">Peso decolagem: </span>
            <strong className="text-slate-100">{result.takeoff.totalWeight.toFixed(1)} kg</strong>
          </div>
          <div>
            <span className="text-slate-500">CG decolagem: </span>
            <strong className="text-slate-100">{result.takeoff.cgLong.toFixed(3)} m</strong>
          </div>
          {result.fuelBurned > 0 && (
            <>
              <div>
                <span className="text-slate-500">Peso pouso: </span>
                <strong className="text-slate-100">{result.landing.totalWeight.toFixed(1)} kg</strong>
              </div>
              <div>
                <span className="text-slate-500">CG pouso: </span>
                <strong className="text-slate-100">{result.landing.cgLong.toFixed(3)} m</strong>
              </div>
            </>
          )}
        </div>
        {critical && (
          <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-1.5 mt-3">
            Ponto crítico: {VIOLATION_LABELS[critical.violation]} após {critical.burnedLiters.toFixed(1)} L consumidos
          </p>
        )}
      </div>
    </div>
  );
}
