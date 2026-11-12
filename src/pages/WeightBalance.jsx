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
