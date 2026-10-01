import React, { useMemo, useState, useEffect } from "react";
import { QUESTION_BANK, DIFFICULTY, SUBJECTS, SYSTEMS } from "@/lib/questionData";
import { Play, Timer, CheckCircle2, XCircle, History, BarChart3, RotateCcw, ChevronLeft, ChevronRight, Trophy } from "lucide-react";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Simulados() {
  const [screen, setScreen] = useState("setup"); // setup | exam | result
  const [count, setCount] = useState(10);
  const [subject, setSubject] = useState("all");
  const [system, setSystem] = useState("all");
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sim_history") || "[]"); } catch { return []; }
  });

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    localStorage.setItem("sim_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (screen !== "exam") return;
    if (timeLeft <= 0) { finishExam(); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, screen]);

  const start = () => {
    let pool = QUESTION_BANK;
    if (subject !== "all") pool = pool.filter((q) => q.subject === subject);
    if (system !== "all") pool = pool.filter((q) => q.system === system);
    const picked = shuffle(pool).slice(0, Math.min(count, pool.length));
    setQuestions(picked);
    setAnswers({});
    setCurrent(0);
    setTimeLeft(picked.length * 60); // 1 min per question
    setScreen("exam");
  };

  const answer = (idx) => {
    const q = questions[current];
    if (answers[q.id] !== undefined) return;
    setAnswers((p) => ({ ...p, [q.id]: idx }));
  };

  const finishExam = () => {
    const correct = questions.filter((q) => answers[q.id] === q.correct).length;
    const total = questions.length;
    const used = total * 60 - timeLeft;
    const r = {
      date: new Date().toISOString(),
      total, correct,
      pct: total ? Math.round((correct / total) * 100) : 0,
      timeUsed: used,
      wrong: total - correct - Object.keys(answers).filter((id) => !questions.find((q) => q.id === Number(id))).length,
    };
    setResult(r);
    setHistory((h) => [{ ...r }, ...h].slice(0, 20));
    setScreen("result");
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (screen === "exam") {
    const q = questions[current];
    const userIdx = answers[q.id];
    const answeredCount = Object.keys(answers).length;
    return (
      <div className="space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Simulado em andamento</p>
            <h1 className="text-xl font-bold mt-0.5">Questão {current + 1} de {questions.length}</h1>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold ${timeLeft < 60 ? "text-rose-400 border-rose-500/40 bg-rose-500/10" : "text-teal-300 border-teal-500/30 bg-teal-500/10"}`}>
            <Timer className="w-4 h-4" /> {fmtTime(timeLeft)}
          </div>
        </header>

        <div className="h-1.5 bg-[#1A1D25] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>

        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">{q.system}</span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY[q.difficulty].cls}`}>{DIFFICULTY[q.difficulty].label}</span>
          </div>
          <p className="text-lg font-medium text-slate-100 mb-5">{q.question}</p>
          <div className="space-y-2.5">
            {q.options.map((opt, idx) => {
              const letter = ["A", "B", "C", "D"][idx];
              let cls = "border-slate-700/60 hover:border-amber-500/40";
              if (userIdx !== undefined) {
                if (idx === q.correct) cls = "border-emerald-500/50 bg-emerald-500/10";
                else if (idx === userIdx) cls = "border-rose-500/50 bg-rose-500/10";
                else cls = "border-slate-700/40 opacity-60";
              }
              return (
                <button key={idx} onClick={() => answer(idx)} disabled={userIdx !== undefined}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm text-slate-200 transition-colors ${cls}`}>
                  <span className="w-6 h-6 rounded-full bg-slate-700/60 flex items-center justify-center text-xs font-bold shrink-0">{letter}</span>
                  {opt}
                </button>
              );
            })}
          </div>
          {userIdx !== undefined && (
            <div className="mt-4 rounded-xl bg-[#12141A] border border-slate-700/60 p-4">
              <p className="text-sm text-slate-300"><span className="font-semibold text-emerald-400">Explicação: </span>{q.explanation}</p>
              <p className="text-xs text-slate-500 mt-1.5">{q.reference}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-700 text-slate-300 disabled:opacity-40 hover:border-amber-500/40">
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent((c) => c + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900">
              Próxima <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={finishExam}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium bg-teal-500 hover:bg-teal-400 text-slate-900">
              <CheckCircle2 className="w-4 h-4" /> Finalizar
            </button>
          )}
        </div>
      </div>
    );
  }

  if (screen === "result" && result) {
    const passed = result.pct >= 70;
    return (
      <div className="space-y-6">
        <header>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Resultado</p>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Simulado Concluído</h1>
        </header>
        <div className={`rounded-2xl border p-8 text-center ${passed ? "bg-teal-500/5 border-teal-500/30" : "bg-rose-500/5 border-rose-500/30"}`}>
          <Trophy className={`w-12 h-12 mx-auto mb-3 ${passed ? "text-amber-400" : "text-slate-500"}`} />
          <p className={`text-5xl font-bold ${passed ? "text-teal-300" : "text-rose-300"}`}>{result.pct}%</p>
          <p className="text-slate-400 mt-2">{result.correct} de {result.total} corretas · {fmtTime(result.timeUsed)} de tempo</p>
          <p className={`text-sm font-semibold mt-2 ${passed ? "text-teal-400" : "text-rose-400"}`}>{passed ? "Aprovado (≥70%)" : "Reprovado (<70%)"}</p>
        </div>
        <div className="flex justify-center gap-3">
          <button onClick={() => setScreen("setup")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-700 text-slate-200 hover:border-amber-500/40">
            <RotateCcw className="w-4 h-4" /> Novo simulado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Simulados</h1>
        <p className="text-slate-400 mt-2 text-sm">Questões aleatórias com cronômetro, correção automática e estatísticas.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Setup */}
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6 space-y-5">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2"><Play className="w-4 h-4 text-amber-400" /> Configurar Simulado</h2>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Número de questões: {count}</label>
            <input type="range" min="5" max={QUESTION_BANK.length} step="5" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full accent-amber-500" />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1"><span>5</span><span>{QUESTION_BANK.length}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Matéria</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200">
                <option value="all">Todas</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Sistema</label>
              <select value={system} onChange={(e) => setSystem(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200">
                <option value="all">Todos</option>
                {SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="rounded-xl bg-[#12141A] border border-slate-700/60 p-4 text-xs text-slate-400 space-y-1">
            <p>· Questões aleatórias do banco</p>
            <p>· Tempo: 1 minuto por questão</p>
            <p>· Correção automática ao final</p>
            <p>· Aprovação com 70% ou mais</p>
          </div>
          <button onClick={start} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 hover:from-amber-400 hover:to-amber-300 shadow-lg shadow-amber-500/20">
            <Play className="w-4 h-4" /> Iniciar Simulado
          </button>
        </div>

        {/* Stats + history */}
        <div className="space-y-5">
          <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6">
            <h2 className="font-semibold text-slate-100 flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-teal-400" /> Desempenho</h2>
            {history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum simulado realizado ainda.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center"><p className="text-2xl font-bold text-slate-100">{history.length}</p><p className="text-xs text-slate-500">Realizados</p></div>
                <div className="text-center"><p className="text-2xl font-bold text-teal-300">{Math.round(history.reduce((s, r) => s + r.pct, 0) / history.length)}%</p><p className="text-xs text-slate-500">Média</p></div>
                <div className="text-center"><p className="text-2xl font-bold text-amber-400">{Math.max(...history.map((r) => r.pct))}%</p><p className="text-xs text-slate-500">Melhor</p></div>
              </div>
            )}
          </div>
          <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6">
            <h2 className="font-semibold text-slate-100 flex items-center gap-2 mb-4"><History className="w-4 h-4 text-slate-400" /> Histórico de Tentativas</h2>
            {history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Sem histórico.</p>
            ) : (
              <ul className="space-y-2">
                {history.slice(0, 8).map((r, i) => (
                  <li key={i} className="flex items-center justify-between py-2 border-b border-slate-700/40 last:border-0">
                    <div className="flex items-center gap-2.5">
                      {r.pct >= 70 ? <CheckCircle2 className="w-4 h-4 text-teal-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                      <span className="text-sm text-slate-300">{new Date(r.date).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${r.pct >= 70 ? "text-teal-300" : "text-rose-300"}`}>{r.pct}%</span>
                      <span className="text-xs text-slate-500 ml-2">{r.correct}/{r.total}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}