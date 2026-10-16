import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { can } from "@/lib/accessControl";
import { PROC_EMERGENCIA, DIDATIC_NOTICE, PENDING_CONTENT, SOURCE_PDF_URL } from "@/lib/procedimentosEmergenciaData";
import BackToDashboard from "@/components/BackToDashboard";
import AcademyApprovalBadge from "@/components/AcademyApprovalBadge";
import {
  Siren, Flame, Zap, Fuel, Monitor, AlertTriangle, Wind, Cog, Gauge,
  ChevronRight, ChevronDown, FileText, Upload, Loader2, X, BookOpen, Layers,
  ExternalLink, ImageIcon, ShieldAlert, GraduationCap,
} from "lucide-react";

const MODULE_ICONS = { Flame, Zap, Fuel, Monitor, AlertTriangle, Wind, Cog, Siren, Gauge };

export default function ProcedimentosEmergencia() {
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState(PROC_EMERGENCIA.modules[0].id);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [trainingDocs, setTrainingDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadChapter, setUploadChapter] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");

  const canEdit = can(user, "treinamentos", "editar");
  const mod = PROC_EMERGENCIA.modules.find((m) => m.id === activeModule) || PROC_EMERGENCIA.modules[0];

  useEffect(() => {
    base44.entities.TrainingDocument.filter({ discipline: "proc_emergencia", status: "active" })
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
        discipline: "proc_emergencia",
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
      const docs = await base44.entities.TrainingDocument.filter({ discipline: "proc_emergencia", status: "active" }).catch(() => []);
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Procedimentos de Emergência
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">{PROC_EMERGENCIA.subtitle}</p>
        </div>
        <BackToDashboard />
      </header>

      {/* Premium banner */}
      <div className="bg-gradient-to-br from-[#1A1D25] to-[#12141A] rounded-2xl border border-amber-500/20 shadow-lg overflow-hidden">
        <div className="p-6 md:p-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <GraduationCap className="w-3.5 h-3.5" /> Premium
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Leonardo AW119Kx Koala</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">PROCEDIMENTOS DE EMERGÊNCIA</h2>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl">{DIDATIC_NOTICE}</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
            <Siren className="w-10 h-10 text-slate-900" />
          </div>
        </div>
      </div>

      {/* Didactic notice + source PDF */}
      <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          <strong>Aviso didático:</strong> {DIDATIC_NOTICE}
        </span>
      </div>

      <a
        href={SOURCE_PDF_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1A1D25] border border-slate-700/60 hover:border-amber-500/40 transition-colors group"
      >
        <FileText className="w-5 h-5 text-amber-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-200">Material original (PDF)</p>
          <p className="text-xs text-slate-500">Apresentação completa de Procedimentos de Emergência — slides originais com imagens e diagramas</p>
        </div>
        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0" />
      </a>

      {/* Module tabs */}
      <div className="flex flex-wrap gap-2">
        {PROC_EMERGENCIA.modules.map((m) => {
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
            </div>
          </div>
        </div>

        {/* Modules with chapters (MAU FUNCIONAMENTO) */}
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

        {/* Modules with direct content */}
        {!mod.chapters && mod.content && (
          <ContentCard
            module={mod}
            docs={trainingDocs.filter((d) => d.chapter === mod.id)}
            canEdit={canEdit}
            uploading={uploading && uploadChapter === mod.id}
            isUploadOpen={uploadChapter === mod.id}
            uploadTitle={uploadTitle}
            setUploadTitle={setUploadTitle}
            onUploadClick={() => setUploadChapter(mod.id)}
            onCancelUpload={() => setUploadChapter(null)}
            onFileSelect={handleUpload}
          />
        )}
      </div>
    </div>
  );
}

function ContentCard({ module, docs, canEdit, uploading, isUploadOpen, uploadTitle, setUploadTitle, onUploadClick, onCancelUpload, onFileSelect }) {
  const fileInputRef = React.useRef(null);
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
      <div className="px-5 py-4 space-y-4">
        {/* Content text */}
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Conteúdo</p>
          <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{module.content}</div>
        </div>

        {/* Key points */}
        {module.keyPoints?.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Pontos-chave</p>
            <ul className="space-y-2">
              {module.keyPoints.map((k, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" /> {k}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Indications */}
        {module.indications?.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Indicações e alertas</p>
            <div className="flex flex-wrap gap-2">
              {module.indications.map((ind, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 font-mono">
                  {ind}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Image references */}
        {module.imageDescriptions?.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Imagens e diagramas (material original)
            </p>
            <ul className="space-y-1.5">
              {module.imageDescriptions.map((img, i) => (
                <li key={i} className="text-xs text-slate-500 flex items-start gap-2 italic">
                  <ImageIcon className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" /> {img}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pending content notice */}
        <div className="px-3 py-2 rounded-lg bg-slate-700/20 border border-slate-700/30 text-slate-500 text-xs italic">
          {PENDING_CONTENT}
        </div>

        {/* Attached documents */}
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

        {/* Upload (admin) */}
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
          <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
          <h3 className="font-semibold text-sm text-slate-100">{chapter.title}</h3>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="px-5 py-4 space-y-4">
          {/* Content text */}
          {chapter.content && (
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Conteúdo</p>
              <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{chapter.content}</div>
            </div>
          )}

          {/* Key points */}
          {chapter.keyPoints?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Pontos-chave</p>
              <ul className="space-y-2">
                {chapter.keyPoints.map((k, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" /> {k}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Indications */}
          {chapter.indications?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">Indicações e alertas</p>
              <div className="flex flex-wrap gap-2">
                {chapter.indications.map((ind, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 font-mono">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Image references */}
          {chapter.imageDescriptions?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Imagens e diagramas (material original)
              </p>
              <ul className="space-y-1.5">
                {chapter.imageDescriptions.map((img, i) => (
                  <li key={i} className="text-xs text-slate-500 flex items-start gap-2 italic">
                    <ImageIcon className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" /> {img}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pending content notice */}
          <div className="px-3 py-2 rounded-lg bg-slate-700/20 border border-slate-700/30 text-slate-500 text-xs italic">
            {PENDING_CONTENT}
          </div>

          {/* Attached documents */}
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

          {/* Upload (admin) */}
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