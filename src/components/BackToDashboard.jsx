import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

export default function BackToDashboard() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-slate-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
    >
      <LayoutDashboard className="w-3.5 h-3.5" />
      Retornar ao painel
    </Link>
  );
}