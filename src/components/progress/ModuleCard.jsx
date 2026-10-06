import React, { useState } from "react";
import { ChevronDown, ChevronRight, Play, CheckCircle2, RotateCcw, Lock, Cog, Joystick, Monitor, Gauge, Siren } from "lucide-react";
import { computeModuleProgress, STATUS_META } from "@/lib/progressData";
import StatusBadge from "./StatusBadge";

const ICONS = { Cog, Joystick, Monitor, Gauge, Siren };

export default function ModuleCard({ module, recordsByContentId, onLessonAction }) {
  const [expanded, setExpanded] = useState(false);
  const prog = computeModuleProgress(module, recordsByContentId);
  const Icon = ICONS[module.icon] || Cog;
  const accent = module.accent || "text-amber-400";
  const barColor =
    prog.status === "concluido" ? "bg-emerald-500"
    : prog.pct >= 50 ? "bg-amber-500"
    : prog.pct > 0 ? "bg-sky-500"
    : "bg-slate-600";

  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
      {/* Header clicável */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className={`w-10 h-10 rounded-xl bg-slate-700/40 border border-slate-700/60 flex items-center justify-center shrink-0 ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm text-slate-100">{module.title}</h3>
            <StatusBadge status={prog.status} size="xs" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {prog.completed}/{prog.total} aulas concluídas · {prog.inProgress} em andamento
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block w-28 h-2 rounded-full bg-slate-700/40 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${prog.pct}%` }} />
          </div>
          <span className={`text-sm font-bold ${prog.pct >= 80 ? "text-emerald-400" : prog.pct >= 50 ? "text-amber-400" : prog.pct > 0 ? "text-sky-400" : "text-slate-500"}`}>
            {prog.pct}%
          </span>
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {/* Barra de progresso mobile */}
      <div className="sm:hidden px-5 pb-3">
        <div className="h-2 rounded-full bg-slate-700/40 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${prog.pct}%` }} />
        </div>
      </div>

      {/* Conteúdo expandido: tópicos → aulas */}
      {expanded && (
        <div className="border-t border-slate-700/40 bg-[#12141A]/50">
          {module.topics.map((topic) => {
            const topicLessons = topic.lessons;
            const topicDone = topicLessons.filter((l) => recordsByContentId[l.id]?.status === "concluido").length;
            const topicPct = topicLessons.length ? Math.round((topicDone / topicLessons.length) * 100) : 0;
            return (
              <div key={topic.id} className="border-b border-slate-700/30 last:border-0">
                {/* Tópico header */}
                <div className="flex items-center justify-between px-5 py-2.5 bg-[#1A1D25]/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{topic.title}</p>
                  <span className="text-xs text-slate-500">{topicDone}/{topicLessons.length}</span>
                </div>
                {/* Aulas */}
                <ul className="divide-y divide-slate-700/20">
                  {topicLessons.map((lesson) => {
                    const rec = recordsByContentId[lesson.id];
                    const st = rec?.status || "nao_iniciado";
                    const meta = STATUS_META[st];
                    const isBlocked = st === "bloqueado";
                    return (
                      <li key={lesson.id} className="flex items-center gap-3 px-5 py-2.5 group">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 truncate">{lesson.title}</p>
                          {rec?.last_accessed_at && (
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Acessado em {new Date(rec.last_accessed_at).toLocaleDateString("pt-BR")}
                              {rec.time_spent_seconds > 0 && ` · ${Math.round(rec.time_spent_seconds / 60)}min`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {st === "concluido" ? (
                            <>
                              <span className="text-xs text-emerald-400 hidden sm:inline">Concluído</span>
                              <button
                                onClick={() => onLessonAction(lesson, "revisao_recomendada", module, topic)}
                                title="Marcar para revisão"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : isBlocked ? (
                            <Lock className="w-3.5 h-3.5 text-slate-600" />
                          ) : (
                            <>
                              <button
                                onClick={() => onLessonAction(lesson, "em_andamento", module, topic)}
                                title="Iniciar / Acessar"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-500/10"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onLessonAction(lesson, "concluido", module, topic)}
                                title="Marcar como concluído"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}