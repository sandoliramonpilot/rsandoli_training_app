import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/ProfileContext";
import { can } from "@/lib/accessControl";
import BackToDashboard from "@/components/BackToDashboard";
import { getWeightBalanceConfig } from "@/lib/weightBalance";
import { calculateWeightBalance } from "@/lib/weightBalance/calculator";
import {
  Loader2, Scale, Plane, AlertTriangle, CheckCircle2, RotateCcw, Download, Fuel,
} from "lucide-react";
import jsPDF from "jspdf";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500";

/* ---------------------- EXPORTAÇÃO PDF ---------------------- */
async function exportPdf({ config, result, aircraft, inputs }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 18;

  // Cabeçalho
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Peso e Balanceamento", 14, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`${config.label} · Datum: ${config.datum}`, 14, y);
  y += 5;
  doc.text(`Aeronave: ${aircraft?.registration || "—"} — ${aircraft?.model || "—"}`, 14, y);
  y += 5;
  doc.text(`Emitido em: ${new Date().toLocaleString("pt-BR")}`, 14, y);
  y += 8;

  doc.setDrawColor(200);
  doc.line(14, y, pageW - 14, y);
  y += 6;

  // Memória de cálculo (decolagem)
  doc.setTextColor(30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Memória de cálculo — decolagem", 14, y);
  y += 6;

  const colX = { item: 14, weight: 105, arm: 135, moment: 165 };
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Item", colX.item, y);
  doc.text("Peso (kg)", colX.weight, y, { align: "right" });
  doc.text("Braço (m)", colX.arm, y, { align: "right" });
  doc.text("Momento", colX.moment, y, { align: "right" });
  y += 4;
  doc.line(14, y, pageW - 14, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  for (const r of result.takeoff.rows) {
    if (y > 265) {
      doc.addPage();
      y = 18;
    }
    doc.text(String(r.label).slice(0, 48), colX.item, y);
    doc.text(r.weight.toFixed(1), colX.weight, y, { align: "right" });
    doc.text(r.arm.toFixed(3), colX.arm, y, { align: "right" });
    doc.text(r.moment.toFixed(1), colX.moment, y, { align: "right" });
    y += 5;
  }

  y += 1;
  doc.line(14, y, pageW - 14, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Total", colX.item, y);
  doc.text(result.takeoff.totalWeight.toFixed(1), colX.weight, y, { align: "right" });
  doc.text("—", colX.arm, y, { align: "right" });
  doc.text(result.takeoff.totalMoment.toFixed(1), colX.moment, y, { align: "right" });
  y += 10;

  // Resultado decolagem
  doc.setFontSize(10);
  doc.text("Resultado na decolagem", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const takeoffLines = [
    `Peso total: ${result.takeoff.totalWeight.toFixed(1)} kg (limite ${result.takeoff.maxAllowed} kg)`,
    `CG longitudinal: ${result.takeoff.cgLong.toFixed(3)} m (faixa ${result.takeoff.limits.forward.toFixed(2)} – ${result.takeoff.limits.rearward.toFixed(2)} m)`,
    `CG lateral: ${result.takeoff.cgLat.toFixed(3)} m (faixa ${config.cgLimits.lateral.left.toFixed(2)} – ${config.cgLimits.lateral.right.toFixed(2)} m)`,
    `Situação: ${result.takeoff.ok ? "DENTRO DOS LIMITES" : "FORA DOS LIMITES"}`,
  ];
  for (const l of takeoffLines) {
    doc.text(l, 14, y);
    y += 5;
  }

  // Estado no pouso
  if (result.fuelBurned > 0) {
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Estado no pouso", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const landingLines = [
      `Combustível consumido: ${result.fuelBurned.toFixed(1)} L`,
      `Combustível restante: ${result.fuelLanding.toFixed(1)} L`,
      `Peso no pouso: ${result.landing.totalWeight.toFixed(1)} kg`,
      `CG longitudinal no pouso: ${result.landing.cgLong.toFixed(3)} m`,
      `Deslocamento do CG: ${result.cgShift >= 0 ? "+" : ""}${result.cgShift.toFixed(3)} m`,
      `Situação no pouso: ${result.landing.ok ? "DENTRO DOS LIMITES" : "FORA DOS LIMITES"}`,
    ];
    for (const l of landingLines) {
      doc.text(l, 14, y);
      y += 5;
    }
  }

  // Não conformidades
  if (result.anyOutOfLimits) {
    y += 4;
    doc.setTextColor(180, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text("Não conformidades:", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");

    const addLine = (txt) => {
      if (y > 270) { doc.addPage(); y = 18; }
      doc.text(txt, 14, y);
      y += 4;
    };

    if (result.takeoff.overweight) addLine("- Decolagem: peso acima do máximo permitido");
    if (result.takeoff.cgOutForward) addLine("- Decolagem: CG à frente do limite dianteiro");
    if (result.takeoff.cgOutRearward) addLine("- Decolagem: CG atrás do limite traseiro");
    if (result.takeoff.cgOutLateral) addLine("- Decolagem: CG lateral fora do envelope");
    if (result.landing.overweight) addLine("- Pouso: peso acima do máximo permitido");
    if (result.landing.cgOutForward) addLine("- Pouso: CG à frente do limite dianteiro");
    if (result.landing.cgOutRearward) addLine("- Pouso: CG atrás do limite traseiro");
    if (result.landing.cgOutLateral) addLine("- Pouso: CG lateral fora do envelope");
  }

  // Rodapé
  doc.setTextColor(120);
  doc.setFontSize(7);
  doc.text(
    "Documento gerado pelo Rsandoli Training App. Uso operacional — confira sempre o RFM da aeronave.",
    14,
    pageH - 10
  );

  const filename = `peso-balanceamento-${aircraft?.registration || "aeronave"}-${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;
  doc.save(filename);
}

/* ---------------------- PÁGINA ---------------------- */
export default function WeightBalance() {
  const { user } = useAuth();
  const { profileFilter, profileValue } = useProfile();
  const [aircraft, setAircraft] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState({});

  const config = useMemo(() => getWeightBalanceConfig(profileValue), [profileValue]);
  const canEdit = can(user, "peso_balanceamento", "criar");

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

  const setField = (k, v) => setInputs((prev) => ({ ...prev, [k]: v }));

  const reset = () => {
    setInputs({
      emptyWeight: selectedAircraft?.empty_weight_kg ?? "",
      emptyCg: selectedAircraft?.empty_cg_m ?? "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-sky-600 font-semibold">Operações</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Peso e Balanceamento
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {config.label} · Datum: {config.datum}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BackToDashboard />
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="w-4 h-4" /> Limpar
          </button>
          <button
            onClick={() => exportPdf({ config, result, aircraft: selectedAircraft, inputs })}
            disabled={result.takeoff.totalWeight <= 0}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40"
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coluna esquerda: entradas */}
        <div className="lg:col-span-2 space-y-5">
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-semibold text-slate-900">Aeronave</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <label className="block">
                <span className="block text-xs font-medium text-slate-600 mb-1.5">Aeronave</span>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Selecione…</option>
                  {aircraft.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.registration} — {a.model}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-600 mb-1.5">
                  Peso vazio equipado (kg)
                </span>
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
                <span className="block text-xs font-medium text-slate-600 mb-1.5">CG vazio (m)</span>
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
              <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Esta aeronave não tem peso vazio e CG vazio cadastrados. Preencha no cadastro da
                aeronave para que os valores sejam carregados automaticamente.
              </p>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-semibold text-slate-900">Carregamento</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {config.stations.map((st) => (
                <label key={st.id} className="block">
                  <span className="block text-xs font-medium text-slate-600 mb-1.5">
                    {st.label}
                    {st.max ? <span className="text-slate-400"> · máx {st.max}</span> : null}
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
                    <span className="text-[10px] text-amber-600">Braço pendente no RFM</span>
                  )}
                </label>
              ))}
            </div>
          </section>

          {/* Consumo da missão — gera o cálculo de pouso */}
          <section className="bg-sky-50 rounded-2xl border border-sky-200 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-sky-700" />
              <h2 className="text-sm font-semibold text-sky-900">Consumo da missão</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-medium text-slate-600 mb-1.5">
                  Combustível consumido (L)
                </span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={inputs.fuel || undefined}
                  value={inputs.fuelBurned ?? ""}
                  onChange={(e) => setField("fuelBurned", e.target.value)}
                  className={inputCls}
                  placeholder="0"
                />
              </label>
              <div className="flex items-end">
                <p className="text-[11px] text-slate-600">
                  Combustível no pouso:{" "}
                  <strong className="text-slate-900">{result.fuelLanding.toFixed(1)} L</strong>
                </p>
              </div>
            </div>
            {Number(inputs.fuelBurned) > Number(inputs.fuel) && Number(inputs.fuel) > 0 && (
              <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1.5">
                O consumo não pode ser maior que o combustível inicial.
              </p>
            )}
          </section>
        </div>

        {/* Coluna direita: resultado */}
        <div className="space-y-5">
          <section
            className={`rounded-2xl border p-4 shadow-sm ${
              result.anyOutOfLimits
                ? "bg-rose-50 border-rose-200"
                : "bg-emerald-50 border-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {result.anyOutOfLimits ? (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              <h2
                className={`text-sm font-semibold ${
                  result.anyOutOfLimits ? "text-rose-800" : "text-emerald-800"
                }`}
              >
                {result.anyOutOfLimits
                  ? "Fora dos limites em algum momento"
                  : "Dentro dos limites na decolagem e no pouso"}
              </h2>
            </div>
          </section>

          <StateCard title="Decolagem" state={result.takeoff} config={config} tone="sky" />
          <StateCard title="Pouso" state={result.landing} config={config} tone="violet" />

          {result.fuelBurned > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Deslocamento de CG pela queima
              </p>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Combustível consumido</dt>
                  <dd className="text-slate-900">{result.fuelBurned.toFixed(1)} L</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Peso perdido</dt>
                  <dd className="text-slate-900">{result.weightLoss.toFixed(1)} kg</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">Deslocamento do CG</dt>
                  <dd
                    className={`font-semibold ${
                      Math.abs(result.cgShift) > 0.05 ? "text-amber-700" : "text-slate-900"
                    }`}
                  >
                    {result.cgShift >= 0 ? "+" : ""}
                    {result.cgShift.toFixed(3)} m
                  </dd>
                </div>
              </dl>
              {Math.abs(result.cgShift) > 0.05 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mt-2">
                  O CG se desloca mais de 5 cm durante a missão. Confirme o envelope no pouso.
                </p>
              )}
            </div>
          )}

          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Memória de cálculo — decolagem
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-2 font-medium">Item</th>
                    <th className="py-2 px-2 font-medium text-right">Peso</th>
                    <th className="py-2 px-2 font-medium text-right">Braço</th>
                    <th className="py-2 pl-2 font-medium text-right">Momento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.takeoff.rows.map((r) => (
                    <tr key={r.id}>
                      <td className="py-1.5 pr-2 text-slate-700">{r.label}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600">{r.weight.toFixed(1)}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600">{r.arm.toFixed(3)}</td>
                      <td className="py-1.5 pl-2 text-right text-slate-700">{r.moment.toFixed(1)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold text-slate-900 border-t-2 border-slate-300">
                    <td className="py-2 pr-2">Total</td>
                    <td className="py-2 px-2 text-right">{result.takeoff.totalWeight.toFixed(1)}</td>
                    <td className="py-2 px-2 text-right">—</td>
                    <td className="py-2 pl-2 text-right">{result.takeoff.totalMoment.toFixed(1)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              CG = Σ momentos ÷ Σ pesos = {result.takeoff.totalMoment.toFixed(1)} ÷{" "}
              {result.takeoff.totalWeight.toFixed(1)} ={" "}
              <strong>{result.takeoff.cgLong.toFixed(3)} m</strong>
            </p>
          </section>
        </div>
      </div>

      {/* Gráficos do envelope */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Envelopes de CG</h2>
        <CgEnvelopeChart config={config} result={result} />
      </section>
    </div>
  );
}

/* ---------------------- CARD DE ESTADO ---------------------- */
function StateCard({ title, state, config, tone }) {
  const toneCls =
    {
      sky: "border-sky-200 bg-sky-50/50",
      violet: "border-violet-200 bg-violet-50/50",
    }[tone] || "border-slate-200 bg-white";

  return (
    <div className={`rounded-2xl border p-4 ${toneCls}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span
          className={`text-[11px] font-semibold ${
            state.ok ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {state.ok ? "OK" : "FORA"}
        </span>
      </div>
      <dl className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <dt className="text-slate-600">Peso total</dt>
          <dd className={`font-semibold ${state.overweight ? "text-rose-700" : "text-slate-900"}`}>
            {state.totalWeight.toFixed(1)} kg
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Limite</dt>
          <dd className="text-slate-700">{state.maxAllowed} kg</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">CG longitudinal</dt>
          <dd
            className={`font-semibold ${
              state.cgOutForward || state.cgOutRearward ? "text-rose-700" : "text-slate-900"
            }`}
          >
            {state.cgLong.toFixed(3)} m
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Faixa</dt>
          <dd className="text-slate-700">
            {state.limits.forward.toFixed(2)} – {state.limits.rearward.toFixed(2)} m
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">CG lateral</dt>
          <dd className={`font-semibold ${state.cgOutLateral ? "text-rose-700" : "text-slate-900"}`}>
            {state.cgLat.toFixed(3)} m
          </dd>
        </div>
      </dl>
      {!state.ok && (
        <ul className="mt-2 pt-2 border-t border-rose-200 space-y-0.5 text-[11px] text-rose-700">
          {state.overweight && <li>Peso acima do máximo.</li>}
          {state.cgOutForward && <li>CG à frente do limite.</li>}
          {state.cgOutRearward && <li>CG atrás do limite.</li>}
          {state.cgOutLateral && <li>CG lateral fora do envelope.</li>}
        </ul>
      )}
    </div>
  );
}

/* ---------------------- GRÁFICOS DO ENVELOPE ---------------------- */
function CgEnvelopeChart({ config, result }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <EnvelopePlot
        title="CG longitudinal"
        unitLabel="CG longitudinal (m)"
        limits={config.cgLimits.longitudinal}
        lateralLimits={null}
        config={config}
        result={result}
        takeoffCg={result.takeoff.cgLong}
        landingCg={result.landing.cgLong}
        takeoffOut={result.takeoff.cgOutForward || result.takeoff.cgOutRearward}
        landingOut={result.landing.cgOutForward || result.landing.cgOutRearward}
      />
      <EnvelopePlot
        title="CG lateral"
        unitLabel="CG lateral (m)"
        limits={null}
        lateralLimits={config.cgLimits.lateral}
        config={config}
        result={result}
        takeoffCg={result.takeoff.cgLat}
        landingCg={result.landing.cgLat}
        takeoffOut={result.takeoff.cgOutLateral}
        landingOut={result.landing.cgOutLateral}
      />
    </div>
  );
}

function EnvelopePlot({
  title,
  unitLabel,
  limits,
  lateralLimits,
  config,
  result,
  takeoffCg,
  landingCg,
  takeoffOut,
  landingOut,
}) {
  const W = 560;
  const H = 320;
  const PAD = { top: 24, right: 24, bottom: 44, left: 56 };

  const minW = 1000;
  const maxW = config.maxExternalWeight;

  const minCg = lateralLimits ? lateralLimits.left - 0.05 : 3.0;
  const maxCg = lateralLimits ? lateralLimits.right + 0.05 : 3.7;

  const sx = (cg) => PAD.left + ((cg - minCg) / (maxCg - minCg)) * (W - PAD.left - PAD.right);
  const sy = (w) => H - PAD.bottom - ((w - minW) / (maxW - minW)) * (H - PAD.top - PAD.bottom);

  let path = "";
  if (limits) {
    const pts = [];
    let prevUpTo = minW;
    for (const l of limits) {
      pts.push({ w: prevUpTo, fwd: l.forward, rwd: l.rearward });
      pts.push({ w: l.upTo, fwd: l.forward, rwd: l.rearward });
      prevUpTo = l.upTo;
    }
    path = [
      ...pts.map((p) => `${sx(p.fwd)},${sy(p.w)}`),
      ...[...pts].reverse().map((p) => `${sx(p.rwd)},${sy(p.w)}`),
    ].join(" ");
  } else if (lateralLimits) {
    path = [
      `${sx(lateralLimits.left)},${sy(minW)}`,
      `${sx(lateralLimits.left)},${sy(maxW)}`,
      `${sx(lateralLimits.right)},${sy(maxW)}`,
      `${sx(lateralLimits.right)},${sy(minW)}`,
    ].join(" ");
  }

  const ticksX = lateralLimits
    ? [lateralLimits.left, 0, lateralLimits.right]
    : [3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7];

  const hasTakeoff = result.takeoff.totalWeight > 0;
  const hasLanding = result.fuelBurned > 0 && result.landing.totalWeight > 0;

  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-700 mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {[1000, 1400, 1800, 2200, 2600, 2800].map((w) => (
            <g key={`w${w}`}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={sy(w)}
                y2={sy(w)}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text x={PAD.left - 8} y={sy(w) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                {w}
              </text>
            </g>
          ))}

          {ticksX.map((cg) => (
            <g key={`cg${cg}`}>
              <line x1={sx(cg)} x2={sx(cg)} y1={PAD.top} y2={H - PAD.bottom} stroke="#f1f5f9" />
              <text
                x={sx(cg)}
                y={H - PAD.bottom + 16}
                textAnchor="middle"
                fontSize="10"
                fill="#94a3b8"
              >
                {cg.toFixed(2)}
              </text>
            </g>
          ))}

          <polygon points={path} fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />

          {hasTakeoff && (
            <g>
              {hasLanding && (
                <line
                  x1={sx(takeoffCg)}
                  y1={sy(result.takeoff.totalWeight)}
                  x2={sx(landingCg)}
                  y2={sy(result.landing.totalWeight)}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              )}

              <circle
                cx={sx(takeoffCg)}
                cy={sy(result.takeoff.totalWeight)}
                r="7"
                fill={takeoffOut ? "#ef4444" : "#0ea5e9"}
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={sx(takeoffCg) + 12}
                y={sy(result.takeoff.totalWeight) - 8}
                fontSize="10"
                fontWeight="600"
                fill={takeoffOut ? "#b91c1c" : "#0369a1"}
              >
                DEC {result.takeoff.totalWeight.toFixed(0)} kg
              </text>

              {hasLanding && (
                <>
                  <circle
                    cx={sx(landingCg)}
                    cy={sy(result.landing.totalWeight)}
                    r="7"
                    fill={landingOut ? "#ef4444" : "#8b5cf6"}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={sx(landingCg) + 12}
                    y={sy(result.landing.totalWeight) + 14}
                    fontSize="10"
                    fontWeight="600"
                    fill={landingOut ? "#b91c1c" : "#6d28d9"}
                  >
                    POUSO {result.landing.totalWeight.toFixed(0)} kg
                  </text>
                </>
              )}
            </g>
          )}

          <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#64748b">
            {unitLabel}
          </text>
          <text
            x={14}
            y={H / 2}
            textAnchor="middle"
            fontSize="11"
            fill="#64748b"
            transform={`rotate(-90 14 ${H / 2})`}
          >
            Peso (kg)
          </text>
        </svg>
      </div>
    </div>
  );
}
