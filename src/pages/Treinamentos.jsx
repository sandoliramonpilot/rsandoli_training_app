import React, { useState, useEffect } from "react";
import { ACADEMY_DISCIPLINES } from "@/lib/academyData";
import { GraduationCap, Crown, Award, BarChart3, Cog, Joystick, Monitor, Gauge } from "lucide-react";

const ICONS = { sistemas: Cog, helipilot: Joystick, idu680: Monitor, limitacoes: Gauge };

export default function Treinamentos() {
  const [activeDiscipline, setActiveDiscipline] = useState("sistemas");

  const discipline = ACADEMY_DISCIPLINES.find((d) => d.id === activeDiscipline) || ACADEMY_DISCIPLINES[0];

  const completedCount = 0;
  const overallProgress = 0;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">AW119Kx Academy</h1>
        <p className="text-slate-400 mt-2 text-sm">Instrução teórica e treinamento operacional — disciplinas, sistemas e capacitação contínua.</p>
      </header>

      {/* Featured banner */}
      <div className="bg-gradient-to-br from-[#1A1D25] to-[#12141A] rounded-2xl border border-amber-500/20 shadow-lg overflow-hidden">
        <div className="p-6 md:p-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5" /> Premium
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Leonardo AW119Kx Koala</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">AW119_Koala Academy</h2>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl">Plataforma de instrução teórica, treinamento operacional e capacitação contínua para pilotos de asas rotativas, com foco no AW119Kx e seus sistemas de aviônicos avançados.</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <GraduationCap className="w-10 h-10 text-slate-900" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label="Progresso médio" value={`${overallProgress}%`} accent="text-amber-400" />
        <StatCard icon={GraduationCap} label="Disciplinas" value={ACADEMY_DISCIPLINES.length} accent="text-teal-400" />
        <StatCard icon={Award} label="Áreas concluídas" value={completedCount} accent="text-emerald-400" />
        <StatCard icon={Cog} label="Sistemas cobertos" value="10+" accent="text-sky-400" />
      </div>

      {/* Discipline tabs */}
      <div className="flex flex-wrap gap-2">
        {ACADEMY_DISCIPLINES.map((d) => {
          const Icon = ICONS[d.id] || Cog;
          const active = d.id === activeDiscipline;
          return (
            <button
              key={d.id}
              onClick={() => setActiveDiscipline(d.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                active ? "bg-amber-500 text-slate-900 border-amber-500" : "bg-[#1A1D25] text-slate-300 border-slate-700/60 hover:border-amber-500/40"
              }`}
            >
              <Icon className="w-4 h-4" /> {d.title}
            </button>
          );
        })}
      </div>

      {/* Discipline content */}
      <div>
        <p className="text-slate-400 text-sm mb-4">{discipline.description}</p>
        <div className="space-y-3">
          {discipline.categories?.map((c) => (
            <CategoryCard key={c.title} title={c.title} items={c.topics} />
          ))}
          {discipline.sections?.map((s) => (
            <SectionCard key={s.title} title={s.title} items={s.items} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ title, items }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden hover:border-amber-500/30 transition-colors">
      <div className="px-5 py-3.5 bg-[#12141A] border-b border-slate-700/60 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-slate-100">{title}</h3>
      </div>
      <div className="px-5 py-4 flex flex-wrap gap-2">
        {items.map((t, i) => (
          <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/30 text-slate-300 border border-slate-700/40">{t}</span>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ title, items }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden hover:border-amber-500/30 transition-colors">
      <div className="px-5 py-3.5 bg-[#12141A] border-b border-slate-700/60">
        <h3 className="font-semibold text-sm text-slate-100">{title}</h3>
      </div>
      <div className="px-5 py-4">
        <ul className="space-y-2">
          {items.map((t, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" /> {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
      <Icon className="w-5 h-5 text-slate-400 mb-2" />
      <p className={`text-2xl font-bold tracking-tight ${accent}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}