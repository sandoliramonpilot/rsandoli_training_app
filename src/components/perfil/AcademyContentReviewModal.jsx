import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { LIBRARY_CATEGORIES, DOC_STATUS } from "@/lib/libraryData";
import {
  X, Loader2, FileText, ExternalLink, Save, Trash2, CheckCircle2,
  AlertTriangle, GraduationCap, BookOpen, XCircle,
} from "lucide-react";

const ENTITY_ICONS = {
  training_doc: GraduationCap,
  library_doc: BookOpen,
};

const FILE_TYPE_OPTIONS = [
  { value: "pdf", label: "PDF" },
  { value: "ppsx", label: "PPSX" },
  { value: "pptx", label: "PPTX" },
  { value: "video", label: "Vídeo" },
  { value: "image", label: "Imagem" },
  { value: "other", label: "Outro" },
];

const FIELD_CONFIGS = {
  training_doc: [
    { name: "title", label: "Título", type: "text" },
    { name: "chapter", label: "Capítulo", type: "text" },
    { name: "file_type", label: "Tipo de arquivo", type: "select", options: FILE_TYPE_OPTIONS },
    { name: "description", label: "Descrição", type: "textarea" },
  ],
  library_doc: [
    { name: "title", label: "Título", type: "text" },
    { name: "category", label: "Categoria", type: "select", options: LIBRARY_CATEGORIES.map((c) => ({ value: c.id, label: c.name })) },
    { name: "doc_number", label: "Número / código", type: "text" },
    { name: "revision_number", label: "Revisão", type: "text" },
    { name: "revision_date", label: "Data da revisão", type: "date" },
    { name: "publish_date", label: "Data de publicação", type: "date" },
    { name: "validity_date", label: "Data de validade", type: "date" },
    { name: "status", label: "Status do documento", type: "select", options: DOC_STATUS.map((s) => ({ value: s.id, label: s.label })) },
    { name: "keyword", label: "Palavra-chave", type: "text" },
    { name: "tags", label: "Tags", type: "text" },
    { name: "description", label: "Descrição", type: "textarea" },
  ],
};

