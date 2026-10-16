import React from "react";
import { Hourglass, X, AlertTriangle } from "lucide-react";

// Retorna { id, label, pill, dot, icon } tratando undefined/null/"" como legado (aprovado)
export function getApprovalInfo(status) {
  switch (status) {
    case "pending_review":
      return {
        id: "pending_review",
        label: "Aguardando aprovação",
        pill: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        dot: "bg-amber-400",
        icon: Hourglass,
      };
    case "rejected":
      return {
        id: "rejected",
        label: "Rejeitado",
        pill: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        dot: "bg-rose-400",
        icon: X,
      };
    case "approved_with_notes":
      return {
        id: "approved_with_notes",
        label: "Aprovado com ressalvas",
        pill: "bg-sky-500/15 text-sky-300 border-sky-500/30",
        dot: "bg-sky-400",
        icon: AlertTriangle,
      };
    default:
      return null; // approved ou legado — sem selo
  }
}

export default function AcademyApprovalBadge({ status, size = "sm" }) {
  const info = getApprovalInfo(status);
  if (!info) return null;
  const Icon = info.icon;
  const sizeCls = size === "xs" ? "text-[10px] px-2 py-0.5" : "text-[11px] px-2.5 py-1";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${info.pill} ${sizeCls}`}>
      <Icon className={size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3"} />
      {info.label}
    </span>
  );
}