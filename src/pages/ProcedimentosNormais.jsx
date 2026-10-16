import React, { useState } from "react";
import { PROC_NORMAIS, DIDATIC_NOTICE, RESSALVA_NAO_OFICIAL } from "@/lib/procedimentosNormaisData";
import BackToDashboard from "@/components/BackToDashboard";
import {
  Plane, Monitor, AlertTriangle, Cog, Settings, Navigation,
  ChevronRight, ChevronDown, BookOpen, Crown, ExternalLink,
  Info, AlertOctagon, ListOrdered, Table as TableIcon,
} from "lucide-react";

const MODULE_ICONS = { Plane, Monitor, AlertTriangle, Cog, Settings, Navigation };

export default function ProcedimentosNormais() {
  const [activeModule, setActiveModule] = useState(PROC_NORMAIS.modules[0].id);
  const [expandedChapters, setExpandedChapters] = useState(new Set());

  const mod = PROC_NORMAIS.modules.find((m) => m.id === activeModule) || PROC_NORMAIS.modules[0];

  const toggleChapter = (id) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Procedimentos normais
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">{PROC_NORMAIS.subtitle}</p>
        </div>
        <BackToDashboard />
      </header>

      {/* Premium banner */}
      <div className="bg-gradient-to-br from-[#1A1D25] to-[#12141A] rounded-2xl border border-amber-500/20 shadow-lg overflow-hidden">
        <div className="p-6 md:p-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5" /> Ground School
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Leonardo AW119Kx Koala — PT6B-37A / IDU-680</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">PROCEDIMENTOS NORMAIS</h2>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl">{DIDATIC_NOTICE}</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <BookOpen className="w-10 h-10 text-slate-900" />
          </div>
        </div>
      </div>

      {/* Sources */}
      <div className="flex flex-wrap items-center gap-3">
        {PROC_NORMAIS.sources.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-lg bg-[#1A1D25] border border-slate-700/60"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {s.label}
          </a>
        ))}
      </div>

      {/* Module tabs */}
      <div className="flex flex-wrap gap-2">
        {PROC_NORMAIS.modules.map((m) => {
          const Icon = MODULE_ICONS[m.icon] || BookOpen;
          const active = m.id === activeModule;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
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
        <div className="flex items-start gap-3">
          <ChevronRight className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-100">{mod.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{mod.objective}</p>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-3">
        {mod.chapters.map((ch) => {
          const isOpen = expandedChapters.has(ch.id);
          return (
            <div key={ch.id} className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
              <button
                onClick={() => toggleChapter(ch.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-[#12141A] border-b border-slate-700/60 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  <h3 className="font-semibold text-sm text-slate-100">{ch.title}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-600 uppercase tracking-wider hidden sm:inline">{ch.source}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 py-4 space-y-3">
                  {ch.blocks.map((b, i) => (
                    <BlockRenderer key={i} block={b} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ressalva footer */}
      <div className="px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-200/70 text-xs flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{RESSALVA_NAO_OFICIAL}</span>
      </div>
    </div>
  );
}

// ============================================================
// Block renderer
// ============================================================
function BlockRenderer({ block }) {
  switch (block.type) {
    case "text":
      return <p className="text-sm text-slate-300 leading-relaxed">{block.content}</p>;

    case "list":
      return (
        <ul className="space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );

    case "steps":
      return (
        <ol className="space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      );

    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-slate-700/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#12141A] border-b border-slate-700/40 text-slate-400 text-xs uppercase tracking-wider">
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {block.rows.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.015]">
                  {row.map((cell, j) => (
                    <td key={j} className={`px-4 py-2.5 ${j === 0 ? "font-medium text-amber-300/90 whitespace-nowrap" : "text-slate-300"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "note":
      return (
        <div className="px-4 py-3 rounded-xl bg-sky-500/5 border border-sky-500/20 text-sky-200/80 text-xs flex items-start gap-2 leading-relaxed">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{block.content}</span>
        </div>
      );

    case "warning":
      return (
        <div className="px-4 py-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-200/80 text-xs flex items-start gap-2 leading-relaxed">
          <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{block.content}</span>
        </div>
      );

    default:
      return null;
  }
}