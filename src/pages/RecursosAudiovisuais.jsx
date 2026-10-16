import React, { useState } from "react";
import BackToDashboard from "@/components/BackToDashboard";
import AcademyUploadSection from "@/components/academy/AcademyUploadSection";
import { ImageIcon, Video, GraduationCap, Clapperboard } from "lucide-react";

const SUBMODULES = [
  {
    id: "imagens_tecnicas",
    title: "IMAGENS TÉCNICAS",
    icon: ImageIcon,
    description: "Diagramas, fotografias e ilustrações técnicas dos sistemas do AW119Kx.",
  },
  {
    id: "videos_instrucionais",
    title: "VÍDEOS INSTRUCIONAIS",
    icon: Video,
    description: "Vídeos de treinamento, animações e materiais audiovisuais de instrução.",
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

      <div className="bg-gradient-to-br from-[#1A1D25] to-[#12141A] rounded-2xl border border-amber-500/20 shadow-lg overflow-hidden">
        <div className="p-6 md:p-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <GraduationCap className="w-3.5 h-3.5" /> Premium
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Leonardo AW119Kx Koala</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">RECURSOS AUDIOVISUAIS</h2>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl">Mídia, diagramas, imagens técnicas e vídeos instrucionais de apoio ao treinamento.</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
            <Clapperboard className="w-10 h-10 text-slate-900" />
          </div>
        </div>
      </div>

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
        title={sub.title}
        description={sub.description}
      />
    </div>
  );
}