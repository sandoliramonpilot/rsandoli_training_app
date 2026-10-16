import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import AcademyApprovalBadge from "@/components/AcademyApprovalBadge";
import MediaThumb from "@/components/academy/MediaThumb";
import DocumentEditModal from "@/components/academy/DocumentEditModal";
import { Pencil, Trash2, Loader2 } from "lucide-react";

export default function DocumentListItem({ doc, canEdit, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOpen = async (e) => {
    e.preventDefault();
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
      window.open(signed_url, "_blank");
    } catch {
      alert("Não foi possível abrir o arquivo.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Excluir "${doc.title}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(true);
    try {
      await base44.entities.TrainingDocument.delete(doc.id);
      onUpdated?.();
    } catch (err) {
      alert("Erro ao excluir: " + (err.message || "tente novamente."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-700/30 border border-slate-700/40 hover:border-amber-500/40 transition-colors text-sm">
        <MediaThumb file_uri={doc.file_uri} file_type={doc.file_type} file_name={doc.file_name} />
        <button onClick={handleOpen} className="min-w-0 flex-1 text-left">
          <span className="text-slate-300 truncate block hover:text-amber-300 transition-colors">{doc.title}</span>
          <AcademyApprovalBadge status={doc.approval_status} size="xs" />
        </button>
        <span className="text-xs text-slate-500 uppercase shrink-0">{doc.file_type}</span>
        {canEdit && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              title="Editar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Excluir"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
      {editing && (
        <DocumentEditModal
          doc={doc}
          onClose={() => setEditing(false)}
          onDone={() => { setEditing(false); onUpdated?.(); }}
        />
      )}
    </>
  );
}