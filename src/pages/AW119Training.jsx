import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { can } from "@/lib/accessControl";
import { AW119_TRAINING, PENDING_CONTENT, DIDATIC_NOTICE } from "@/lib/aw119TrainingData";
import BackToDashboard from "@/components/BackToDashboard";
import AcademyApprovalBadge from "@/components/AcademyApprovalBadge";
import {
  GraduationCap, Crown, Monitor, Plane, Settings, ChevronRight, ChevronDown,
  FileText, Upload, Loader2, X, AlertTriangle, ShieldAlert, BookOpen, Layers,
} from "lucide-react";

const MODULE_ICONS = { Monitor, Plane, Settings };

export default function AW119Training() {
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState(AW119_TRAINING.modules[0].id);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [trainingDocs, setTrainingDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadChapter, setUploadChapter] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");

  const canEdit = can(user, "treinamentos", "editar");
  const mod = AW119_TRAINING.modules.find((m) => m.id === activeModule) || AW119_TRAINING.modules[0];

  useEffect(() => {
    base44.entities.TrainingDocument.filter({ discipline: "aw119_training", status: "active" })
      .then(setTrainingDocs)
      .catch(() => setTrainingDocs([]));
  }, []);

  const toggleChapter = (id) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file || !uploadChapter) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "ppsx", "pptx"].includes(ext)) {
      alert("Formato não suportado. Use PDF, PPSX ou PPTX.");
      return;
    }
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.TrainingDocument.create({
        title: uploadTitle || file.name.replace(/\.[^/.]+$/, ""),
        discipline: "aw119_training",
        chapter: uploadChapter,
        file_type: ext === "pdf" ? "pdf" : ext === "ppsx" ? "ppsx" : "pptx",
        file_uri,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: user?.full_name || user?.email || "",
        approval_status: "pending_review",
      });
      setUploadTitle("");
      setUploadChapter(null);
      const docs = await base44.entities.TrainingDocument.filter({ discipline: "aw119_training", status: "active" }).catch(() => []);
      setTrainingDocs(docs);
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">AW119 TRAINING</h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">{AW119_TRAINING.subtitle}</p>
        </div>
        <BackToDashboard />
      </header>

      {/* Premium banner */}
      <div className="bg-gradient-to-br from-[#1A1D25] to-[#12141A] rounded-2xl border border-amber-500/20 shadow-lg overflow-hidden">
        <div className="p-6 md:p-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5" /> Premium
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Leonardo AW119Kx Koala</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">AW119 TRAINING</h2>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl">{DIDATIC_NOTICE}</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <GraduationCap className="w-10 h-10 text-slate-900" />
          </div>
        </div>
      </div>

      {/* Module tabs */}
      <div className="flex flex-wrap gap-2">
        {AW119_TRAINING.modules.map((m) => {
          const Icon = MODULE_ICONS[m.icon] || BookOpen;
          const active = m.id === activeModule;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                active ? "bg-amber-500 text-slate-900 border-amber-500" : "bg-[#1A1D25] text-slate-300 border-slate-700/60 hover:border-amber-500/40"
              }`}
            >
              <Icon className="w-4 h-4" /> {m.title}
            </button>
          );
        })}
      </div>

      {/* Module content */}
      <div className="space-y-4">
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
          <div className="flex items-start gap-3">
            <Layers className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-100">{mod.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{mod.objective}</p>
              {mod.levels && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {mod.levels.map((l) => (
                    <span key={l} className="text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">{l}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {mod.note && (
          <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{mod.note}</span>
          </div>
        )}

        {/* Chapters */}
        {mod.chapters?.map((ch) => {
          const isOpen = expandedChapters.has(ch.id);
          const docs = trainingDocs.filter((d) => d.chapter === ch.id);
          return (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              isOpen={isOpen}
              onToggle={() => toggleChapter(ch.id)}
              docs={docs}
              canEdit={canEdit}
              uploading={uploading && uploadChapter === ch.id}
              isUploadOpen={uploadChapter === ch.id}
              uploadTitle={uploadTitle}
              setUploadTitle={setUploadTitle}
              onUploadClick={() => setUploadChapter(ch.id)}
              onCancelUpload={() => setUploadChapter(null)}
              onFileSelect={handleUpload}
            />
          );
        })}

        {/* Items (for modules without chapters) */}
        {mod.items && !mod.chapters && (
          <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
            <ul className="space-y-2">
              {mod.items.map((t, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ChapterCard({ chapter, isOpen, onToggle, docs, canEdit, uploading, isUploadOpen, uploadTitle, setUploadTitle, onUploadClick, onCancelUpload, onFileSelect }) {
  const fileInputRef = React.useRef(null);
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-[#12141A] border-b border-slate-700/60 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5 text-left">
          {chapter.isHelipilotArea ? <ShieldAlert className="w-4 h-4 text-teal-400 shrink-0" /> : <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />}
          <h3 className="font-semibold text-sm text-slate-100">{chapter.title}</h3>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="px-5 py-4 space-y-3">
          {chapter.objective && (
            <p className="text-xs text-slate-500 italic">{chapter.objective}</p>
          )}

          {chapter.isHelipilotArea ? (
            <HelipilotContent chapter={chapter} />
          ) : (
            <ul className="space-y-2">
              {chapter.items.map((t, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" /> {t}
                </li>
              ))}
            </ul>
          )}

          {chapter.note && (
            <div className="px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-300/80 text-xs">
              {chapter.note}
            </div>
          )}

          <div className="px-3 py-2 rounded-lg bg-slate-700/20 border border-slate-700/30 text-slate-500 text-xs italic">
            {PENDING_CONTENT}
          </div>

          {docs.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-700/40">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium pt-2">Documentos anexados</p>
              {docs.map((d) => (
                <a
                  key={d.id}
                  href="#"
                  onClick={async (e) => {
                    e.preventDefault();
                    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: d.file_uri });
                    window.open(signed_url, "_blank");
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-700/30 border border-slate-700/40 hover:border-amber-500/40 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-slate-300 truncate block">{d.title}</span>
                    <AcademyApprovalBadge status={d.approval_status} size="xs" />
                  </div>
                  <span className="text-xs text-slate-500 ml-auto uppercase shrink-0">{d.file_type}</span>
                </a>
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
                    <input ref={fileInputRef} type="file" accept=".pdf,.ppsx,.pptx" onChange={onFileSelect} className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-900 text-xs font-medium hover:bg-amber-400 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Selecionar PDF/PPSX
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
                  <Upload className="w-3.5 h-3.5" /> Anexar documento (.pdf, .ppsx)
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HelipilotContent({ chapter }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Conteúdo</p>
        <div className="flex flex-wrap gap-2">
          {chapter.items.map((t, i) => (
            <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/30 text-slate-300 border border-slate-700/40">{t}</span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Modos a organizar</p>
        <div className="flex flex-wrap gap-2">
          {chapter.modes.map((m) => (
            <span key={m} className="text-xs px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30 font-mono">{m}</span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
          Para cada modo, apresentar:
        </p>
        <ol className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
          {chapter.modeFields.map((f, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
              <span className="text-xs text-amber-400 font-mono shrink-0 mt-0.5">{i + 1}.</span> {f}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}