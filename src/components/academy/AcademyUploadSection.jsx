import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { can } from "@/lib/accessControl";
import DocumentListItem from "@/components/academy/DocumentListItem";
import { DIDATIC_NOTICE } from "@/lib/trainingData";
import { Upload, Loader2, X, ShieldAlert, Inbox } from "lucide-react";
import { useProfile } from "@/lib/ProfileContext";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "heic", "gif", "webp"];
const VIDEO_EXTS = ["mp4", "mov", "avi", "mkv", "webm", "wmv"];

const MEDIA_MODES = {
  document: {
    accept: ".pdf,.ppsx,.pptx,.doc,.docx",
    extensions: ["pdf", "ppsx", "pptx", "doc", "docx"],
    selectLabel: "Selecionar arquivo(s)",
    linkLabel: "Anexar documento (.pdf, .ppsx, .doc, .docx)",
    invalidMsg: "Formato não suportado. Use PDF, PPSX, PPTX, DOC ou DOCX.",
    emptyLabel: "Nenhum documento anexado ainda.",
    listLabel: "Documentos anexados",
  },
  image: {
    accept: ".jpg,.jpeg,.png,.heic,.gif,.pdf,.ppsx",
    extensions: ["jpg", "jpeg", "png", "heic", "gif", "pdf", "ppsx"],
    selectLabel: "Selecionar imagem/PDF",
    linkLabel: "Anexar imagem ou PDF (.jpg, .png, .heic, .gif, .pdf, .ppsx)",
    invalidMsg: "Formato não suportado. Use JPG, PNG, HEIC, GIF, PDF ou PPSX.",
    emptyLabel: "Nenhuma imagem anexada ainda.",
    listLabel: "Imagens e documentos",
  },
  video: {
    accept: ".mp4,.mov,.avi,.mkv,.webm,.wmv",
    extensions: ["mp4", "mov", "avi", "mkv", "webm", "wmv"],
    selectLabel: "Selecionar vídeo(s)",
    linkLabel: "Anexar vídeo (.mp4, .mov, .avi, .mkv, .webm, .wmv)",
    invalidMsg: "Formato não suportado. Use MP4, MOV, AVI, MKV, WEBM ou WMV.",
    emptyLabel: "Nenhum vídeo anexado ainda.",
    listLabel: "Vídeos",
  },
};

const mapFileType = (ext) => {
  if (ext === "pdf") return "pdf";
  if (ext === "ppsx") return "ppsx";
  if (ext === "pptx") return "pptx";
  if (IMAGE_EXTS.includes(ext)) return "image";
  if (VIDEO_EXTS.includes(ext)) return "video";
  return "other";
};

export default function AcademyUploadSection({
  discipline,
  chapter,
  title,
  description,
  moduleId,
  mediaMode = "document",
  hideNotice = false,
}) {
  const { user } = useAuth();
  const { profileFilter, profileValue } = useProfile();
  const canEdit = can(user, moduleId || "treinamentos", "editar");
  const mode = MEDIA_MODES[mediaMode] || MEDIA_MODES.document;
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [progress, setProgress] = useState("");
  const fileInputRef = useRef(null);

  const chapterKey = chapter || discipline;

  const loadDocs = async () => {
    const result = await base44.entities.TrainingDocument
      .filter({ ...profileFilter, discipline, chapter: chapterKey, status: "active" })
      .catch(() => []);
    setDocs(result);
  };

  useEffect(() => { loadDocs(); }, [profileFilter]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const invalid = files.find(
      (f) => !mode.extensions.includes(f.name.split(".").pop()?.toLowerCase())
    );
    if (invalid) {
      alert(mode.invalidMsg);
      return;
    }
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(`Enviando ${i + 1} de ${files.length}…`);
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        const baseName = uploadTitle || file.name.replace(/\.[^/.]+$/, "");
        await base44.entities.TrainingDocument.create({
          title: files.length > 1 ? `${baseName} (${i + 1})` : baseName,
          discipline,
          chapter: chapterKey,
          aircraftProfile: profileValue,
          file_type: mapFileType(file.name.split(".").pop().toLowerCase()),
          file_uri,
          file_name: file.name,
          file_size: file.size,
          uploaded_by: user?.full_name || user?.email || "",
          approval_status: "pending_review",
        });
      }
      setUploadTitle("");
      setIsUploadOpen(false);
      await loadDocs();
    } catch (err) {
      alert("Erro ao enviar arquivo: " + (err.message || "tente novamente."));
    } finally {
      setUploading(false);
      setProgress("");
      e.target.value = "";
    }
  };

  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
      {title && (
        <div className="px-5 py-3.5 bg-[#12141A] border-b border-slate-700/60">
          <h3 className="font-semibold text-sm text-slate-100">{title}</h3>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}

      <div className="px-5 py-4 space-y-4">
        {/* Didactic notice (light, dark text) */}
        {!hideNotice && (
          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-slate-800 text-xs flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
            <span>{DIDATIC_NOTICE}</span>
          </div>
        )}

        {/* Documents */}
        {docs.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">{mode.listLabel}</p>
            {docs.map((d) => (
              <DocumentListItem key={d.id} doc={d} canEdit={canEdit} onUpdated={loadDocs} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Inbox className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-600">{mode.emptyLabel}</p>
          </div>
        )}

        {/* Upload (admin) — multiple files */}
        {canEdit && (
          <div className="pt-2 border-t border-slate-700/40">
            {uploading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> {progress || "Enviando arquivo…"}
              </div>
            ) : isUploadOpen ? (
              <div className="space-y-2 py-1">
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Título (opcional)"
                  className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500"
                />
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept={mode.accept} multiple onChange={handleUpload} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-900 text-xs font-medium hover:bg-amber-400 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> {mode.selectLabel}
                  </button>
                  <button onClick={() => setIsUploadOpen(false)} className="text-xs text-slate-500 hover:text-slate-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-amber-400 transition-colors py-1"
              >
                <Upload className="w-3.5 h-3.5" /> {mode.linkLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}