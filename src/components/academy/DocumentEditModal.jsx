import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2, Trash2, Save } from "lucide-react";

export default function DocumentEditModal({ doc, onClose, onDone }) {
  const [title, setTitle] = useState(doc?.title || "");
  const [description, setDescription] = useState(doc?.description || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!doc) return null;

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await base44.entities.TrainingDocument.update(doc.id, {
        title: title.trim(),
        description: description.trim(),
      });
      onDone();
    } catch (err) {
      setError("Erro ao salvar: " + (err.message || "tente novamente."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Excluir "${doc.title}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(true);
    setError("");
    try {
      await base44.entities.TrainingDocument.delete(doc.id);
      onDone();
    } catch (err) {
      setError("Erro ao excluir: " + (err.message || "tente novamente."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Editar material</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{error}</div>}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-[#12141A] border-slate-700/60" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-[#12141A] border-slate-700/60 min-h-[80px]" />
          </div>
          <div className="text-xs text-slate-500">
            Arquivo: {doc.file_name} ({doc.file_type?.toUpperCase()})
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Excluir
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()} className="bg-amber-500 hover:bg-amber-400 text-slate-900">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}