import React from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";

// Cartão de procedimento transcrito do Checklist de Bolso H125.
// Exibe nome, condição/sintomas, passos e notas, com destaque visual para
// itens críticos (POUSAR IMEDIATAMENTE / ASSIM QUE POSSÍVEL).
export default function ProcedureCard({ proc }) {
  const passos = (proc.p || "").split(" | ").map((s) => s.trim()).filter(Boolean);
  const notas = (proc.nt || "").split(" | ").map((s) => s.trim()).filter(Boolean);
  const pendente = passos.length === 1 && /pendente de transcrição/i.test(passos[0]);

  const isCritical = (txt) =>
    /POUSAR IMEDIATAMENTE|POUSAR ASSIM QUE POSSÍVEL|SAIR DA AERONAVE/i.test(txt);

  return (
    <div className="rounded-xl border border-slate-700/60 bg-[#1A1D25] overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/60 bg-[#12141A]">
        <h4 className="text-sm font-semibold text-amber-300 tracking-tight">{proc.n}</h4>
        {proc.c && (
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">{proc.c}</p>
        )}
      </div>

      {pendente ? (
        <div className="px-4 py-3 flex items-start gap-2 text-xs text-slate-500">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500/70 shrink-0 mt-0.5" />
          <span>{passos[0]}</span>
        </div>
      ) : (
        <ol className="px-4 py-3 space-y-1.5">
          {passos.map((passo, i) => {
            const numbered = /^\d+/.test(passo) || /^[A-ZÀ-Ú]\s—/.test(passo);
            const critical = isCritical(passo);
            return (
              <li
                key={i}
                className={`flex items-start gap-2 text-sm leading-relaxed ${
                  critical ? "text-rose-300 font-medium" : "text-slate-200"
                }`}
              >
                {numbered ? (
                  <ChevronRight className="w-3.5 h-3.5 text-amber-500/70 shrink-0 mt-1" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 mt-2" />
                )}
                <span>{passo}</span>
              </li>
            );
          })}
        </ol>
      )}

      {notas.length > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-700/60 bg-slate-900/40">
          {notas.map((nota, i) => (
            <p key={i} className="text-xs text-slate-400 leading-relaxed flex items-start gap-1.5">
              <span className="text-amber-500/70 font-semibold shrink-0">NOTA:</span>
              <span>{nota}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}