// src/pages/WeightBalance.jsx
import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/ProfileContext";
import { can } from "@/lib/accessControl";
import BackToDashboard from "@/components/BackToDashboard";
import { getWeightBalanceConfig } from "@/lib/weightBalance";
import { calculateWeightBalance } from "@/lib/weightBalance/calculator";
import { Loader2, Scale, Plane, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import jsPDF from "jspdf";

async function exportPdf({ config, result, aircraft, inputs }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
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
  doc.text(
    `Aeronave: ${aircraft?.registration || "—"} — ${aircraft?.model || "—"}`,
    14,
    y
  );
  y += 5;
  doc.text(
    `Emitido em: ${new Date().toLocaleString("pt-BR")}`,
    14,
    y
  );
  y += 8;

  // Linha separadora
  doc.setDrawColor(200);
  doc.line(14, y, pageW - 14, y);
  y += 6;

  // Tabela de carregamento
  doc.setTextColor(30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Memória de cálculo", 14, y);
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
  for (const r of result.rows) {
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
  doc.text(result.totalWeight.toFixed(1), colX.weight, y, { align: "right" });
  doc.text("—", colX.arm, y, { align: "right" });
  doc.text(result.totalMoment.toFixed(1), colX.moment, y, { align: "right" });
  y += 10;

  // Resultado
  doc.setFontSize(10);
  doc.text("Resultado", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const lines = [
    `Peso total: ${result.totalWeight.toFixed(1)} kg (limite ${result.maxAllowed} kg)`,
    `CG longitudinal: ${result.cgLong.toFixed(3)} m (faixa ${result.limits.forward.toFixed(2)} – ${result.limits.rearward.toFixed(2)} m)`,
    `CG lateral: ${result.cgLat.toFixed(3)} m (faixa ${config.cgLimits.lateral.left.toFixed(2)} – ${config.cgLimits.lateral.right.toFixed(2)} m)`,
    `Situação: ${result.ok ? "DENTRO DOS LIMITES" : "FORA DOS LIMITES"}`,
  ];
  for (const l of lines) {
    doc.text(l, 14, y);
    y += 5;
  }

  // Alertas
  if (!result.ok) {
    y += 3;
    doc.setTextColor(180, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text("Não conformidades:", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    if (result.overweight) { doc.text("- Peso acima do máximo permitido", 14, y); y += 4; }
    if (result.cgOutForward) { doc.text("- CG à frente do limite dianteiro", 14, y); y += 4; }
    if (result.cgOutRearward) { doc.text("- CG atrás do limite traseiro", 14, y); y += 4; }
    if (result.cgOutLateral) { doc.text("- CG lateral fora do envelope", 14, y); y += 4; }
  }

  // Rodapé
  const pageH = doc.internal.pageSize.getHeight();
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

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500";

export default function WeightBalance() {
  const { user } = useAuth();
  const { profileFilter, profileValue } = useProfile();
  const [aircraft, setAircraft] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState({});

  const config = useMemo(
    () => getWeightBalanceConfig(profileValue),
    [profileValue]
  );

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

  // Carrega peso vazio e CG vazio do cadastro da aeronave
  useEffect(() => {
    if (!selectedAircraft) return;
    setInputs((prev) => ({
      ...prev,
      emptyWeight: selectedAircraft.empty_weight_kg ?? "",
      emptyCg: selectedAircraft.empty_cg_m ?? "",
    }));
  }, [selectedAircraft]);

  const result = useMemo(
    () => calculateWeightBalance(config, inputs),
    [config, inputs]
  );

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
                <span className="block text-xs font-medium text-slate-600 mb-1.5">
                  CG vazio (m)
                </span>
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
                    <span className="text-[10px] text-amber-600">
                      Braço pendente no RFM
                    </span>
                  )}
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Coluna direita: resultado */}
        <div className="space-y-5">
          <section
            className={`rounded-2xl border p-5 shadow-sm ${
              result.ok
                ? "bg-emerald-50 border-emerald-200"
                : "bg-rose-50 border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {result.ok ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              )}
              <h2
                className={`text-sm font-semibold ${
                  result.ok ? "text-emerald-800" : "text-rose-800"
                }`}
              >
                {result.ok ? "Dentro dos limites" : "Fora dos limites"}
              </h2>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Peso total</dt>
                <dd className={`font-semibold ${result.overweight ? "text-rose-700" : "text-slate-900"}`}>
                  {result.totalWeight.toFixed(1)} kg
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Limite</dt>
                <dd className="text-slate-700">{result.maxAllowed} kg</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">CG longitudinal</dt>
                <dd className={`font-semibold ${result.cgOutForward || result.cgOutRearward ? "text-rose-700" : "text-slate-900"}`}>
                  {result.cgLong.toFixed(3)} m
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Faixa permitida</dt>
                <dd className="text-slate-700">
                  {result.limits.forward.toFixed(2)} – {result.limits.rearward.toFixed(2)} m
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">CG lateral</dt>
                <dd className={`font-semibold ${result.cgOutLateral ? "text-rose-700" : "text-slate-900"}`}>
                  {result.cgLat.toFixed(3)} m
                </dd>
              </div>
            </dl>

            {!result.ok && (
              <ul className="mt-3 pt-3 border-t border-rose-200 space-y-1 text-xs text-rose-700">
                {result.overweight && <li>Peso acima do máximo permitido.</li>}
                {result.cgOutForward && <li>CG à frente do limite dianteiro.</li>}
                {result.cgOutRearward && <li>CG atrás do limite traseiro.</li>}
                {result.cgOutLateral && <li>CG lateral fora do envelope.</li>}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Memória de cálculo</h2>
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
                  {result.rows.map((r) => (
                    <tr key={r.id}>
                      <td className="py-1.5 pr-2 text-slate-700">{r.label}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600">{r.weight.toFixed(1)}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600">{r.arm.toFixed(3)}</td>
                      <td className="py-1.5 pl-2 text-right text-slate-700">{r.moment.toFixed(1)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold text-slate-900 border-t-2 border-slate-300">
                    <td className="py-2 pr-2">Total</td>
                    <td className="py-2 px-2 text-right">{result.totalWeight.toFixed(1)}</td>
                    <td className="py-2 px-2 text-right">—</td>
                    <td className="py-2 pl-2 text-right">{result.totalMoment.toFixed(1)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              CG = Σ momentos ÷ Σ pesos = {result.totalMoment.toFixed(1)} ÷{" "}
              {result.totalWeight.toFixed(1)} = <strong>{result.cgLong.toFixed(3)} m</strong>
            </p>
          </section>
        </div>
      </div>

      {/* Gráfico do envelope */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Envelope de CG longitudinal</h2>
        <CgEnvelopeChart config={config} result={result} />
      </section>
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
        cgValue={result.cgLong}
        outOfLimits={result.cgOutForward || result.cgOutRearward}
      />
      <EnvelopePlot
        title="CG lateral"
        unitLabel="CG lateral (m)"
        limits={null}
        lateralLimits={config.cgLimits.lateral}
        config={config}
        result={result}
        cgValue={result.cgLat}
        outOfLimits={result.cgOutLateral}
      />
    </div>
  );
}

function EnvelopePlot({ title, unitLabel, limits, lateralLimits, config, result, cgValue, outOfLimits }) {
  const W = 560;
  const H = 320;
  const PAD = { top: 24, right: 24, bottom: 44, left: 56 };

  const minW = 1000;
  const maxW = config.maxExternalWeight;

  // Faixa do eixo X conforme o tipo de envelope
  const minCg = lateralLimits ? lateralLimits.left - 0.05 : 3.0;
  const maxCg = lateralLimits ? lateralLimits.right + 0.05 : 3.7;

  const sx = (cg) => PAD.left + ((cg - minCg) / (maxCg - minCg)) * (W - PAD.left - PAD.right);
  const sy = (w) => H - PAD.bottom - ((w - minW) / (maxW - minW)) * (H - PAD.top - PAD.bottom);

  // Monta o polígono do envelope
  let path = "";
  if (limits) {
    // Longitudinal: varia com o peso
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
    // Lateral: faixa constante em toda a faixa de peso
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

  const pointIn = result.totalWeight > 0;

  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-700 mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* Grade horizontal (peso) */}
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

          {/* Grade vertical (CG) */}
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

          {/* Envelope */}
          <polygon points={path} fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />

          {/* Ponto calculado */}
          {pointIn && (
            <g>
              <circle
                cx={sx(cgValue)}
                cy={sy(result.totalWeight)}
                r="7"
                fill={outOfLimits ? "#ef4444" : "#10b981"}
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={sx(cgValue) + 12}
                y={sy(result.totalWeight) - 8}
                fontSize="11"
                fontWeight="600"
                fill={outOfLimits ? "#b91c1c" : "#047857"}
              >
                {result.totalWeight.toFixed(0)} kg · {cgValue.toFixed(3)} m
              </text>
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
