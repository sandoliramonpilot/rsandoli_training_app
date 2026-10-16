import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { can } from "@/lib/accessControl";
import AcademyApprovalBadge from "@/components/AcademyApprovalBadge";
import { DIDATIC_NOTICE } from "@/lib/aw119TrainingData";
import { FileText, Upload, Loader2, X, ShieldAlert, Inbox } from "lucide-react";

export default function AcademyUploadSection({ discipline, chapter, title, description, moduleId }) {
  const { user } = useAuth();
  const canEdit = can(user, moduleId || "treinamentos", "editar");
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const fileInputRef = useRef(null);

  const chapterKey = chapter || discipline;

  const loadDocs = async () => {
    const result = await base44.entities.TrainingDocument
      .filter({ discipline, chapter: chapterKey, status: "active" })
      .catch(() => []);
    setDocs(result);
  };

  useEffect(() => { loadDocs(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;
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
        discipline,
        chapter: chapterKey,
        file_type: ext === "pdf" ? "pdf" : ext === "ppsx" ? "ppsx" : "pptx",
        file_uri,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: user?.full_name || user?.email || "",
        approval_status: "pending_review",
      });
      setUploadTitle("");
      setIsUploadOpen(false);
      await loadDocs();
    } catch (err) {
      alert("Erro ao enviar arquivo: " + (err.message || "tente novamente."));
    } finally {
      setUploading(false);
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
        {/* Didactic notice */}
        <div className="px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-300/80 text-xs flex items-start gap-2">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{DIDATIC_NOTICE}</span>
        </div>

        {/* Documents */}
        {docs.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Documentos anexados</p>
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
        ) : (
          <div className="text-center py-6">
            <Inbox className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Nenhum documento anexado ainda.</p>
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
                  <input ref={fileInputRef} type="file" accept=".pdf,.ppsx,.pptx" onChange={handleUpload} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-900 text-xs font-medium hover:bg-amber-400 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Selecionar PDF/PPSX
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
                <Upload className="w-3.5 h-3.5" /> Anexar documento (.pdf, .ppsx)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}