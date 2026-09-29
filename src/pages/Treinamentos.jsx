import React, { useState, useEffect } from "react";
import { AW119_KOALA, GENERAL_MODULES } from "@/lib/trainingData";
import { GraduationCap, Crown, ChevronDown, ChevronUp, Play, Award, BarChart3, BookOpen, CheckCircle2 } from "lucide-react";

export default function Treinamentos() {
  const [expanded, setExpanded] = useState(null);
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem("training_progress") || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem("training_progress", JSON.stringify(progress));
  }, [progress]);

  const setModuleProgress = (id, value) => {
    setProgress((prev) => ({ ...prev, [id]: value }));
  };

  const completedCount = Object.values(progress).filter((v) => v >= 100).length;
  const inProgressCount = Object.values(progress).filter((v) => v > 0 && v < 100).length;
  const totalModules = AW119_KOALA.modules.length + GENERAL_MODULES.length;
  const overallProgress = Math.round((Object.values(progress).reduce((s, v) => s + v, 0) / (totalModules * 100)) * 100) || 0;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold">Capacitação</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Centro de Treinamento</h1>
        <p className="text-slate-500 mt-2 text-sm">Trilhas de aprendizagem, CBT, QRH eletrônico e preparação para avaliações técnicas.</p>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label="Progresso geral" value={`${overallProgress}%`} accent="from-indigo-500 to-blue-600" />
        <StatCard icon={CheckCircle2} label="Módulos concluídos" value={`${completedCount}/${totalModules}`} accent="from-emerald-500 to-teal-600" />
        <StatCard icon={Play} label="Em andamento" value={inProgressCount} accent="from-amber-500 to-orange-600" />
        <StatCard icon={Award} label="Certificações" value={completedCount} accent="from-violet-500 to-purple-600" />
      </div>

      {/* AW119 Koala — Featured */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg overflow-hidden text-white">
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Crown className="w-3.5 h-3.5" /> Premium
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Leonardo AW119Kx</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">AW119_Koala Academy</h2>
              <p className="text-slate-400 mt-2 text-sm max-w-2xl">{AW119_KOALA.description}</p>
            </div>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur px-6 md:px-8 py-4 border-t border-white/10">
          <p className="text-xs text-slate-400">{AW119_KOALA.modules.length} módulos · Certificação digital · Simulados · Banco de questões</p>
        </div>
      </div>

      {/* AW119 modules */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Módulos AW119_Koala</h3>
        {AW119_KOALA.modules.map((m) => (
          <ModuleCard
            key={m.id}
            module={m}
            isExpanded={expanded === m.id}
            onToggle={() => setExpanded(expanded === m.id ? null : m.id)}
            progress={progress[m.id] || 0}
            onProgress={(v) => setModuleProgress(m.id, v)}
          />
        ))}
      </div>

      {/* General modules */}
      <div className="space-y-3 pt-4">
        <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Treinamentos Gerais</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {GENERAL_MODULES.map((m) => (
            <GeneralModuleCard
              key={m.id}
              module={m}
              progress={progress[m.id] || 0}
              onProgress={(v) => setModuleProgress(m.id, v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ module, isExpanded, onToggle, progress, onProgress }) {
  const hasChapters = !!module.chapters;
  const hasSections = !!module.sections;
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/60 transition-colors">
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-900 text-sm">{module.title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{module.objective}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block w-24">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500">{progress}%</span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {isExpanded && (
        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-100">
          {module.topics && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tópicos</p>
              <div className="flex flex-wrap gap-2">
                {module.topics.map((t, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">{t}</span>)}
              </div>
            </div>
          )}
          {module.chapters && (
            <div className="space-y-2">
              {module.chapters.map((ch, i) => (
                <div key={i} className="rounded-lg border border-slate-100 p-3">
                  <p className="text-sm font-medium text-slate-800">{ch.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ch.topics.map((t, j) => <span key={j} className="text-[11px] px-2 py-0.5 rounded bg-slate-50 text-slate-500">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
          {module.sections && (
            <div className="space-y-2">
              {module.sections.map((s, i) => (
                <div key={i} className="rounded-lg border border-slate-100 p-3">
                  <p className="text-sm font-medium text-slate-800">{s.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {s.topics.map((t, j) => <span key={j} className="text-[11px] px-2 py-0.5 rounded bg-slate-50 text-slate-500">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
          {module.details && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Detalhes</p>
              <ul className="space-y-1">{module.details.map((d, i) => <li key={i} className="text-sm text-slate-600 flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0" />{d}</li>)}</ul>
            </div>
          )}
          {module.resources && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Recursos</p>
              <div className="flex flex-wrap gap-2">
                {module.resources.map((r, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600">{r}</span>)}
              </div>
            </div>
          )}
          {module.categories && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Categorias</p>
              <div className="flex flex-wrap gap-2">
                {module.categories.map((c, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600">{c}</span>)}
              </div>
            </div>
          )}
          {module.features && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Recursos</p>
              <div className="flex flex-wrap gap-2">
                {module.features.map((f, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600">{f}</span>)}
              </div>
            </div>
          )}
          {module.levels && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Níveis</p>
                <div className="flex flex-wrap gap-2">{module.levels.map((l, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600">{l}</span>)}</div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Quantidades</p>
                <div className="flex flex-wrap gap-2">{module.quantities.map((q, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">{q}</span>)}</div>
              </div>
            </div>
          )}
          {module.requirements && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Requisitos</p>
              <ul className="space-y-1">{module.requirements.map((r, i) => <li key={i} className="text-sm text-slate-600 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{r}</li>)}</ul>
            </div>
          )}
          {/* Progress controls */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Seu progresso</span>
              <span className="text-xs font-semibold text-slate-900">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={progress}
              onChange={(e) => onProgress(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function GeneralModuleCard({ module, progress, onProgress }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-900 text-sm leading-snug">{module.title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{module.lessons} aulas</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-4">{module.description}</p>
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-slate-500">Progresso</span>
          <span className="text-[11px] font-semibold text-slate-900">{progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="10"
        value={progress}
        onChange={(e) => onProgress(Number(e.target.value))}
        className="w-full accent-indigo-600"
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center mb-3 shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}