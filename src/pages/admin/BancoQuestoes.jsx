import React, { useState, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { can } from "@/lib/accessControl";
import { PILOT_QUESTIONS, MODULES, CONTENT_STATUS, DIFFICULTIES, COGNITIVE_LEVELS, validarLotePiloto } from "@/lib/questions";
import { Loader2, Search, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

const STATUS_LABEL = {
  draft: "Rascunho",
  technical_review: "Em revisão técnica",
  revision_requested: "Correção solicitada",
  awaiting_approval: "Aguardando aprovação",
  approved_for_training: "Aprovada para treinamento",
  obsolete: "Obsoleta",
  archived: "Arquivada",
};

const DIFF_LABEL = { easy: "Básica", medium: "Intermediária", hard: "Avançada" };

export default function BancoQuestoes() {
  const { user } = useAuth();
  const [busca, setBusca] = useState("");
  const [filtroModulo, setFiltroModulo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroDificuldade, setFiltroDificuldade] = useState("");
  const [expandida, setExpandida] = useState(null);

  const podeVer = can(user, "questoes", "visualizar");

  const validacao = useMemo(() => validarLotePiloto(), []);

  const filtradas = useMemo(() => {
    return PILOT_QUESTIONS.filter((q) => {
      if (filtroModulo && q.moduleId !== filtroModulo) return false;
      if (filtroStatus && q.status !== filtroStatus) return false;
      if (filtroDificuldade && q.difficulty !== filtroDificuldade) return false;
      if (busca.trim()) {
        const t = busca.trim().toLowerCase();
        return (
          q.questionText?.toLowerCase().includes(t) ||
          q.questionCode?.toLowerCase().includes(t)
        );
      }
      return true;
    });
  }, [busca, filtroModulo, filtroStatus, filtroDificuldade]);

  if (!podeVer) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
        <p className="text-sm text-slate-400">Acesso restrito.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <header>
        <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Administração</p>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">Banco de questões — H125</h1>
        <p className="text-sm text-slate-400 mt-1">
          {PILOT_QUESTIONS.length} questões no lote piloto. Todas em revisão técnica.
        </p>
      </header>

      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-700/60 bg-[#1A1D25]">
        {validacao.problemas.length === 0 ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-slate-300">
              Validação: {validacao.validas} de {validacao.total} questões válidas.
            </p>
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-xs text-red-300">
              {validacao.problemas.length} problema(s) encontrados. Revise os arquivos.
            </p>
          </>
        )}
      </div>

      <div className="grid sm:grid-cols-4 gap-2">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por enunciado ou código"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500"
          />
        </div>

        <select
          value={filtroModulo}
          onChange={(e) => setFiltroModulo(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200"
        >
          <option value="">Todos os módulos</option>
          {MODULES.map((m) => (
            <option key={m.id} value={m.id}>{m.code} — {m.title}</option>
          ))}
        </select>

        <select
          value={filtroDificuldade}
          onChange={(e) => setFiltroDificuldade(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200"
        >
          <option value="">Todas as dificuldades</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>{DIFF_LABEL[d]}</option>
          ))}
        </select>
      </div>

      <div className="text-xs text-slate-500">
        {filtradas.length} questão(ões) exibida(s)
      </div>

      <div className="space-y-2">
        {filtradas.map((q) => {
          const aberta = expandida === q.questionCode;
          return (
            <div key={q.questionCode} className="bg-[#1A1D25] rounded-xl border border-slate-700/60 overflow-hidden">
              <button
                onClick={() => setExpandida(aberta ? null : q.questionCode)}
                className="w-full text-left px-4 py-3 hover:bg-white/[0.02]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono text-amber-400">{q.questionCode}</p>
                    <p className="text-sm text-slate-200 mt-1">{q.questionText}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-300">
                      {STATUS_LABEL[q.status] || q.status}
                    </span>
                    <span className="text-[10px] text-slate-500">{DIFF_LABEL[q.difficulty]}</span>
                  </div>
                </div>
              </button>

              {aberta && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-700/40 pt-3">
                  <div className="space-y-1.5">
                    {q.options?.map((o) => {
                      const correta = q.correctAnswer?.includes(o.id);
                      return (
                        <div
                          key={o.id}
                          className={`text-xs px-3 py-1.5 rounded-lg border ${
                            correta
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-slate-700/20 border-slate-700/40 text-slate-400"
                          }`}
                        >
                          <span className="font-mono mr-2">{o.id}.</span>
                          {o.text}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-xs text-slate-400 bg-slate-700/20 rounded-lg px-3 py-2">
                    <p className="font-medium text-slate-300 mb-1">Explicação</p>
                    {q.answerExplanation}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 text-[11px] text-slate-500">
                    <p>Módulo: <span className="text-slate-400">{q.moduleId}</span></p>
                    <p>Nível: <span className="text-slate-400">{q.cognitiveLevel}</span></p>
                    <p>Fonte: <span className="text-slate-400">{q.source?.documentTitle}</span></p>
                    <p>Seção: <span className="text-slate-400">{q.source?.section}</span></p>
                    <p>Aplicabilidade: <span className="text-slate-400">{q.applicability?.classification}</span></p>
                    <p>Crítica: <span className="text-slate-400">{q.safetyCritical ? "Sim" : "Não"}</span></p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
