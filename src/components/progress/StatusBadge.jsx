import React from "react";
import { STATUS_META } from "@/lib/progressData";

export default function StatusBadge({ status, size = "sm", showLabel = true }) {
  const meta = STATUS_META[status] || STATUS_META.nao_iniciado;
  const sizeCls = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeCls} ${meta.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {showLabel && meta.label}
    </span>
  );
}