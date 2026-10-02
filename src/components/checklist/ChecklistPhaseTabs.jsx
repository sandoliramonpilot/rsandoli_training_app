import React from "react";
import { CHECKLIST_PHASES } from "@/lib/checklistData";
import { CheckCircle2 } from "lucide-react";

export default function ChecklistPhaseTabs({ activeId, progressByPhase, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHECKLIST_PHASES.map((p) => {
        const prog = progressByPhase[p.id];
        const done = prog && prog.done === prog.total && prog.total > 0;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              activeId === p.id ? "bg-amber-500 text-slate-900 border-amber-500" : "bg-[#1A1D25] text-slate-300 border-slate-700/60 hover:border-amber-500/40"
            }`}
          >
            {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            {p.name}
            {prog && prog.total > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeId === p.id ? "bg-slate-900/20" : "bg-slate-700/40"}`}>
                {prog.done}/{prog.total}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}