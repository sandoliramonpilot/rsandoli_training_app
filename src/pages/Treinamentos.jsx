import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { can } from "@/lib/accessControl";
import { ACADEMY_DISCIPLINES } from "@/lib/academyData";
import BackToDashboard from "@/components/BackToDashboard";
import AcademyProgress from "@/components/academy/AcademyProgress";
import AcademyApprovalBadge from "@/components/AcademyApprovalBadge";
import DocumentListItem from "@/components/academy/DocumentListItem";
import { useProfile } from "@/lib/ProfileContext";
import { GraduationCap, Crown, Award, BarChart3, Cog, Joystick, Monitor, Gauge, Siren, Upload, FileText, Loader2, X, AlertTriangle } from "lucide-react";

const ICONS = { sistemas: Cog, helipilot: Joystick, idu680: Monitor, limitacoes: Gauge, briefing_emergencia: Siren };

export default function Treinamentos() {
  const { user } = useAuth();
  const { profileFilter, profileValue } = useProfile();
  const [activeDiscipline, setActiveDiscipline] = useState("sistemas");
  const [trainingDocs, setTrainingDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadChapter, setUploadChapter] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");

  const discipline = ACADEMY_DISCIPLINES.find((d) => d.id === activeDiscipline) || ACADEMY_DISCIPLINES[0];
  const canEdit = can(user, "treinamentos", "editar");

  const completedCount = 0;
  const overallProgress = 0;

  const loadDocs = async () => {
    const docs = await base44.entities.TrainingDocument.filter({ ...profileFilter, discipline: "briefing_emergencia", status: "active" }).catch(() => []);
    setTrainingDocs(docs);
  };
  useEffect(() => { loadDocs(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file || !uploadChapter) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "ppsx", "pptx", "doc", "docx"].includes(ext)) {
      alert("Formato não suportado. Use PDF, PPSX, PPTX, DOC ou DOCX.");
      return;
    }
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.TrainingDocument.create({
        title: uploadTitle || file.name.replace(/\.[^/.]+$/, ""),
        discipline: "briefing_emergencia",
        chapter: uploadChapter,
        aircraftProfile: profileValue,
        file_type: ["pdf", "ppsx", "pptx"].includes(ext) ? ext : "other",
        file_uri,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: user?.full_name || user?.email || "",
        approval_status: "pending_review",
      });
      setUploadTitle("");
      setUploadChapter(null);
      await loadDocs();
    } catch (err) {
      alert("Erro ao enviar arquivo: " + (err.message || "tente novamente."));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Academy</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">AW119Kx Academy</h1>
          <p className="text-slate-400 mt-2 text-sm">Instrução teórica e treinamento operacional — disciplinas, sistemas e capacitação contínua.</p>
        </div>
        <BackToDashboard />
      </header>

      {/* Featured banner */}
      <div className="bg-gradient-to-br from-[#1A1D25] to-[#12141A] rounded-2xl border border-amber-500/20 shadow-lg overflow-hidden">
        <div className="p-6 md:p-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5" /> Premium
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Leonardo AW119Kx Koala</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">AW119_Koala Academy</h2>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl">Plataforma de instrução teórica, treinamento operacional e capacitação contínua para pilotos de asas rotativas, com foco no AW119Kx e seus sistemas de aviônicos avançados.</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <GraduationCap className="w-10 h-10 text-slate-900" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label="Progresso médio" value={`${overallProgress}%`} accent="text-amber-400" />
        <StatCard icon={GraduationCap} label="Disciplinas" value={ACADEMY_DISCIPLINES.length} accent="text-teal-400" />
        <StatCard icon={Award} label="Áreas concluídas" value={completedCount} accent="text-emerald-400" />
        <StatCard icon={Cog} label="Sistemas cobertos" value="10+" accent="text-sky-400" />
      </div>

      {/* Progress panel */}
      <AcademyProgress />

      {/* Discipline tabs */}
      <div className="flex flex-wrap gap-2">
        {ACADEMY_DISCIPLINES.map((d) => {
          const Icon = ICONS[d.id] || Cog;
          const active = d.id === activeDiscipline;
          return (
            <button
              key={d.id}
              onClick={() => setActiveDiscipline(d.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                active ? "bg-amber-500 text-slate-900 border-amber-500" : "bg-[#1A1D25] text-slate-300 border-slate-700/60 hover:border-amber-500/40"
              }`}
            >
              <Icon className="w-4 h-4" /> {d.title}
            </button>
          );
        })}
      </div>

      {/* Discipline content */}
      <div>
        <p className="text-slate-400 text-sm mb-4">{discipline.description}</p>

        {discipline.notice && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{discipline.notice}</span>
          </div>
        )}

        <div className="space-y-3">
          {discipline.categories?.map((c) => (
            <CategoryCard key={c.title} title={c.title} items={c.topics} />
          ))}
          {discipline.sections?.map((s) => (
            <SectionCard key={s.title} title={s.title} items={s.items} />
          ))}
          {discipline.chapters?.map((ch) => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              docs={trainingDocs.filter((d) => d.chapter === ch.id)}
              canEdit={canEdit}
              uploading={uploading && uploadChapter === ch.id}
              isUploadOpen={uploadChapter === ch.id}
              uploadTitle={uploadTitle}
              setUploadTitle={setUploadTitle}
              onUploadClick={() => setUploadChapter(ch.id)}
              onCancelUpload={() => setUploadChapter(null)}
              onFileSelect={handleUpload}
              onUpdated={loadDocs}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChapterCard({ chapter, docs, canEdit, uploading, isUploadOpen, uploadTitle, setUploadTitle, onUploadClick, onCancelUpload, onFileSelect, onUpdated }) {
  const fileInputRef = React.useRef(null);
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
      <div className="px-5 py-3.5 bg-[#12141A] border-b border-slate-700/60">
        <h3 className="font-semibold text-sm text-slate-100">{chapter.title}</h3>
      </div>
      <div className="px-5 py-4 space-y-3">
        <ul className="space-y-2">
          {chapter.items.map((t, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" /> {t}
            </li>
          ))}
        </ul>

        {docs.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-700/40">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium pt-2">Documentos anexados</p>
            {docs.map((d) => (
              <DocumentListItem key={d.id} doc={d} canEdit={canEdit} onUpdated={onUpdated} />
            ))}
          </div>
        )}

        {canEdit && (
          <div className="pt-2 border-t border-slate-700/40">
            {uploading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Enviando arquivo…
              </div>
            ) : isUploadOpen ? (
              <div className="space-y-2 py-1">
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Título do documento (opcional)"
                  className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500"
                />
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept=".pdf,.ppsx,.pptx,.doc,.docx" onChange={onFileSelect} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-900 text-xs font-medium hover:bg-amber-400 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Selecionar arquivo
                  </button>
                  <button onClick={onCancelUpload} className="text-xs text-slate-500 hover:text-slate-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onUploadClick}
                className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-amber-400 transition-colors py-1"
              >
                <Upload className="w-3.5 h-3.5" /> Anexar documento (.pdf, .ppsx, .doc, .docx)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryCard({ title, items }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden hover:border-amber-500/30 transition-colors">
      <div className="px-5 py-3.5 bg-[#12141A] border-b border-slate-700/60 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-slate-100">{title}</h3>
      </div>
      <div className="px-5 py-4 flex flex-wrap gap-2">
        {items.map((t, i) => (
          <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/30 text-slate-300 border border-slate-700/40">{t}</span>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ title, items }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden hover:border-amber-500/30 transition-colors">
      <div className="px-5 py-3.5 bg-[#12141A] border-b border-slate-700/60">
        <h3 className="font-semibold text-sm text-slate-100">{title}</h3>
      </div>
      <div className="px-5 py-4">
        <ul className="space-y-2">
          {items.map((t, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" /> {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
      <Icon className="w-5 h-5 text-slate-400 mb-2" />
      <p className={`text-2xl font-bold tracking-tight ${accent}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}