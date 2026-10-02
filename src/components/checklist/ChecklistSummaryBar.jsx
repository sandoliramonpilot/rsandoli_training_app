import React from "react";
import { Search, Save, FlagTriangleRight } from "lucide-react";

export default function ChecklistSummaryBar({ title, done, total, query, onQuery, onSaveDraft, onFinalize, isLastPhase }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="text-sm font-semibold text-slate-100">{done}/{total} · {pct}%</p>
      </div>
      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Pesquisa rápida de procedimentos…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-700/60 bg-[#12141A] text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        />
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        <button onClick={onSaveDraft} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">
          <Save className="w-4 h-4" /> Pausar e salvar
        </button>
        {isLastPhase && (
          <button onClick={onFinalize} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
            <FlagTriangleRight className="w-4 h-4" /> Finalizar checklist
          </button>
        )}
      </div>
    </div>
  );
}