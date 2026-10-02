import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function FinalizeModal({ pendingCount, onClose, onConfirm }) {
  const [justification, setJustification] = useState("");
  const needsJustification = pendingCount > 0;

  const confirm = () => {
    if (needsJustification && !justification.trim()) return;
    onConfirm(justification);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1A1D25] w-full max-w-md rounded-2xl border border-slate-700/60 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-100 text-lg">Finalizar checklist</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>
        {needsJustification ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{pendingCount} item(ns) não executado(s). É obrigatório justificar antes de finalizar.</span>
            </div>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
              placeholder="Descreva o motivo dos itens pendentes…"
              className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        ) : (
          <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2.5">
            Todos os itens foram concluídos. Checklist pronto para finalização.
          </p>
        )}
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5">Cancelar</button>
          <button
            onClick={confirm}
            disabled={needsJustification && !justification.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
          >
            Confirmar finalização
          </button>
        </div>
      </div>
    </div>
  );
}