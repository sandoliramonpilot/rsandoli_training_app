import React from "react";
import BackToDashboard from "@/components/BackToDashboard";
import AcademyUploadSection from "@/components/academy/AcademyUploadSection";
import AcademyHeroBanner from "@/components/academy/AcademyHeroBanner";
import { ClipboardList, Siren, Quote } from "lucide-react";

const APRESENTACAO_PARAGRAFOS = [
  "A segurança não começa na decolagem. Ela começa na preparação. Este briefing foi desenvolvido para fortalecer a capacidade do piloto de reconhecer, compreender e responder corretamente às situações anormais e de emergência que podem surgir durante o voo. Mais do que memorizar procedimentos, o objetivo é construir confiança, disciplina operacional e consciência situacional para agir com precisão quando cada segundo importa. Cada alerta estudado, cada cenário discutido e cada procedimento praticado representam um investimento direto na segurança da missão e na proteção da tripulação e dos passageiros. O treinamento contínuo transforma conhecimento em habilidade e habilidade em reação adequada. Quando a situação exigir uma resposta imediata, não haverá tempo para aprender, apenas para executar.",
];

const FRASE_FINAL = "Em uma emergência real, o conhecimento orienta, o treinamento guia nossas ações e o desempenho determina o resultado. Mas é o treinamento que conduz nossas ações, permitindo uma atuação natural, precisa e assertiva, capaz de preservar o controle da aeronave e manter os níveis adequados de segurança operacional. O resultado é o reflexo daquilo que treinamos, aprendemos e praticamos.";


export default function BriefingEmergencia() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Briefing de Emergência
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            Briefings dos procedimentos de emergência para instrução e treinamento.
          </p>
        </div>
        <BackToDashboard />
      </header>

      <AcademyHeroBanner
        badgeIcon={Siren}
        badgeText="Instrução Teórica"
        subtitleLabel="Emergências no AW119Kx/KXi Koala"
        title="BRIEFING DE EMERGÊNCIA"
        description="SÓ FAZEMOS AQUILO QUE TREINAMOS."
        icon={ClipboardList}
        accent="rose"
      />

      {/* Apresentação */}
      <section className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 bg-gradient-to-r from-rose-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-rose-500/30 bg-rose-500/15 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-rose-300" />
            </div>
            <h2 className="text-base font-bold tracking-wide text-white uppercase">
              Apresentação
            </h2>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          {APRESENTACAO_PARAGRAFOS.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-300">
              {p}
            </p>
          ))}

          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 mt-2">
            <Quote className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm md:text-base font-semibold leading-relaxed text-amber-200">
              🚁 {FRASE_FINAL}
            </p>
          </div>
        </div>
      </section>

      <AcademyUploadSection
        discipline="briefing_emergencia"
        moduleId="treinamentos"
        title="Materiais de briefing de emergência"
        description="Anexe PDFs e apresentações relacionados aos briefings e procedimentos de emergência."
      />
    </div>
  );
}