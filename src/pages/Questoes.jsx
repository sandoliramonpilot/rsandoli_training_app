import React, { useMemo, useState } from "react";
import { QUESTION_BANK, DIFFICULTY, SUBJECTS, SYSTEMS } from "@/lib/questionData";
import { Search, HelpCircle, BookOpen, ChevronDown, ChevronUp, Filter } from "lucide-react";

export default function Questoes() {
  const [query, setQuery] = useState("");
  const [system, setSystem] = useState("all");
  const [subject, setSubject] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [answered, setAnswered] = useState({});

  const filtered = useMemo(() => {
    let list = QUESTION_BANK;
    if (system !== "all") list = list.filter((q) => q.system === system);
    if (subject !== "all") list = list.filter((q) => q.subject === subject);
    if (difficulty !== "all") list = list.filter((q) => q.difficulty === difficulty);
    const s = query.trim().toLowerCase();
    if (s) list = list.filter((q) => `${q.question} ${q.explanation} ${q.reference}`.toLowerCase().includes(s));
    return list;
  }, [query, system, subject, difficulty]);

  const toggleAnswer = (q, idx) => {
    setExpanded(q.id);
    if (!answered[q.id]) setAnswered((p) => ({ ...p, [q.id]: idx }));
  };

  const correctCount = Object.entries(answered).filter(([id, idx]) => QUESTION_BANK.find((q) => q.id === Number(id))?.correct === idx).length;
  const totalAnswered = Object.keys(answered).length;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Banco de Questões</h1>
        <p className="text-slate-400 mt-2 text-sm">Perguntas com alternativas, resposta correta, explicação e referência bibliográfica.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Questões" value={QUESTION_BANK.length} />
        <StatCard label="Respondidas" value={totalAnswered} />
        <StatCard label="Corretas" value={correctCount} accent="text-emerald-400" />
        <StatCard label="Aproveitamento" value={totalAnswered ? `${Math.round((correctCount / totalAnswered) * 100)}%` : "—"} accent="text-teal-400" />
      </div>

      {/* Search + filters */}
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar questão, explicação ou referência…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500" />
          <Sel value={system} onChange={setSystem} options={[{ v: "all", l: "Todos sistemas" }, ...SYSTEMS.map((x) => ({ v: x, l: x }))]} />
          <Sel value={subject} onChange={setSubject} options={[{ v: "all", l: "Todas matérias" }, ...SUBJECTS.map((x) => ({ v: x, l: x }))]} />
          <Sel value={difficulty} onChange={setDifficulty} options={[{ v: "all", l: "Todas dificuldades" }, ...Object.entries(DIFFICULTY).map(([v, d]) => ({ v, l: d.label }))]} />
          <span className="ml-auto text-xs text-slate-500">{filtered.length} resultado(s)</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
          <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhuma questão encontrada com os filtros atuais.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, i) => {
            const isOpen = expanded === q.id;
            const userIdx = answered[q.id];
            return (
              <div key={q.id} className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : q.id)} className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors">
                  <span className="text-xs font-bold text-slate-500 mt-0.5 shrink-0 w-8">#{String(q.id).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">{q.system}</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-600">·</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">{q.subject}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY[q.difficulty].cls}`}>{DIFFICULTY[q.difficulty].label}</span>
                      {userIdx !== undefined && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${userIdx === q.correct ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-rose-400 bg-rose-500/10 border-rose-500/30"}`}>
                          {userIdx === q.correct ? "Correta" : "Incorreta"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-100">{q.question}</p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 mt-1" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-700/40">
                    <div className="space-y-2 pt-3">
                      {q.options.map((opt, idx) => {
                        const letter = ["A", "B", "C", "D"][idx];
                        const isCorrect = idx === q.correct;
                        const isUserPick = userIdx === idx;
                        let cls = "border-slate-700/60 hover:border-amber-500/40 text-slate-200";
                        if (userIdx !== undefined) {
                          if (isCorrect) cls = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                          else if (isUserPick) cls = "border-rose-500/50 bg-rose-500/10 text-rose-300";
                          else cls = "border-slate-700/40 text-slate-500";
                        }
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleAnswer(q, idx)}
                            disabled={userIdx !== undefined}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-colors ${cls}`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCorrect && userIdx !== undefined ? "bg-emerald-500 text-slate-900" : "bg-slate-700/60 text-slate-300"}`}>{letter}</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {userIdx !== undefined && (
                      <div className="rounded-xl bg-[#12141A] border border-slate-700/60 p-4 space-y-2">
                        <p className="text-sm text-slate-300"><span className="font-semibold text-emerald-400">Explicação: </span>{q.explanation}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-amber-400" /> {q.reference}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Sel({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50">
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

function StatCard({ label, value, accent = "text-slate-100" }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-4">
      <p className={`text-2xl font-bold tracking-tight ${accent}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}