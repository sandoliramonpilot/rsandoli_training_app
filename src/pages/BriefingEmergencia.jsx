import React from "react";
import BackToDashboard from "@/components/BackToDashboard";
import AcademyUploadSection from "@/components/academy/AcademyUploadSection";
import AcademyHeroBanner from "@/components/academy/AcademyHeroBanner";
import { ClipboardList, GraduationCap } from "lucide-react";

export default function BriefingEmergencia() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Briefing de Emergência
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">Briefings e procedimentos de emergência para instrução e treinamento.</p>
        </div>
        <BackToDashboard />
      </header>

      <AcademyHeroBanner
        badgeIcon={GraduationCap}
        badgeText="Premium"
        subtitleLabel="Leonardo AW119Kx Koala"
        title="BRIEFING DE EMERGÊNCIA"
        description="Briefings e procedimentos de emergência para instrução e treinamento."
        icon={ClipboardList}
        accent="rose"
      />

      <AcademyUploadSection
        discipline="briefing_emergencia"
        moduleId="treinamentos"
        title="Materiais de briefing de emergência"
        description="Anexe PDFs e apresentações relacionados aos briefings e procedimentos de emergência."
      />
    </div>
  );
}