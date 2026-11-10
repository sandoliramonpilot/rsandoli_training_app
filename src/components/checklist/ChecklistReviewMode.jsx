import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, BadgeCheck, Clock, XCircle } from "lucide-react";
import ChecklistPhaseTabs from "@/components/checklist/ChecklistPhaseTabs";

const VALIDATION_META = {
  pending: { label: "Pendente", badge: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  approved: { label: "Aprovado", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  rejected: { label: "Reprovado", badge: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
};

export default function ChecklistReviewMode({
  phases,
  activePhase,
  onSelectPhase,
  isH125,
  validationMap,
  canValidate,
  onOpenValidation,
}) {
  const currentPhase = phases.find((p) => p.id === activePhase) || phases[0];
  const validation = validationMap?.[activePhase];
  const status = validation?.status || "pending";
  const meta = VALIDATION_META[status] || VALIDATION_META.pending;
  const Icon = status === "approved" ? BadgeCheck : status === "rejected" ? XCircle : Clock;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          to="/aprovacoes-checklist"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao painel
        </Link>
        <span className="inline-flex items-center gap-1.5 text-xs text-amber-300/80">
          <ShieldCheck className="w-3.5 h-3.5" /> Modo revisão
        </span>
      </div>

      <ChecklistPhaseTabs
        phases={phases}
        activeId={activePhase}
        progressByPhase={{}}
        onSelect={onSelectPhase}
      />

      {isH125 && (
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${meta.badge}`}>
            <Icon className="w-3 h-3" /> Validação técnica: {meta.label}
          </span>
          {validation?.reviewed_by && status !== "pending" && (
            <span className="text-slate-500">
              {validation.reviewed_by}
              {validation.reviewed_at
                ? ` · ${new Date(validation.reviewed_at).toLocaleDateString("pt-BR")}`
                : ""}
            </span>
          )}
          {canValidate && (
            <button
              onClick={onOpenValidation}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Validar
            </button>
          )}
        </div>
      )}

      <h2 className="text-lg font-semibold text-slate-100">{currentPhase.title}</h2>

      <div className="space-y-4">
        {currentPhase.sections.map((sec) => (
          <div
            key={sec.category}
            className="bg-[#1A1D25] rounded-xl border border-slate-700/60 overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-slate-700/60 bg-[#12141A]">
              <h3 className="text-sm font-semibold text-slate-300">{sec.category}</h3>
            </div>
            <ul className="px-4 py-3 space-y-2">
              {sec.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}