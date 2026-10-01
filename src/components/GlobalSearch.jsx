import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Siren, GraduationCap, HelpCircle, X, ChevronRight } from "lucide-react";
import { QRH_PROCEDURES } from "@/lib/qrhData";
import { AW119_KOALA, GENERAL_MODULES } from "@/lib/trainingData";
import { SAFETY_TOPICS } from "@/lib/academyData";
import { LICENSE_TYPES } from "@/lib/pilotUtils";

// Universal search across static content (QRH, academy, library categories, questions)
export default function GlobalSearch({ onClose, open }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { qrh: [], academy: [], questions: [], cheats: [] };
    const qrh = QRH_PROCEDURES.filter((p) => `${p.title} ${p.condition}`.toLowerCase().includes(q)).slice(0, 6);
    const academy = [
      ...AW119_KOALA.modules.map((m) => ({ title: m.title, type: "Módulo", path: "/treinamentos" })),
      ...GENERAL_MODULES.map((m) => ({ title: m.title, type: "Treinamento geral", path: "/treinamentos" })),
      ...SAFETY_TOPICS.map((t) => ({ title: t, type: "Tópico", path: "/treinamentos" })),
    ].filter((x) => x.title.toLowerCase().includes(q)).slice(0, 6);
    const questions = [
      { title: "Banco de questões", type: "Prova", path: "/questoes" },
      { title: "Simulados", type: "Avaliação", path: "/simulados" },
      { title: "Biblioteca técnica", type: "Docs", path: "/biblioteca" },
      { title: "Cadastro de pilotos", type: "Operações", path: "/pilotos" },
    ].filter((x) => x.title.toLowerCase().includes(q));
    const cheats = LICENSE_TYPES.filter((l) => l.toLowerCase().includes(q)).map((l) => ({ title: l, type: "Habilitação", path: "/pilotos" }));
    return { qrh, academy, questions, cheats };
  }, [query]);

  const openResult = (path) => { onClose(); navigate(path); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 pt-16 sm:pt-24">
      <div className="bg-[#1A1D25] w-full max-w-xl rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar em biblioteca, QRH, procedimentos, questões, sistemas…"
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none text-sm"
          />
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-4">
          {!query.trim() && <p className="text-center text-xs text-slate-500 py-6">Digite para buscar em todo o conteúdo da plataforma.</p>}

          {query.trim() && results.qrh.length === 0 && results.academy.length === 0 && results.questions.length === 0 && results.cheats.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-6">Nenhum resultado para "{query}".</p>
          )}

          {results.qrh.length > 0 && <ResultGroup icon={Siren} color="text-rose-400" title="QRH" items={results.qrh} onPick={openResult} />}
          {results.academy.length > 0 && <ResultGroup icon={GraduationCap} color="text-amber-400" title="Academy" items={results.academy} onPick={openResult} />}
          {results.questions.length > 0 && <ResultGroup icon={HelpCircle} color="text-sky-400" title="Módulos" items={results.questions} onPick={openResult} />}
          {results.cheats.length > 0 && <ResultGroup icon={BookOpen} color="text-emerald-400" title="Habilitações" items={results.cheats} onPick={openResult} />}
        </div>
      </div>
    </div>
  );
}

function ResultGroup({ icon: Icon, color, title, items, onPick }) {
  return (
    <div>
      <p className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold ${color} px-2 mb-1`}>
        <Icon className="w-3.5 h-3.5" /> {title}
      </p>
      <div className="space-y-1">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => onPick(item.path)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm text-slate-300 hover:bg-white/5 hover:text-slate-100 transition-colors group"
          >
            <span className="truncate">{item.title}</span>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}