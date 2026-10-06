import React from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

// WARNING: fundo vermelho escuro, borda vermelha
// CAUTION: fundo âmbar escuro, borda âmbar
// NOTE: fundo cinza/azul discreto
// Texto integral, sem simplificação. Sem explicações didáticas misturadas.

export function WarningBlock({ type, text }) {
  if (!text) return null;
  const config = {
    warning: {
      label: "WARNING / ADVERTÊNCIA",
      icon: AlertTriangle,
      bg: "bg-red-950/50",
      border: "border-red-600/60",
      iconColor: "text-red-400",
      labelColor: "text-red-300",
      textColor: "text-red-100",
    },
    caution: {
      label: "CAUTION / CAUTELA",
      icon: AlertCircle,
      bg: "bg-amber-950/50",
      border: "border-amber-600/60",
      iconColor: "text-amber-400",
      labelColor: "text-amber-300",
      textColor: "text-amber-100",
    },
    note: {
      label: "NOTE / NOTA",
      icon: Info,
      bg: "bg-slate-800/50",
      border: "border-slate-600/50",
      iconColor: "text-sky-400",
      labelColor: "text-sky-300",
      textColor: "text-slate-300",
    },
  };
  const c = config[type];
  const Icon = c.icon;
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${c.iconColor} shrink-0`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${c.labelColor}`}>{c.label}</span>
      </div>
      <p className={`text-sm leading-relaxed ${c.textColor} whitespace-pre-line`}>{text}</p>
    </div>
  );
}

export function WarningList({ items, type }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-2">
      {items.map((w, i) => (
        <WarningBlock key={i} type={type} text={w} />
      ))}
    </div>
  );
}