import React, { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, UserRound } from "lucide-react";
import { fmtData, isDirecionado, parseAnexos } from "@/lib/avisoUtils";
import AnexoButton from "@/components/avisos/AnexoButton";

// Cartão de destaque do Painel do Piloto: avisos direcionados e/ou importantes.
export default function AvisoDestaqueCard({ aviso }) {
  const [aberto, setAberto] = useState(false);
  const direcionado = isDirecionado(aviso);
  const anexos = parseAnexos(aviso);
  const Icon = direcionado ? UserRound : AlertTriangle;

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        direcionado
          ? "border-sky-500/40 bg-sky-500/10"
          : "border-amber-500/40 bg-amber-500/10"
      }`}
    >
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left"
      >
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
            direcionado
              ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
              : "bg-amber-500/20 text-amber-200 border-amber-500/40"
          }`}
        >
          <Icon className="w-3 h-3" /> {direcionado ? "Para você" : "Importante"}
        </span>
        <span className="text-sm font-semibold text-slate-100 flex-1 truncate">
          {aviso.titulo}
        </span>
        {aberto ? (
          <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
        )}
      </button>

      {aberto && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-slate-200 whitespace-pre-line">{aviso.texto}</p>
          <p className="text-[11px] text-slate-400">
            {fmtData(aviso.data_publicacao)}
            {aviso.autor ? ` · ${aviso.autor}` : ""}
          </p>
          {anexos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {anexos.map((f, i) => (
                <AnexoButton key={`${f.name}-${i}`} anexo={f} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}