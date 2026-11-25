import React, { useState } from "react";
import { Monitor, ChevronRight, BookOpen, FileText, ArrowLeft, Plane } from "lucide-react";
import BackToDashboard from "@/components/BackToDashboard";
import AcademyUploadSection from "@/components/academy/AcademyUploadSection";
import { useProfile } from "@/lib/ProfileContext";
import { AW119_AVIONICS_SECTIONS } from "@/lib/aw119AvionicsData";
import SemAcessoAoModulo from "@/components/SemAcessoAoModulo";

export default function AcademyAvionicos() {
  const { profileValue } = useProfile();
  const [activeSectionId, setActiveSectionId] = useState(null);

  if (profileValue !== "AW119") {
    return <SemAcessoAoModulo />;
  }

  const activeSection = activeSectionId
    ? AW119_AVIONICS_SECTIONS.find((s) => s.id === activeSectionId)
    : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Aviônicos
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            Sistema EFIS Genesys IDU-680 e Garmin G1000H Integrated Flight Deck do AW119Kx.
          </p>
        </div>
        <BackToDashboard />
      </header>

      {!activeSection ? (
        <SectionGrid onSelect={setActiveSectionId} />
      ) : (
        <SectionDetail section={activeSection} onBack={() => setActiveSectionId(null)} />
      )}
    </div>
  );
}

function SectionGrid({ onSelect }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {AW119_AVIONICS_SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onSelect(section.id)}
          className="group text-left bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden hover:border-amber-500/40 transition-all"
        >
          <div className={`h-2 w-full bg-gradient-to-r ${section.color}`} />
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}>
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{section.name}</h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">{section.description}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {section.chapters.length} capítulos
              </span>
              <span className="text-[11px] text-slate-600">{section.sourceDoc}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function SectionDetail({ section, onBack }) {
  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-slate-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar às seções
      </button>

      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
        <div className={`h-1.5 w-full bg-gradient-to-r ${section.color}`} />
        <div className="px-6 py-5 flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg shrink-0`}>
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white">{section.name}</h2>
            <p className="text-sm text-slate-400 mt-1">{section.description}</p>
            <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {section.chapters.length} capítulos · {section.sourceDoc}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {section.chapters
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((chapter) => (
            <ChapterCard
              key={chapter.id}
              section={section}
              chapter={chapter}
            />
          ))}
      </div>
    </div>
  );
}

function ChapterCard({ section, chapter }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
          {String(chapter.order).padStart(2, "0")}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-100">{chapter.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{chapter.description}</p>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-700/40">
          <AcademyUploadSection
            discipline={section.id}
            chapter={chapter.id}
            moduleId="aw119_training"
            title={`Materiais — ${chapter.title}`}
            description={`Capítulo ${chapter.order} · ${section.shortName}`}
            hideNotice
          />
        </div>
      )}
    </div>
  );
}