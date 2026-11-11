import React, { useState } from "react";
import BackToDashboard from "@/components/BackToDashboard";
import AcademyUploadSection from "@/components/academy/AcademyUploadSection";
import AcademyHeroBanner from "@/components/academy/AcademyHeroBanner";
import { ImageIcon, Video, GraduationCap, Clapperboard } from "lucide-react";

const SUBMODULES = [
  {
    id: "imagens_tecnicas",
    title: "IMAGENS TÉCNICAS",
    icon: ImageIcon,
    mediaMode: "image",
    description: "Diagramas, fotografias e ilustrações técnicas dos sistemas do AW119Kx.",
  },
  {
    id: "videos_instrucionais",
    title: "VÍDEOS INSTRUCIONAIS",
    icon: Video,
    mediaMode: "video",
    description: "Vídeos de treinamento, animações e materiais audiovisuais de instrução.",
  },
  {
    id: "fotos",
    title: "FOTOS",
    icon: ImageIcon,
    mediaMode: "image",
    description: "Fotografias operacionais, de aeronaves e de campo para apoio ao treinamento.",
  },
];

export default function RecursosAudiovisuais() {
  const [activeSub, setActiveSub] = useState(SUBMODULES[0].id);
  const sub = SUBMODULES.find((s) => s.id === activeSub) || SUBMODULES[0];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Recursos Audiovisuais
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">Imagens técnicas e vídeos instrucionais para apoio ao treinamento do AW119Kx.</p>
        </div>
        <BackToDashboard />
      </header>

      <AcademyHeroBanner
        badgeIcon={GraduationCap}
        badgeText="Premium"
        subtitleLabel="Leonardo AW119Kx Koala"
        title="RECURSOS AUDIOVISUAIS"
        description="Mídia, diagramas, imagens técnicas e vídeos instrucionais de apoio ao treinamento."
        icon={Clapperboard}
        accent="sky"
      />

      {/* Sub-module tabs */}
      <div className="flex flex-wrap gap-2">
        {SUBMODULES.map((s) => {
          const Icon = s.icon;
          const active = s.id === activeSub;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSub(s.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                active ? "bg-amber-500 text-slate-900 border-amber-500" : "bg-[#1A1D25] text-slate-300 border-slate-700/60 hover:border-amber-500/40"
              }`}
            >
              <Icon className="w-4 h-4" /> {s.title}
            </button>
          );
        })}
      </div>

      <AcademyUploadSection
        discipline="recursos_audiovisuais"
        chapter={sub.id}
        moduleId="treinamentos"
        mediaMode={sub.mediaMode}
        title={sub.title}
        description={sub.description}
      />
    </div>
  );
}