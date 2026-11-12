import React, { useState, useMemo } from "react";
import { AlertTriangle, X, CheckCircle2, ClipboardList } from "lucide-react";

// Finalização com justificativa por item não executado e resumo prévio.
// pendingItems: [{ phaseId, phaseTitle, localIdx, text }]
export default function FinalizeModal({ aircraftReg, user, pendingItems, onClose, onConfirm }) {
  const [justifications, setJustifications] = useState({}); // { [phaseId]: { [localIdx]: text } }
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const pendingCount = pendingItems.length;
  const executedCount = useMemo(() => {
    // Total de itens nas fases - pendentes
    // (não temos o total aqui, mas o resumo mostra pendentes e justificados)
    return null;
  }, [pendingItems]);

  const justified = pendingItems.filter((it) => (justifications[it.phaseId]?.[it.localIdx] || "").trim()).length;
  const pendingNoJustification = pendingItems.filter((it) => !(justifications[it.phaseId]?.[it.localIdx] || "").trim());

  const setJust = (item, value) => {
    setJustifications((prev) => ({
      ...prev,
      [item.phaseId]: { ...(prev[item.phaseId] || {}), [item.localIdx]: value },
    }));
  };

  const canConfirm = pendingCount === 0 || pendingNoJustification.length === 0;

  const confirm = () => {
    if (!canConfirm) {
      const faltantes = pendingNoJustification.length;
      setError(`Ainda ${faltantes === 1 ? "falta 1 item" : `faltam ${faltantes} itens`} sem justificativa. Informe a justificativa antes de finalizar.`);
      return;
    }
    if (!confirmed) {
      setError("");
      setConfirmed(true);
      return;
    }
    setError("");
    onConfirm(justifications);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR");
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#1A1D25] w-full max-w-2xl rounded-2xl border border-slate-700/60 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-slate-100 text-lg">Finalizar checklist</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Resumo prévio */}
          <div className="rounded-xl border border-slate-700/60 bg-black/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-100">Resumo antes da finalização</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div>Aeronave: <strong className="text-slate-100">{aircraftReg || "—"}</strong></div>
              <div>Responsável: <strong className="text-slate-100">{user || "—"}</strong></div>
              <div>Data: {dateStr}</div>
              <div>Hora: {timeStr}</div>
            </div>
            <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
              <SummaryStat label="Itens não executados e justificados" value={justified} tone="text-amber-300" />
              <SummaryStat label="Itens pendentes sem justificativa" value={pendingNoJustification.length} tone="text-rose-400" />
              <SummaryStat label="Itens pendentes (total)" value={pendingCount} tone="text-slate-200" />
            </div>
          </div>

          {pendingCount === 0 ? (
            <div className="flex items-start gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Todos os itens foram executados. Checklist pronto para finalização.</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Existem {pendingCount} item(ns) não executado(s). Cada item exige uma justificativa própria antes de finalizar.</span>
              </div>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {pendingItems.map((item, i) => (
                  <div key={`${item.phaseId}-${item.localIdx}`} className="rounded-lg border border-slate-700/60 bg-[#12141A] p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-mono text-slate-500 mt-1">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-[11px] uppercase tracking-wider text-amber-400/80">{item.phaseTitle}</p>
                        <p className="text-sm text-slate-300 mt-0.5">{item.text}</p>
                        <textarea
                          value={justifications[item.phaseId]?.[item.localIdx] || ""}
                          onChange={(e) => setJust(item, e.target.value)}
                          rows={2}
                          placeholder="Justificativa do item não executado…"
                          className="mt-2 w-full px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {pendingNoJustification.length > 0 && (
                <div className="text-xs text-rose-400">{pendingNoJustification.length} item(ns) ainda sem justificativa.</div>
              )}
            </div>
          )}

          {confirmed && (
            <div className="flex items-start gap-2 text-sm text-sky-300 bg-sky-500/10 border border-sky-500/30 rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Confirme a finalização. Após a confirmação o checklist será bloqueado para edições acidentais.</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5">Cancelar</button>
            <button
              onClick={confirm}
              disabled={!canConfirm}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
            >
              {confirmed ? "Confirmar finalização" : pendingCount === 0 ? "Continuar" : "Validar justificativas"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, tone }) {
  return (
    <div className="rounded-lg bg-black/30 border border-slate-700/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${tone}`}>{value}</p>
    </div>
  );
}