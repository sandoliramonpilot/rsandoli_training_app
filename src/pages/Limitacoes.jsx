import React, { useState, useMemo } from "react";
import { LIMITACOES, DIDATIC_NOTICE, PARAM_STATUS, LIMIT_KIND, PENDING_VALIDATION } from "@/lib/limitacoesData";
import BackToDashboard from "@/components/BackToDashboard";
import {
  Gauge, Plane, Cog, Settings, ChevronRight, ChevronDown, ChevronLeft,
  BookOpen, AlertTriangle, CheckCircle2, FileCheck2, ArrowLeft, ExternalLink,
} from "lucide-react";

const MODULE_ICONS = { Plane, Gauge, Cog, Settings };
const STATUS_ICONS = { Check: CheckCircle2, CheckCheck: FileCheck2, AlertTriangle };

const STATUS_CLASSES = {
  confirmed: "text-emerald-400",
  corrected: "text-sky-400",
  pending: "text-amber-400",
};

const KIND_CLASSES = {
  normal: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  caution: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  limit: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  transient: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  info: "bg-slate-500/10 text-slate-300 border-slate-500/30",
};

export default function Limitacoes() {
  const [activeModule, setActiveModule] = useState(LIMITACOES.modules[0].id);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [search, setSearch] = useState("");

  const mod = LIMITACOES.modules.find((m) => m.id === activeModule) || LIMITACOES.modules[0];

  // Busca unificada: filtra capítulos do módulo ativo por texto
  const filteredChapters = useMemo(() => {
    if (!search.trim()) return mod.chapters;
    const q = search.trim().toLowerCase();
    return mod.chapters.filter(
      (ch) =>
        ch.title.toLowerCase().includes(q) ||
        ch.parameters?.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.value.toLowerCase().includes(q) ||
            (p.condition || "").toLowerCase().includes(q)
        )
    );
  }, [mod, search]);

  // Busca global em todos os módulos (para contagem de resultados)
  const globalResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    const results = [];
    for (const m of LIMITACOES.modules) {
      for (const ch of m.chapters) {
        const matches = ch.parameters?.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.value.toLowerCase().includes(q) ||
            (p.condition || "").toLowerCase().includes(q)
        ) || [];
        if (ch.title.toLowerCase().includes(q) || matches.length > 0) {
          results.push({ module: m.title, moduleId: m.id, chapter: ch.title, chapterId: ch.id, count: matches.length || 1 });
        }
      }
    }
    return results;
  }, [search]);

  const chapter = selectedChapter
    ? mod.chapters.find((c) => c.id === selectedChapter)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Limitações
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">{LIMITACOES.subtitle}</p>
        </div>
        <BackToDashboard />
      </header>

      {/* Premium banner */}
      <div className="bg-gradient-to-br from-[#1A1D25] to-[#12141A] rounded-2xl border border-amber-500/20 shadow-lg overflow-hidden">
        <div className="p-6 md:p-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <BookOpen className="w-3.5 h-3.5" /> Ground School
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Leonardo AW119Kx Koala — PT6B-37A / IDU-680</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">LIMITAÇÕES E PARÂMETROS</h2>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl">{DIDATIC_NOTICE}</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <Gauge className="w-10 h-10 text-slate-900" />
          </div>
        </div>
      </div>

      {/* Legenda de status */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="font-medium uppercase tracking-wider">Legenda:</span>
        {Object.entries(PARAM_STATUS).map(([key, s]) => {
          const Icon = STATUS_ICONS[s.icon] || CheckCircle2;
          return (
            <span key={key} className="inline-flex items-center gap-1.5">
              <Icon className={`w-3.5 h-3.5 ${STATUS_CLASSES[key]}`} />
              <span className={STATUS_CLASSES[key]}>{s.label}</span>
            </span>
          );
        })}
        <span className="text-slate-600 border-l border-slate-700 pl-3">
          Valores verificados: RFM — Rotorcraft Flight Manual (Pub. 502051481)
        </span>
      </div>

      {/* Busca */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar parâmetro, valor ou unidade (ex.: ITT, 108,5%, torque)…"
          className="w-full px-4 py-3 rounded-xl bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
        )}
      </div>

      {/* Resultados da busca global */}
      {search && globalResults.length > 0 && (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3">
            Resultados em todos os módulos ({globalResults.reduce((a, r) => a + r.count, 0)})
          </p>
          <div className="space-y-1.5">
            {globalResults.map((r) => (
              <button
                key={`${r.moduleId}-${r.chapterId}`}
                onClick={() => {
                  setActiveModule(r.moduleId);
                  setSelectedChapter(r.chapterId);
                  setSearch("");
                }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-slate-700/20 border border-slate-700/30 hover:border-amber-500/40 transition-colors text-sm"
              >
                <span className="text-slate-300 truncate">
                  <span className="text-slate-500">{r.module}</span>
                  <ChevronRight className="inline w-3 h-3 mx-1 text-slate-600" />
                  {r.chapter}
                </span>
                <span className="text-xs text-amber-400 shrink-0">{r.count} parâmetro{r.count > 1 ? "s" : ""}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Module tabs */}
      <div className="flex flex-wrap gap-2">
        {LIMITACOES.modules.map((m) => {
          const Icon = MODULE_ICONS[m.icon] || BookOpen;
          const active = m.id === activeModule;
          return (
            <button
              key={m.id}
              onClick={() => {
                setActiveModule(m.id);
                setSelectedChapter(null);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                active
                  ? "bg-amber-500 text-slate-900 border-amber-500"
                  : "bg-[#1A1D25] text-slate-300 border-slate-700/60 hover:border-amber-500/40"
              }`}
            >
              <Icon className="w-4 h-4" /> {m.title}
            </button>
          );
        })}
      </div>

      {/* Module objective */}
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <p className="text-sm text-slate-400">{mod.objective}</p>
      </div>

      {/* Chapter detail view */}
      {chapter ? (
        <ChapterDetail
          chapter={chapter}
          onBack={() => setSelectedChapter(null)}
        />
      ) : (
        /* Chapter list */
        <div className="space-y-3">
          {filteredChapters.length === 0 && (
            <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-8 text-center">
              <p className="text-slate-500 text-sm">Nenhum capítulo corresponde à busca.</p>
            </div>
          )}
          {filteredChapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChapter(ch.id)}
              className="w-full bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5 text-left hover:border-amber-500/40 transition-colors group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                    {ch.title}
                  </h3>
                  {ch.objective && (
                    <p className="text-xs text-slate-500 mt-1 truncate">{ch.objective}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-500">
                    {ch.parameters?.length || 0} parâmetros
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Source PDF reference */}
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-slate-100">Fonte original</h3>
            <p className="text-xs text-slate-500 mt-1">
              Conteúdo organizado a partir do PDF "Limitações e Parâmetros" do Departamento de Instrução Técnica.
              Valores de torque, ITT de partida e N1 verificados contra o RFM — Rotorcraft Flight Manual (Pub. 502051481).
              Itens marcados como Pendente aguardam validação técnica contra a documentação oficial aplicável à configuração.
            </p>
            <a
              href={LIMITACOES.sourcePdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 mt-2"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Abrir PDF original
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Chapter detail view
// ============================================================
function ChapterDetail({ chapter, onBack }) {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Voltar para lista de capítulos
      </button>

      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <h2 className="text-lg font-bold text-slate-100">{chapter.title}</h2>
        {chapter.objective && <p className="text-sm text-slate-400 mt-1">{chapter.objective}</p>}
      </div>

      {/* Parameters */}
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
        <div className="px-5 py-3 bg-[#12141A] border-b border-slate-700/60">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Parâmetros</p>
        </div>
        <div className="divide-y divide-slate-700/40">
          {chapter.parameters?.map((p, i) => {
            const StatusIcon = STATUS_ICONS[PARAM_STATUS[p.status]?.icon] || CheckCircle2;
            return (
              <div key={i} className="px-5 py-3.5 hover:bg-white/[0.015] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-200">{p.name}</span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${KIND_CLASSES[p.kind] || KIND_CLASSES.info}`}
                      >
                        {LIMIT_KIND[p.kind]?.label || "Referência"}
                      </span>
                    </div>
                    {p.condition && (
                      <p className="text-xs text-sky-300 mt-1">Condição: {p.condition}</p>
                    )}
                    {p.remarks && <p className="text-xs text-slate-500 mt-1">{p.remarks}</p>}
                    {p.status === "pending" && (
                      <p className="text-[11px] text-amber-400/70 mt-1 italic">{PENDING_VALIDATION}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 sm:flex-col sm:items-end sm:gap-1.5">
                    <span className="text-lg font-bold font-mono text-amber-300">{p.value}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] ${STATUS_CLASSES[p.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {PARAM_STATUS[p.status]?.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table (fuel capacity) */}
      {chapter.table && (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
          <div className="px-5 py-3 bg-[#12141A] border-b border-slate-700/60">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
              Capacidade dos tanques
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/40 text-slate-500 text-xs uppercase tracking-wider">
                  {chapter.table.headers.map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {chapter.table.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.015]">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-5 py-2.5 ${j === 0 ? "font-medium text-slate-200" : "text-slate-300 font-mono"}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      {chapter.notes?.length > 0 && (
        <div className="space-y-2">
          {chapter.notes.map((note, i) => (
            <div
              key={i}
              className="px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-200/80 text-xs leading-relaxed"
            >
              {note}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}