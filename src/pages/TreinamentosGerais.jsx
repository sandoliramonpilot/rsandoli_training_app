import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { can } from "@/lib/accessControl";
import { TREINAMENTOS_GERAIS, PENDING_CONTENT, DIDATIC_NOTICE } from "@/lib/aw119TrainingData";
import BackToDashboard from "@/components/BackToDashboard";
import {
  Fuel, Droplets, Zap, Radio, LayoutDashboard, Cog, Settings, Wind, Joystick,
  ChevronDown, ChevronRight, AlertTriangle, BookOpen, GraduationCap,
} from "lucide-react";

const MODULE_ICONS = {
  Fuel, Droplets, Zap, Radio, LayoutDashboard, Cog, Settings, Wind, Joystick,
};

export default function TreinamentosGerais() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(new Set([TREINAMENTOS_GERAIS.modules[0].id]));
  const canEdit = can(user, "treinamentos", "editar");

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">TREINAMENTOS GERAIS</h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">{TREINAMENTOS_GERAIS.subtitle}</p>
        </div>
        <BackToDashboard />
      </header>

      <div className="px-4 py-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 text-xs flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{DIDATIC_NOTICE}</span>
      </div>

      <div className="grid gap-3">
        {TREINAMENTOS_GERAIS.modules.map((m) => {
          const Icon = MODULE_ICONS[m.icon] || BookOpen;
          const isOpen = expanded.has(m.id);
          return (
            <div key={m.id} className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
              <button
                onClick={() => toggle(m.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-amber-400" style={{ width: 18, height: 18 }} />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-100">{m.title}</h3>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 space-y-3">
                  {m.note && (
                    <div className="px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-300/80 text-xs">
                      {m.note}
                    </div>
                  )}
                  <ul className="space-y-2">
                    {m.items.map((t, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 mt-1 shrink-0" /> {t}
                      </li>
                    ))}
                  </ul>
                  <div className="px-3 py-2 rounded-lg bg-slate-700/20 border border-slate-700/30 text-slate-500 text-xs italic">
                    {PENDING_CONTENT}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}