export default function AcademyContentReviewModal({ item, onClose, onDone }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [ressalvas, setRessalvas] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [action, setAction] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!item) return;
    setLoading(true);
    base44.functions
      .invoke("approveAcademyContent", { action: "get_one", entity_key: item.entity_key, id: item.id })
      .then((res) => {
        const rec = res.data?.record || res.record;
        setRecord(rec);
        const fields = FIELD_CONFIGS[item.entity_key] || [];
        const initial = {};
        fields.forEach((f) => { initial[f.name] = rec?.[f.name] ?? ""; });
        setForm(initial);
      })
      .catch(() => setError("Não foi possível carregar o registro."))
      .finally(() => setLoading(false));
  }, [item]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fields = FIELD_CONFIGS[item?.entity_key] || [];
  const Icon = ENTITY_ICONS[item?.entity_key] || FileText;

  const call = async (payload, successMsg) => {
    setError("");
    try {
      const res = await base44.functions.invoke("approveAcademyContent", payload);
      setToast(res.data?.message || successMsg);
      onDone();
      return true;
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Erro na operação.");
      return false;
    }
  };

  const handleUpdate = async () => {
    setAction("update");
    await call({ action: "update_one", entity_key: item.entity_key, id: item.id, patch: form }, "Alterações salvas.");
    setAction(null);
  };

  const handleApprove = async () => {
    setAction("approve");
    const ok = await call({ action: "approve_one", entity_key: item.entity_key, id: item.id }, "Conteúdo aprovado.");
    setAction(null);
    if (ok) onClose();
  };

  const handleApproveWithNotes = async () => {
    if (!ressalvas.trim()) { setError("Informe as ressalvas da aprovação."); return; }
    setAction("approve_notes");
    const ok = await call({ action: "approve_with_notes", entity_key: item.entity_key, id: item.id, notes: ressalvas }, "Conteúdo aprovado com ressalvas.");
    setAction(null);
    if (ok) onClose();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { setError("Informe o motivo da rejeição."); return; }
    setAction("reject");
    const ok = await call({ action: "reject_one", entity_key: item.entity_key, id: item.id, reason: rejectReason }, "Conteúdo rejeitado.");
    setAction(null);
    if (ok) onClose();
  };

  const handleDelete = async () => {
    if (!deleteReason.trim()) { setError("Informe o motivo da exclusão."); return; }
    setAction("delete");
    const ok = await call({ action: "delete_one", entity_key: item.entity_key, id: item.id, reason: deleteReason }, "Conteúdo excluído.");
    setAction(null);
    if (ok) onClose();
  };

  const openDocument = async (uri) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri });
      window.open(signed_url, "_blank");
    } catch { alert("Não foi possível abrir o documento."); }
  };

  const busy = !!action;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[94vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Icon className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-100 truncate">Revisão de Conteúdo da Academy</h2>
              <p className="text-xs text-slate-500 truncate">{item?.entity_label} · {item?.title || "—"}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={busy} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {toast && (
            <div className="px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
              {toast}
              <button onClick={() => setToast("")} className="text-emerald-400 hover:text-emerald-200"><X className="w-4 h-4" /></button>
            </div>
          )}
          {error && (
            <div className="px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
              {error}
              <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-200"><X className="w-4 h-4" /></button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-amber-500" /></div>
          ) : record ? (
            <>
              {record.file_uri && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-[#12141A] p-3">
                  <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500">Arquivo anexado</p>
                    <p className="text-sm text-slate-200 truncate">{record.file_name || "Documento"}</p>
                  </div>
                  <button onClick={() => openDocument(record.file_uri)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25">
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir
                  </button>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{f.label}</label>
                    {f.type === "select" ? (
                      <select
                        value={form[f.name] || ""}
                        onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                        disabled={busy}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 disabled:opacity-60"
                      >
                        <option value="">—</option>
                        {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea
                        value={form[f.name] || ""}
                        onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                        disabled={busy}
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 disabled:opacity-60 resize-none"
                      />
                    ) : (
                      <input
                        type={f.type}
                        value={form[f.name] || ""}
                        onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                        disabled={busy}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 disabled:opacity-60"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Ressalvas (para aprovação com ressalvas)</label>
                <textarea
                  value={ressalvas}
                  onChange={(e) => setRessalvas(e.target.value)}
                  disabled={busy}
                  rows={2}
                  placeholder="Descreva as ressalvas que acompanham esta aprovação…"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 disabled:opacity-60 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Motivo da rejeição (para rejeitar)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  disabled={busy}
                  rows={2}
                  placeholder="Informe o motivo da rejeição…"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#12141A] border border-rose-500/20 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/30 disabled:opacity-60 resize-none"
                />
              </div>

              {confirmDelete && (
                <div className="space-y-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                  <div className="flex items-center gap-2 text-rose-300">
                    <AlertTriangle className="w-4 h-4" />
                    <p className="text-sm font-medium">Confirmar exclusão do conteúdo</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Motivo da exclusão</label>
                    <textarea
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      disabled={busy}
                      rows={2}
                      placeholder="Informe o motivo…"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#12141A] border border-rose-500/30 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/30 disabled:opacity-60 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleDelete} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 disabled:opacity-50">
                      {action === "delete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Confirmar exclusão
                    </button>
                    <button onClick={() => { setConfirmDelete(false); setDeleteReason(""); }} disabled={busy} className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : !loading ? (
            <p className="text-sm text-slate-500 text-center py-8">Registro não encontrado.</p>
          ) : null}
        </div>

        {!loading && record && (
          <div className="sticky bottom-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-t border-slate-700/60 flex flex-wrap items-center justify-end gap-2">
            {!confirmDelete ? (
              <>
                <button onClick={() => setConfirmDelete(true)} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 disabled:opacity-50">
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
                <button onClick={handleReject} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 disabled:opacity-50">
                  {action === "reject" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Rejeitar
                </button>
                <button onClick={handleUpdate} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 disabled:opacity-50">
                  {action === "update" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Alterar
                </button>
                <button onClick={handleApproveWithNotes} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 disabled:opacity-50">
                  {action === "approve_notes" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  Aprovar c/ ressalvas
                </button>
                <button onClick={handleApprove} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 disabled:opacity-50">
                  {action === "approve" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Aprovar
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}