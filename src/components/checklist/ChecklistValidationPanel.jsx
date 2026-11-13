import React, { useMemo, useState } from "react";
import { X, ShieldCheck, Check, XCircle, RotateCcw, Loader2, BadgeCheck, Clock, AlertTriangle } from "lucide-react";
import { useChecklistValidation } from "@/lib/useChecklistValidation";

const STATUS_META = {
  pending: { label: "Pendente", badge: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  approved: { label: "Aprovado", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  rejected: { label: "Reprovado", badge: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
};

// Painel de validacao do checklist operacional H125: o Administrador Geral
// revisa e aprova / reprova / reabre cada fase por variante.
export default function ChecklistValidationPanel({ variantKey, variantLabel, phases, onClose }) {
  const { validationMap, saving, setStatus, approveAll } = useChecklistValidation(variantKey);
  const [justifying, setJustifying] = useState(null);
  const [toast, setToast] = useState(null);

  const pendingCount = phases.filter((p) => (validationMap[p.id]?.status || "pending") === "pending").length;

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const handleDecision = async (phase, status, justification) => {
    const res = await setStatus(phase, status, justification);
    if (res.ok) flash(res.message || "Atualizado.");
    else flash(res.error || "Falha.");
    setJustifying(null);
  };

  const handleApproveAll = async () => {
    const res = await approveAll();
    if (res.ok) flash(`${res.count} fase(s) aprovada(s).`);
    else flash(res.error || "Falha.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 px-6 py-4 border-b border-slate-700/60 bg-[#1A1D25]/95 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-amber-500/30 bg-amber-500/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-white">Validação do Checklist · {variantLabel}</h2>
              <p className="text-xs text-slate-400">Revisão técnica por etapa · {variantKey}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-200 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        {/* Aviso */}
        <div className="px-6 py-3 border-b border-slate-700/60 bg-amber-500/5 flex items-start gap-2 text-xs text-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>Esta validação atesta a conferência do conteúdo transcrito contra o RFM/POH vigente. A validação é por etapa completa.</p>
        </div>

        {/* Barra de ações */}
        <div className="px-6 py-3 border-b border-slate-700/60 flex items-center gap-3">
          <span className="text-xs text-slate-400 inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {pendingCount} pendente(s)</span>
          <button
            onClick={handleApproveAll}
            disabled={saving || pendingCount === 0}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Aprovar pendentes
          </button>
        </div>

        {/* Lista de fases */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {phases.map((phase) => {
            const st = validationMap[phase.id]?.status || "pending";
            const meta = STATUS_META[st];
            const isJustifying = justifying?.phase?.id === phase.id;
            return (
              <div key={phase.id} className="rounded-lg border border-slate-700/60 bg-[#12141A] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-100">{phase.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{phase.sections.length} seção(ões)</p>
                    {validationMap[phase.id]?.reviewed_by && st !== "pending" && (
                      <p className="text-[10px] text-slate-600 mt-1">
                        {validationMap[phase.id].reviewed_by}
                        {validationMap[phase.id].reviewed_at ? ` · ${new Date(validationMap[phase.id].reviewed_at).toLocaleDateString("pt-BR")}` : ""}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${meta.badge}`}>
                    {meta.label}
                  </span>
                </div>

                {isJustifying ? (
                  <div className="mt-2.5 space-y-2">
                    <textarea
                      autoFocus
                      value={justifying.text}
                      onChange={(e) => setJustifying((j) => ({ ...j, text: e.target.value }))}
                      placeholder="Justificativa da decisão…"
                      rows={2}
                      className="w-full px-2.5 py-1.5 rounded-md bg-[#0D141C] border border-slate-700/60 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecision(phase, justifying.status, justifying.text.trim())}
                        disabled={saving || !justifying.text.trim()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500 text-slate-900 disabled:opacity-40"
                      >
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Confirmar
                      </button>
                      <button onClick={() => setJustifying(null)} className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => handleDecision(phase, "approved", "")}
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors"
                    >
                      <BadgeCheck className="w-3 h-3" /> Aprovar
                    </button>
                    <button
                      onClick={() => setJustifying({ phase, status: "rejected", text: "" })}
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/20 hover:bg-rose-500/25 disabled:opacity-40 transition-colors"
                    >
                      <XCircle className="w-3 h-3" /> Reprovar
                    </button>
                    {st !== "pending" && (
                      <button
                        onClick={() => setJustifying({ phase, status: "pending", text: "" })}
                        disabled={saving}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" /> Reabrir
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {toast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 shadow-xl">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
