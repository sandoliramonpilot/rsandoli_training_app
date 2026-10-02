import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

export default function ChecklistSectionList({ sections, checked, onToggle, finalized }) {
  if (sections.length === 0) {
    return (
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-12 text-center text-sm text-slate-500">
        Nenhum item encontrado.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.category} className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
          <div className="px-5 py-3.5 bg-black/20 border-b border-slate-700/60">
            <h3 className="font-semibold text-slate-100 text-sm">{section.category}</h3>
          </div>
          <ul className="divide-y divide-slate-800/60">
            {section.items.map((item) => {
              const isChecked = !!checked[item.idx];
              return (
                <li key={item.idx}>
                  <button
                    onClick={() => onToggle(item.idx)}
                    className="w-full flex items-start gap-3 px-5 py-3 text-left hover:bg-white/[0.03] transition-colors"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className={`w-5 h-5 shrink-0 mt-0.5 ${finalized ? "text-rose-500" : "text-slate-600"}`} />
                    )}
                    <span className={`text-sm ${isChecked ? "text-slate-500 line-through" : "text-slate-300"}`}>{item.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}