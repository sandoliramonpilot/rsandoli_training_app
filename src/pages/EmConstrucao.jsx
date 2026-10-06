import React from "react";
import BackToDashboard from "@/components/BackToDashboard";
import { Construction, Sparkles } from "lucide-react";

export default function EmConstrucao({ title, subtitle }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && <p className="text-slate-400 mt-2 text-sm">{subtitle}</p>}
        </div>
        <BackToDashboard />
      </header>

      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#1A1D25] to-[#12141A] px-6 py-16 md:py-24 text-center">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, #C9A867 0 2px, transparent 2px 24px)" }} />
        <div className="relative flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Construction className="w-10 h-10 text-amber-400" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-bold tracking-tight text-amber-300 uppercase">
              Espaço em construção
            </p>
            <p className="text-sm md:text-base text-slate-400 mt-2 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500/70" />
              Em breve mais uma funcionalidade
            </p>
          </div>
          <p className="text-xs text-slate-600 max-w-md mt-2">
            Esta seção fará parte do programa de treinamento contínuo do AW119Kx Koala.
            O conteúdo está em desenvolvimento pela equipe técnica.
          </p>
        </div>
      </div>
    </div>
  );
}