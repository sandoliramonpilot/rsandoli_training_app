import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getAccessLevel } from "@/lib/accessControl";
import { safeParse, collectExpiries, expiryStatus } from "@/lib/pilotUtils";
import {
  CONTENT_TREE, TOTAL_LESSONS, STATUS_META, STATUS_ORDER,
  computeModuleProgress, fmtStudyTime,
} from "@/lib/progressData";
import ModuleCard from "@/components/progress/ModuleCard";
import BackToDashboard from "@/components/BackToDashboard";
import { useProfile } from "@/lib/ProfileContext";
import {
  TrendingUp, Clock, BookOpen, Award, PlayCircle, Target, HelpCircle,
  BarChart3, AlertTriangle, FileWarning, RefreshCw, ClipboardList,
  Loader2, ChevronRight, Crown, GraduationCap, UserCircle, Users, CheckCircle2,
} from "lucide-react";

export default function PainelProgresso() {
  const { user } = useAuth();
  const { profileFilter, profileValue } = useProfile();
  const [pilots, setPilots] = useState(null);
  const [records, setRecords] = useState(null);
  const [completions, setCompletions] = useState(null);
  const [selectedPilotId, setSelectedPilotId] = useState(null);
  const [simHistory, setSimHistory] = useState([]);

  const actorLevel = getAccessLevel(user);
  const canViewOthers = actorLevel === "admin_geral" || actorLevel === "administrador";

  useEffect(() => {
    // Histórico de simulados do navegador
    try {
      setSimHistory(JSON.parse(localStorage.getItem("sim_history") || "[]"));
    } catch { setSimHistory([]); }
  }, []);

  // Carrega pilotos (todos para admin; próprio para usuário comum)
  useEffect(() => {
    base44.entities.Pilot.filter(profileFilter).then((all) => {
      setPilots(all);
      // Auto-seleciona o piloto do próprio usuário
      const myPilot = all.find((p) => p.user_id === user?.id || (p.email && user?.email && p.email.toLowerCase() === user.email.toLowerCase()));
      setSelectedPilotId(myPilot?.id || (canViewOthers ? null : (all[0]?.id || null)));
    }).catch(() => setPilots([]));
  }, [user?.id, user?.email, canViewOthers]);

  const selectedPilot = useMemo(() => (pilots || []).find((p) => p.id === selectedPilotId) || null, [pilots, selectedPilotId]);

  // Carrega registros de progresso e conclusões do piloto selecionado
  useEffect(() => {
    if (!selectedPilot) { setRecords(null); setCompletions(null); return; }
    const targetUserId = selectedPilot.user_id || user?.id;
    Promise.all([
      base44.entities.ProgressRecord.filter({ ...profileFilter, user_id: targetUserId }).catch(() => []),
      base44.entities.TrainingCompletion.filter({ ...profileFilter, pilot_id: selectedPilot.id }).catch(() => []),
    ]).then(([recs, comps]) => {
      setRecords(recs);
      setCompletions(comps);
    });
  }, [selectedPilot, user?.id]);

  // Índice de registros por content_id
  const recordsByContentId = useMemo(() => {
    const idx = {};
    (records || []).forEach((r) => { idx[r.content_id] = r; });
    return idx;
  }, [records]);

  // ----- MÉTRICAS GLOBAIS -----
  const metrics = useMemo(() => {
    const recs = records || [];
    const completedLessons = recs.filter((r) => r.status === "concluido").length;
    const inProgressLessons = recs.filter((r) => r.status === "em_andamento").length;
    const reviewLessons = recs.filter((r) => r.status === "revisao_recomendada").length;
    const pendingLessons = TOTAL_LESSONS - completedLessons - inProgressLessons - reviewLessons;
    const totalTime = recs.reduce((s, r) => s + (r.time_spent_seconds || 0), 0);
    const overallPct = TOTAL_LESSONS ? Math.round((completedLessons / TOTAL_LESSONS) * 100) : 0;

    // Último conteúdo acessado (não concluído)
    const accessed = recs
      .filter((r) => r.last_accessed_at && r.status !== "concluido")
      .sort((a, b) => new Date(b.last_accessed_at) - new Date(a.last_accessed_at));
    const lastAccessed = accessed[0] || null;

    // Tempo por período (semana, mês)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);
    const timeThisWeek = recs
      .filter((r) => r.last_accessed_at && new Date(r.last_accessed_at) >= weekAgo)
      .reduce((s, r) => s + (r.time_spent_seconds || 0), 0);
    const timeThisMonth = recs
      .filter((r) => r.last_accessed_at && new Date(r.last_accessed_at) >= monthAgo)
      .reduce((s, r) => s + (r.time_spent_seconds || 0), 0);

    // Média geral (conclusões de treinamento com score)
    const scored = (completions || []).filter((c) => c.score != null && c.status === "completed");
    const avgScore = scored.length ? Math.round(scored.reduce((s, c) => s + c.score, 0) / scored.length) : 0;

    // Simulados
    const examsTaken = simHistory.length;
    const examAvg = simHistory.length ? Math.round(simHistory.reduce((s, r) => s + r.pct, 0) / simHistory.length) : 0;
    const questionsAnswered = simHistory.reduce((s, r) => s + (r.total || 0), 0);
    const correctAnswers = simHistory.reduce((s, r) => s + (r.correct || 0), 0);
    const hitRate = questionsAnswered ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

    // Conteúdos com maior índice de erro (score < 70)
    const errorContent = (completions || [])
      .filter((c) => c.score != null && c.score < 70)
      .sort((a, b) => (a.score || 0) - (b.score || 0))
      .slice(0, 5);

    // Certificados do piloto
    const certs = safeParse(selectedPilot?.certificates, []);
    const cma = safeParse(selectedPilot?.cma, null);
    const expiries = selectedPilot ? collectExpiries(selectedPilot) : [];
    const certsNearExpiry = expiries
      .map((e) => ({ ...e, ...expiryStatus(e.date) }))
      .filter((e) => e.days !== null && e.days <= 90 && e.days >= 0)
      .slice(0, 5);

    // Treinamentos recorrentes pendentes (certificados vencidos ou a vencer)
    const recurringPending = expiries
      .map((e) => ({ ...e, ...expiryStatus(e.date) }))
      .filter((e) => e.days !== null && e.days <= 60)
      .slice(0, 5);

    // Avaliações pendentes (treinamentos não concluídos)
    const pendingTrainings = (completions || []).filter((c) => c.status === "pending").slice(0, 5);

    // Recomendações de revisão
    const reviewRecs = recs.filter((r) => r.status === "revisao_recomendada").slice(0, 5);

    return {
      completedLessons, inProgressLessons, reviewLessons, pendingLessons,
      totalTime, overallPct, lastAccessed,
      timeThisWeek, timeThisMonth,
      avgScore, examsTaken, examAvg, questionsAnswered, hitRate,
      errorContent, certsNearExpiry, recurringPending, pendingTrainings, reviewRecs,
      certsCount: certs.length, cmaStatus: cma?.expiry || null,
    };
  }, [records, completions, simHistory, selectedPilot]);

  const handleLessonAction = async (lesson, newStatus, module, topic) => {
    if (!selectedPilot) return;
    const targetUserId = selectedPilot.user_id || user?.id;
    const existing = recordsByContentId[lesson.id];
    const now = new Date().toISOString();
    const payload = {
      user_id: targetUserId,
      pilot_id: selectedPilot.id,
      content_id: lesson.id,
      content_type: "aula",
      content_title: lesson.title,
      module_id: module.id,
      module_title: module.title,
      status: newStatus,
      last_accessed_at: now,
    };
    if (newStatus === "concluido") {
      payload.completed_at = now;
      payload.completion_criteria = JSON.stringify({ aceite_conclusao: true });
    }
    try {
      if (existing) {
        await base44.entities.ProgressRecord.update(existing.id, payload);
      } else {
        await base44.entities.ProgressRecord.create({ ...payload, aircraftProfile: profileValue });
      }
      // Recarrega registros
      const recs = await base44.entities.ProgressRecord.filter({ ...profileFilter, user_id: targetUserId }).catch(() => []);
      setRecords(recs);
    } catch (e) {
      // silencioso
    }
  };

  if (!pilots || !records || !completions) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Dashboard de Progresso
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Acompanhamento individual de treinamento, desempenho e certificações.
          </p>
        </div>
        <BackToDashboard />
      </header>

      {/* Seletor de piloto (admin) */}
      {canViewOthers && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Users className="w-4 h-4" /> Piloto:
          </div>
          <select
            value={selectedPilotId || ""}
            onChange={(e) => setSelectedPilotId(e.target.value || null)}
            className="px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-slate-200 text-sm min-w-[260px]"
          >
            <option value="">Selecionar piloto…</option>
            {pilots.filter((p) => p.status !== "inactive").map((p) => (
              <option key={p.id} value={p.id}>{p.full_name || p.war_name || "—"}</option>
            ))}
          </select>
        </div>
      )}

      {/* Perfil do piloto selecionado */}
      {selectedPilot && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#1A1D25] border border-slate-700/60">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-300 font-semibold text-sm shrink-0">
            {(selectedPilot.full_name || "?").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-100 truncate">{selectedPilot.full_name}</p>
            <p className="text-xs text-slate-500">{selectedPilot.role || "—"} · {selectedPilot.base || "—"}</p>
          </div>
        </div>
      )}

      {/* Botão Continuar de onde parei */}
      {metrics.lastAccessed && (
        <Link
          to="/treinamentos"
          className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-amber-500/5 border border-amber-500/30 hover:border-amber-500/50 transition-colors group"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <PlayCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-300 uppercase tracking-wide">Continuar de onde parei</p>
            <p className="text-sm text-slate-300 truncate mt-0.5">
              {metrics.lastAccessed.content_title || metrics.lastAccessed.module_title || "Conteúdo em andamento"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {metrics.lastAccessed.module_title} · acessado em {new Date(metrics.lastAccessed.last_accessed_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>
      )}

      {/* Cards de visão geral */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard icon={TrendingUp} label="Progresso geral" value={`${metrics.overallPct}%`} accent="text-amber-400" />
        <OverviewCard icon={CheckCircle2} label="Aulas concluídas" value={`${metrics.completedLessons}/${TOTAL_LESSONS}`} accent="text-emerald-400" />
        <OverviewCard icon={Clock} label="Tempo de estudo" value={fmtStudyTime(metrics.totalTime)} accent="text-sky-400" />
        <OverviewCard icon={Award} label="Média geral" value={metrics.avgScore ? `${metrics.avgScore}%` : "—"} accent="text-violet-400" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard icon={BookOpen} label="Aulas pendentes" value={metrics.pendingLessons} accent="text-rose-400" />
        <OverviewCard icon={PlayCircle} label="Em andamento" value={metrics.inProgressLessons} accent="text-sky-400" />
        <OverviewCard icon={Target} label="Taxa de acertos" value={metrics.hitRate ? `${metrics.hitRate}%` : "—"} accent="text-teal-400" />
        <OverviewCard icon={BarChart3} label="Simulados" value={metrics.examsTaken} accent="text-amber-400" />
      </div>

      {/* Tempo por período */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <PeriodCard label="Tempo total" value={fmtStudyTime(metrics.totalTime)} icon={Clock} />
        <PeriodCard label="Últimos 7 dias" value={fmtStudyTime(metrics.timeThisWeek)} icon={Clock} />
        <PeriodCard label="Últimos 30 dias" value={fmtStudyTime(metrics.timeThisMonth)} icon={Clock} />
      </div>

      {/* Módulos com barras de progresso */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-amber-400" /> Progresso por Módulo
        </h2>
        <div className="space-y-3">
          {CONTENT_TREE.map((m) => (
            <ModuleCard
              key={m.id}
              module={m}
              recordsByContentId={recordsByContentId}
              onLessonAction={handleLessonAction}
            />
          ))}
        </div>
      </div>

      {/* Desempenho + Questões */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Desempenho por assunto (simulados) */}
        <Panel title="Desempenho em Simulados" icon={BarChart3}>
          {simHistory.length === 0 ? (
            <Empty text="Nenhum simulado realizado ainda." />
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Realizados" value={metrics.examsTaken} tone="text-slate-100" />
                <MiniStat label="Média" value={`${metrics.examAvg}%`} tone="text-teal-300" />
                <MiniStat label="Melhor" value={`${Math.max(...simHistory.map((r) => r.pct))}%`} tone="text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Histórico de tentativas</p>
                <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                  {simHistory.slice(0, 10).map((r, i) => (
                    <li key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-700/20 text-sm">
                      <span className="text-slate-400 text-xs">{new Date(r.date).toLocaleDateString("pt-BR")}</span>
                      <span className={`font-semibold ${r.pct >= 70 ? "text-teal-300" : "text-rose-300"}`}>{r.pct}%</span>
                      <span className="text-xs text-slate-500">{r.correct}/{r.total}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Panel>

        {/* Conteúdos com maior índice de erro */}
        <Panel title="Conteúdos com Maior Índice de Erro" icon={AlertTriangle}>
          {metrics.errorContent.length === 0 ? (
            <Empty text="Nenhum conteúdo com baixo desempenho." />
          ) : (
            <ul className="space-y-2">
              {metrics.errorContent.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-sm text-slate-300 truncate flex-1">{c.training_title || "Treinamento"}</span>
                  <span className="text-sm font-bold text-rose-300">{c.score}%</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Certificados + Pendências */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Certificados próximos do vencimento */}
        <Panel title="Certificados Próximos do Vencimento" icon={FileWarning}>
          {metrics.certsNearExpiry.length === 0 ? (
            <Empty text="Nenhum certificado vencendo nos próximos 90 dias." />
          ) : (
            <ul className="space-y-2">
              {metrics.certsNearExpiry.map((e, i) => {
                const meta = STATUS_META[e.status === "expired" ? "vencido" : "pendente"] || STATUS_META.pendente;
                return (
                  <li key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-slate-700/20">
                    <span className={`w-2 h-2 rounded-full ${meta.dot} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">{e.label}</p>
                      <p className="text-xs text-slate-500">{e.kind} · {new Date(e.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${meta.pill}`}>{e.days}d</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {/* Treinamentos recorrentes pendentes + Avaliações pendentes */}
        <Panel title="Pendências e Recomendações" icon={ClipboardList}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Treinamentos recorrentes pendentes</p>
              {metrics.recurringPending.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhum treinamento recorrente pendente.</p>
              ) : (
                <ul className="space-y-1.5">
                  {metrics.recurringPending.map((e, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate flex-1">{e.label}</span>
                      <span className="text-xs text-slate-500">{e.days < 0 ? "Vencido" : `${e.days}d`}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Avaliações pendentes</p>
              {metrics.pendingTrainings.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhuma avaliação pendente.</p>
              ) : (
                <ul className="space-y-1.5">
                  {metrics.pendingTrainings.map((c) => (
                    <li key={c.id} className="flex items-center gap-2 text-sm text-slate-300">
                      <ClipboardList className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate flex-1">{c.training_title || "Treinamento"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Recomendações de revisão</p>
              {metrics.reviewRecs.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhuma revisão recomendada.</p>
              ) : (
                <ul className="space-y-1.5">
                  {metrics.reviewRecs.map((r) => (
                    <li key={r.id} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                      <span className="truncate flex-1">{r.content_title || r.module_title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Panel>
      </div>

      {/* Legenda de status */}
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Legenda de Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {STATUS_ORDER.map((s) => {
            const meta = STATUS_META[s];
            return (
              <div key={s} className="flex items-center gap-2">
                <span className="text-lg">{meta.emoji}</span>
                <span className="text-xs text-slate-400">{meta.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ----- Sub-componentes -----
function OverviewCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
      <Icon className="w-5 h-5 text-slate-400 mb-2" />
      <p className={`text-2xl font-bold tracking-tight ${accent}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function PeriodCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-4 flex items-center gap-3">
      <Icon className="w-5 h-5 text-sky-400 shrink-0" />
      <div>
        <p className="text-lg font-bold text-slate-100">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 bg-[#12141A] border-b border-slate-700/60">
        <Icon className="w-4 h-4 text-amber-400" />
        <h3 className="font-semibold text-sm text-slate-200">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  return (
    <div className="text-center py-2 rounded-lg bg-slate-700/20">
      <p className={`text-xl font-bold ${tone}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-sm text-slate-500 text-center py-6">{text}</p>;
}