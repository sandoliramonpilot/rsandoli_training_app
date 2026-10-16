import React from "react";
import BackToDashboard from "@/components/BackToDashboard";
import AcademyUploadSection from "@/components/academy/AcademyUploadSection";
import { RefreshCw, GraduationCap } from "lucide-react";

export default function TreinamentoRecorrente() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Treinamento Recorrente
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">Programa de proficiência e reciclagem periódica do AW119Kx.</p>
        </div>
        <BackToDashboard />
      </header>

      <div className="bg-gradient-to-br from-[#1A1D25] to-[#12141A] rounded-2xl border border-amber-500/20 shadow-lg overflow-hidden">
        <div className="p-6 md:p-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <GraduationCap className="w-3.5 h-3.5" /> Premium
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Leonardo AW119Kx Koala</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">TREINAMENTO RECORRENTE</h2>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl">Programa de proficiência e reciclagem periódica para pilotos do AW119Kx.</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <RefreshCw className="w-10 h-10 text-slate-900" />
          </div>
        </div>
      </div>

      <AcademyUploadSection
        discipline="treinamento_recorrente"
        moduleId="treinamentos"
        title="Materiais de treinamento recorrente"
        description="Anexe PDFs e apresentações relacionados ao programa de reciclagem periódica."
      />
    </div>
  );
}