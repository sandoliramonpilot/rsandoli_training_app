import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import {
  X, Loader2, FileText, ExternalLink, Save, Trash2, CheckCircle2,
  AlertTriangle, ShieldCheck, BadgeCheck, Award, FileBadge, Plane,
} from "lucide-react";

const ENTITY_ICONS = {
  license: BadgeCheck,
  qualification: Award,
  operational_auth: ShieldCheck,
  habilitacao: FileBadge,
  endorsement: Plane,
};

const SITUATION_OPTIONS = [
  { value: "valid", label: "Válida" },
  { value: "near_expiry", label: "Próxima do vencimento" },
  { value: "expired", label: "Vencida" },
  { value: "suspended", label: "Suspensa" },
  { value: "renewing", label: "Em renovação" },
  { value: "pending", label: "Pendente" },
  { value: "na", label: "Não se aplica" },
];

const FIELD_CONFIGS = {
  license: [
    { name: "license_type_label", label: "Tipo (rótulo)", type: "text" },
    { name: "license_number", label: "Número da licença", type: "text" },
    { name: "category", label: "Categoria", type: "text" },
    { name: "issue_date", label: "Data de emissão", type: "date" },
    { name: "expiry_date", label: "Data de validade", type: "date" },
    { name: "situation", label: "Situação", type: "select", options: SITUATION_OPTIONS },
    { name: "authority", label: "Autoridade emissora", type: "text" },
    { name: "notes", label: "Observações", type: "textarea" },
  ],
  qualification: [
    { name: "type_label", label: "Tipo (rótulo)", type: "text" },
    { name: "number", label: "Número", type: "text" },
    { name: "issue_date", label: "Data de emissão", type: "date" },
    { name: "expiry_date", label: "Data de validade", type: "date" },
    { name: "situation", label: "Situação", type: "select", options: SITUATION_OPTIONS },
    { name: "authority", label: "Autoridade emissora", type: "text" },
    { name: "notes", label: "Observações", type: "textarea" },
  ],
  operational_auth: [
    { name: "type_label", label: "Tipo (rótulo)", type: "text" },
    { name: "number", label: "Número", type: "text" },
    { name: "issue_date", label: "Data de emissão", type: "date" },
    { name: "expiry_date", label: "Data de validade", type: "date" },
    { name: "situation", label: "Situação", type: "select", options: SITUATION_OPTIONS },
    { name: "scope", label: "Escopo", type: "text" },
    { name: "authority", label: "Autoridade emissora", type: "text" },
    { name: "notes", label: "Observações", type: "textarea" },
  ],
  habilitacao: [
    { name: "type_label", label: "Tipo (rótulo)", type: "text" },
    { name: "number", label: "Número", type: "text" },
    { name: "issue_date", label: "Data de emissão", type: "date" },
    { name: "expiry_date", label: "Data de validade", type: "date" },
    { name: "situation", label: "Situação", type: "select", options: SITUATION_OPTIONS },
    { name: "authority", label: "Autoridade emissora", type: "text" },
    { name: "notes", label: "Observações", type: "textarea" },
  ],
  endorsement: [
    { name: "aircraft_model_label", label: "Modelo (rótulo)", type: "text" },
    { name: "function", label: "Função autorizada", type: "text" },
    { name: "issue_date", label: "Data de concessão", type: "date" },
    { name: "expiry_date", label: "Data de validade", type: "date" },
    { name: "situation", label: "Situação", type: "select", options: SITUATION_OPTIONS },
    { name: "notes", label: "Observações", type: "textarea" },
  ],
};

export default function TechnicalValidationReviewModal({ item, onClose, onDone }) {
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [ressalvas, setRessalvas] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [action, setAction] = useState(null); // update | delete | approve | approve_notes
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!item) return;
    setLoading(true);
    base44.functions
      .invoke("approveTechnicalValidations", { action: "get_one", entity_key: item.entity_key, id: item.id })
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
      const res = await base44.functions.invoke("approveTechnicalValidations", payload);
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
    const patch = { ...form };
    await call({ action: "update_one", entity_key: item.entity_key, id: item.id, patch }, "Alterações salvas.");
    setAction(null);
  };

  const handleDelete = async () => {
    if (!deleteReason.trim()) { setError("Informe o motivo da exclusão."); return; }
    setAction("delete");
    const ok = await call({ action: "delete_one", entity_key: item.entity_key, id: item.id, reason: deleteReason }, "Registro excluído.");
    setAction(null);
    if (ok) onClose();
  };

  const handleApprove = async () => {
    setAction("approve");
    const ok = await call({ action: "approve_one", entity_key: item.entity_key, id: item.id }, "Validação aprovada.");
    setAction(null);
    if (ok) onClose();
  };

  const handleApproveWithNotes = async () => {
    if (!ressalvas.trim()) { setError("Informe as ressalvas da aprovação."); return; }
    setAction("approve_notes");
    const ok = await call({ action: "approve_with_notes", entity_key: item.entity_key, id: item.id, notes: ressalvas }, "Validação aprovada com ressalvas.");
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
        {/* Header */}
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Icon className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-100 truncate">Revisão de Validação Técnica</h2>
              <p className="text-xs text-slate-500 truncate">
                {item?.entity_label} · {item?.pilot_name || "—"}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={busy} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
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
              {/* Document link */}
              {record.document_uri && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-[#12141A] p-3">
                  <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500">Documento anexado</p>
                    <p className="text-sm text-slate-200 truncate">{record.document_name || "Documento"}</p>
                  </div>
                  <button onClick={() => openDocument(record.document_uri)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25">
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir
                  </button>
                </div>
              )}

              {/* Editable form */}
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

              {/* Ressalvas (approve with notes) */}
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

              {/* Delete confirmation */}
              {confirmDelete && (
                <div className="space-y-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                  <div className="flex items-center gap-2 text-rose-300">
                    <AlertTriangle className="w-4 h-4" />
                    <p className="text-sm font-medium">Confirmar exclusão do registro</p>
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
                    <button
                      onClick={handleDelete}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 disabled:opacity-50"
                    >
                      {action === "delete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Confirmar exclusão
                    </button>
                    <button
                      onClick={() => { setConfirmDelete(false); setDeleteReason(""); }}
                      disabled={busy}
                      className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Pilot link */}
              {record.pilot_id && (
                <button
                  onClick={() => navigate(`/pilots?pilot_id=${record.pilot_id}`)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 disabled:opacity-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir perfil do piloto
                </button>
              )}
            </>
          ) : !loading ? (
            <p className="text-sm text-slate-500 text-center py-8">Registro não encontrado.</p>
          ) : null}
        </div>

        {/* Footer — actions */}
        {!loading && record && (
          <div className="sticky bottom-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-t border-slate-700/60 flex flex-wrap items-center justify-end gap-2">
            {!confirmDelete ? (
              <>
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 disabled:opacity-50"
                >
                  {action === "update" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Alterar
                </button>
                <button
                  onClick={handleApproveWithNotes}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 disabled:opacity-50"
                >
                  {action === "approve_notes" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  Aprovar com ressalvas
                </button>
                <button
                  onClick={handleApprove}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 disabled:opacity-50"
                >
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