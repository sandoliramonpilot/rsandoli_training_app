// src/components/weightBalance/WeightBalancePanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/ProfileContext";
import { getWeightBalanceConfig } from "@/lib/weightBalance";
import { calculateWeightBalance, findCriticalPoint, VIOLATION_LABELS } from "@/lib/weightBalance/calculator";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500";

export default function WeightBalancePanel({ onValidityChange }) {
  const { profileFilter, profileValue } = useProfile();
  const [aircraft, setAircraft] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState({});

  const config = useMemo(() => getWeightBalanceConfig(profileValue), [profileValue]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await base44.entities.Aircraft.filter(profileFilter).catch(() => []);
      setAircraft(list || []);
      if (list?.length) setSelectedId(list[0].id);
      setLoading(false);
    })();
  }, [profileFilter]);

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

  // Informa o checklist se está tudo dentro dos limites
  useEffect(() => {
    onValidityChange?.({
      ok: result.anyOutOfLimits === false && result.takeoff.totalWeight > 0,
      result,
      critical,
    });
  }, [result, critical, onValidityChange]);

  const setField = (k, v) => setInputs((prev) => ({ ...prev, [k]: v }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Aeronave e peso vazio */}
      <div className="grid sm:grid-cols-3 gap-4">
        <label className="block">
          <span className="block text-xs font-medium text-slate-600 mb-1.5">Aeronave</span>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className={inputCls}>
            <option value="">Selecione…</option>
            {aircraft.map((a) => (
              <option key={a.id} value={a.id}>{a.registration} — {a.model}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-slate-600 mb-1.5">Peso vazio (kg)</span>
          <input type="number" step="0.1" min="0" value={inputs.emptyWeight ?? ""}
            onChange={(e) => setField("emptyWeight", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-slate-600 mb-1.5">CG vazio (m)</span>
          <input type="number" step="0.001" min="0" value={inputs.emptyCg ?? ""}
            onChange={(e) => setField("emptyCg", e.target.value)} className={inputCls} />
        </label>
      </div>

      {/* Estações */}
      <div className="grid sm:grid-cols-2 gap-4">
        {config.stations.map((st) => (
          <label key={st.id} className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">
              {st.label}{st.max ? <span className="text-slate-400"> · máx {st.max}</span> : null}
            </span>
            <input type="number" step="0.1" min="0" max={st.max || undefined}
              value={inputs[st.id] ?? ""} onChange={(e) => setField(st.id, e.target.value)}
              className={inputCls} placeholder="0" disabled={st.arm == null && !st.isFuel} />
          </label>
        ))}
      </div>

      {/* Consumo */}
      <div className="p-4 rounded-lg bg-sky-50 border border-sky-200">
        <label className="block">
          <span className="block text-xs font-medium text-slate-600 mb-1.5">Combustível consumido (L)</span>
          <input type="number" step="0.1" min="0" value={inputs.fuelBurned ?? ""}
            onChange={(e) => setField("fuelBurned", e.target.value)} className={inputCls} placeholder="0" />
        </label>
      </div>

      {/* Resultado resumido */}
      <div className={`rounded-xl border p-4 ${result.anyOutOfLimits ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"}`}>
        <div className="flex items-center gap-2 mb-2">
          {result.anyOutOfLimits ? (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <p className={`text-sm font-semibold ${result.anyOutOfLimits ? "text-rose-800" : "text-emerald-800"}`}>
            {result.anyOutOfLimits ? "Fora dos limites" : "Dentro dos limites"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-600">Peso decolagem: </span>
            <strong>{result.takeoff.totalWeight.toFixed(1)} kg</strong>
          </div>
          <div>
            <span className="text-slate-600">CG decolagem: </span>
            <strong>{result.takeoff.cgLong.toFixed(3)} m</strong>
          </div>
          {result.fuelBurned > 0 && (
            <>
              <div>
                <span className="text-slate-600">Peso pouso: </span>
                <strong>{result.landing.totalWeight.toFixed(1)} kg</strong>
              </div>
              <div>
                <span className="text-slate-600">CG pouso: </span>
                <strong>{result.landing.cgLong.toFixed(3)} m</strong>
              </div>
            </>
          )}
        </div>
        {critical && (
          <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mt-2">
            Ponto crítico: {VIOLATION_LABELS[critical.violation]} após {critical.burnedLiters.toFixed(1)} L consumidos
          </p>
        )}
      </div>
    </div>
  );
}
