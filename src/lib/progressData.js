// Árvore de conteúdo do Dashboard de Progresso — derivada das disciplinas da Academy.
// Estrutura: Módulo → Tópicos → Aulas
import { ACADEMY_DISCIPLINES } from "./academyData";

export const CONTENT_TREE = ACADEMY_DISCIPLINES.map((d) => {
  const topics = [];
  if (d.categories) {
    d.categories.forEach((c) => {
      const topicId = `${d.id}__${c.title}`;
      topics.push({
        id: topicId,
        title: c.title,
        lessons: c.topics.map((t) => ({ id: `${topicId}__${t}`, title: t })),
      });
    });
  } else if (d.sections) {
    d.sections.forEach((s) => {
      const topicId = `${d.id}__${s.title}`;
      topics.push({
        id: topicId,
        title: s.title,
        lessons: s.items.map((i) => ({ id: `${topicId}__${i}`, title: i })),
      });
    });
  } else if (d.chapters) {
    d.chapters.forEach((c) => {
      const topicId = `${d.id}__${c.id}`;
      topics.push({
        id: topicId,
        title: c.title,
        lessons: c.items.map((i) => ({ id: `${topicId}__${i}`, title: i })),
      });
    });
  }
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    icon: d.icon,
    accent: d.accent,
    topics,
  };
});

// Lista plana de todas as aulas (para contagem total)
export const ALL_LESSONS = CONTENT_TREE.flatMap((m) =>
  m.topics.flatMap((t) => t.lessons)
);

export const TOTAL_LESSONS = ALL_LESSONS.length;

// Mapa rápido: content_id → { module, topic, lesson }
export const LESSON_INDEX = (() => {
  const idx = {};
  CONTENT_TREE.forEach((m) => {
    m.topics.forEach((t) => {
      t.lessons.forEach((l) => {
        idx[l.id] = { module: m, topic: t, lesson: l };
      });
    });
  });
  return idx;
})();

// Status possíveis e seus metadados visuais
export const STATUS_META = {
  concluido: { label: "Concluído", emoji: "✅", dot: "bg-emerald-500", text: "text-emerald-400", pill: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  em_andamento: { label: "Em andamento", emoji: "🔵", dot: "bg-sky-500", text: "text-sky-400", pill: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
  revisao_recomendada: { label: "Revisão recomendada", emoji: "🟡", dot: "bg-yellow-500", text: "text-yellow-400", pill: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30" },
  pendente: { label: "Pendente", emoji: "🔴", dot: "bg-rose-500", text: "text-rose-400", pill: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
  vencido: { label: "Vencido", emoji: "🔴", dot: "bg-rose-500", text: "text-rose-400", pill: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
  bloqueado: { label: "Bloqueado por pré-requisito", emoji: "🔒", dot: "bg-slate-500", text: "text-slate-400", pill: "bg-slate-600/20 text-slate-400 border-slate-600/40" },
  nao_iniciado: { label: "Não iniciado", emoji: "⚪", dot: "bg-slate-600", text: "text-slate-500", pill: "bg-slate-700/30 text-slate-500 border-slate-600/40" },
};

export const STATUS_ORDER = ["concluido", "em_andamento", "revisao_recomendada", "pendente", "vencido", "bloqueado", "nao_iniciado"];

// Calcula progresso de um módulo a partir dos registros do piloto
export function computeModuleProgress(module, recordsByContentId) {
  const lessons = module.topics.flatMap((t) => t.lessons);
  const total = lessons.length;
  if (total === 0) return { total: 0, completed: 0, inProgress: 0, pct: 0, status: "nao_iniciado" };
  let completed = 0;
  let inProgress = 0;
  let accessed = 0;
  lessons.forEach((l) => {
    const rec = recordsByContentId[l.id];
    if (rec) {
      accessed++;
      if (rec.status === "concluido") completed++;
      else if (rec.status === "em_andamento") inProgress++;
    }
  });
  const pct = Math.round((completed / total) * 100);
  let status = "nao_iniciado";
  if (completed === total) status = "concluido";
  else if (accessed > 0) status = "em_andamento";
  return { total, completed, inProgress, accessed, pct, status };
}

// Formata segundos em "Xh Ym"
export function fmtStudyTime(seconds) {
  if (!seconds || seconds < 60) return "0min";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h && m) return `${h}h${String(m).padStart(2, "0")}`;
  if (h) return `${h}h`;
  return `${m}min`;
}