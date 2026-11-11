import React from "react";
import BackToDashboard from "@/components/BackToDashboard";
import AcademyUploadSection from "@/components/academy/AcademyUploadSection";
import AcademyHeroBanner from "@/components/academy/AcademyHeroBanner";
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

      <AcademyHeroBanner
        badgeIcon={GraduationCap}
        badgeText="Premium"
        subtitleLabel="Leonardo AW119Kx Koala"
        title="TREINAMENTO RECORRENTE"
        description="Programa de proficiência e reciclagem periódica para pilotos do AW119Kx."
        icon={RefreshCw}
        accent="amber"
      />

      <AcademyUploadSection
        discipline="treinamento_recorrente"
        moduleId="treinamentos"
        title="Materiais de treinamento recorrente"
        description="Anexe PDFs e apresentações relacionados ao programa de reciclagem periódica."
      />
    </div>
  );
}