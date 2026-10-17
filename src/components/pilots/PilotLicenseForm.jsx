import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  PILOT_LICENSE_TYPES, PILOT_LICENSE_SITUATIONS, PILOT_LICENSE_VALIDITY_SOURCES,
} from "@/lib/pilotUtils";
import { X, Check, Loader2, Upload, FileText, Trash2, AlertTriangle } from "lucide-react";
import { useProfile } from "@/lib/ProfileContext";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50";

export default function PilotLicenseForm({ pilot, license, existingLicenses, onClose, onSaved }) {
  const isEdit = !!license;
  const { profileValue } = useProfile();
  const isOther = (license?.license_type || "") === "other";
  const [f, setF] = useState({
    license_type: license?.license_type || "",
    license_type_label: license?.license_type_label || "",
    other_license_name: license?.other_license_name || "",
    license_number: license?.license_number || "",
    category: license?.category || "",
    description: license?.description || "",
    issue_date: license?.issue_date || "",
    grant_date: license?.grant_date || "",
    revalidation_date: license?.revalidation_date || "",
    expiry_date: license?.expiry_date || "",
    situation: license?.situation || "pending",
    authority: license?.authority || "",
    notes: license?.notes || "",
    validity_source: license?.validity_source || "informed",
    validity_rule: license?.validity_rule || "",
    validity_rule_source: license?.validity_rule_source || "",
    validity_base_date: license?.validity_base_date || "",
    document_uri: license?.document_uri || "",
    document_name: license?.document_name || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState("");

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const isOtherType = f.license_type === "other";

  // Duplicate check: same pilot_id + license_type + license_number + grant_date
  const isDuplicate = useMemo(() => {
    if (!f.license_type || !f.license_number || !f.grant_date) return false;
    return existingLicenses.some((l) =>
      l.id !== license?.id &&
      l.pilot_id === pilot.id &&
      l.license_type === f.license_type &&
      (l.license_number || "").toLowerCase() === f.license_number.toLowerCase() &&
      l.grant_date === f.grant_date
    );
  }, [f.license_type, f.license_number, f.grant_date, existingLicenses, license?.id, pilot.id]);

  const validate = () => {
    if (!f.license_type) return "Selecione o tipo de licença.";
    if (isOtherType) {
      if (!f.other_license_name.trim()) return "Nome da licença é obrigatório para 'Outra licença'.";
      if (!f.description.trim()) return "Descrição é obrigatória para 'Outra licença'.";
      if (!f.category.trim()) return "Categoria é obrigatória para 'Outra licença'.";
    }
    if (isDuplicate) return "Já existe uma licença com o mesmo tipo, número e data de concessão para este piloto.";
    return "";
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(file.name);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      set("document_uri", file_uri);
      set("document_name", file.name);
    } catch { setError("Erro ao enviar arquivo."); }
    setUploading(null);
    e.target.value = "";
  };

  const removeFile = () => {
    set("document_uri", "");
    set("document_name", "");
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setSaving(true);
    try {
      const typeObj = PILOT_LICENSE_TYPES.find((t) => t.id === f.license_type);
      const payload = {
        aircraftProfile: profileValue,
        pilot_id: pilot.id,
        pilot_name: pilot.full_name,
        license_type: f.license_type,
        license_type_label: typeObj?.label || "",
        other_license_name: isOtherType ? f.other_license_name : undefined,
        license_number: f.license_number || undefined,
        category: f.category || undefined,
        description: f.description || undefined,
        issue_date: f.issue_date || undefined,
        grant_date: f.grant_date || undefined,
        revalidation_date: f.revalidation_date || undefined,
        expiry_date: f.expiry_date || undefined,
        situation: f.situation,
        authority: f.authority || undefined,
        notes: f.notes || undefined,
        validity_source: f.validity_source,
        validity_rule: f.validity_source === "calculated" ? f.validity_rule : undefined,
        validity_rule_source: f.validity_source === "calculated" ? f.validity_rule_source : undefined,
        validity_base_date: f.validity_source === "calculated" ? f.validity_base_date : undefined,
        document_uri: f.document_uri || undefined,
        document_name: f.document_name || undefined,
      };
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      if (isEdit) {
        await base44.entities.PilotLicense.update(license.id, payload);
      } else {
        payload.approval_status = "draft";
        await base44.entities.PilotLicense.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Erro ao salvar licença.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[94vh] flex flex-col">
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between z-10">
          <h2 className="font-semibold text-lg text-slate-100">{isEdit ? "Editar Licença" : "Nova Licença"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Tipo de licença" required>
              <select className={inputCls} value={f.license_type} onChange={(e) => set("license_type", e.target.value)}>
                <option value="">Selecione…</option>
                {PILOT_LICENSE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Número da licença ANAC">
              <input className={inputCls} value={f.license_number} onChange={(e) => set("license_number", e.target.value)} placeholder="Letras e números" />
            </Field>
            <Field label="Categoria">
              <input className={inputCls} value={f.category} onChange={(e) => set("category", e.target.value)} placeholder="Alfanumérico" />
            </Field>
          </div>

          {isOtherType && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <Field label="Nome da licença" required>
                <input className={inputCls} value={f.other_license_name} onChange={(e) => set("other_license_name", e.target.value)} />
              </Field>
              <Field label="Descrição" required className="sm:col-span-2">
                <input className={inputCls} value={f.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
            </div>
          )}

          {!isOtherType && (
            <Field label="Descrição">
              <input className={inputCls} value={f.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Data de emissão"><input type="date" className={inputCls} value={f.issue_date} onChange={(e) => set("issue_date", e.target.value)} /></Field>
            <Field label="Data de concessão"><input type="date" className={inputCls} value={f.grant_date} onChange={(e) => set("grant_date", e.target.value)} /></Field>
            <Field label="Data de revalidação"><input type="date" className={inputCls} value={f.revalidation_date} onChange={(e) => set("revalidation_date", e.target.value)} /></Field>
            <Field label="Data de validade"><input type="date" className={inputCls} value={f.expiry_date} onChange={(e) => set("expiry_date", e.target.value)} /></Field>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Situação">
              <select className={inputCls} value={f.situation} onChange={(e) => set("situation", e.target.value)}>
                {PILOT_LICENSE_SITUATIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Autoridade emissora"><input className={inputCls} value={f.authority} onChange={(e) => set("authority", e.target.value)} /></Field>
            <Field label="Fonte da validade">
              <select className={inputCls} value={f.validity_source} onChange={(e) => set("validity_source", e.target.value)}>
                {PILOT_LICENSE_VALIDITY_SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          {f.validity_source === "calculated" && (
            <div className="grid sm:grid-cols-3 gap-3 p-3 rounded-xl bg-sky-500/5 border border-sky-500/20">
              <Field label="Regra de validade utilizada"><input className={inputCls} value={f.validity_rule} onChange={(e) => set("validity_rule", e.target.value)} /></Field>
              <Field label="Fonte da regra"><input className={inputCls} value={f.validity_rule_source} onChange={(e) => set("validity_rule_source", e.target.value)} /></Field>
              <Field label="Data-base do cálculo"><input type="date" className={inputCls} value={f.validity_base_date} onChange={(e) => set("validity_base_date", e.target.value)} /></Field>
            </div>
          )}

          <Field label="Observações">
            <textarea className={`${inputCls} min-h-[60px]`} value={f.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>

          {/* Document */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400">Documento comprobatório</p>
            {f.document_uri ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#12141A] border border-slate-700/60">
                <span className="text-sm text-slate-300 flex items-center gap-2 truncate"><FileText className="w-4 h-4 text-amber-400 shrink-0" /> {f.document_name}</span>
                <button type="button" onClick={removeFile} className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remover</button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-dashed border-slate-600 text-sm text-slate-300 hover:border-amber-400/60 hover:text-amber-300">
                <Upload className="w-4 h-4" /> {uploading ? `Enviando ${uploading}…` : "Anexar PDF ou imagem"}
                <input type="file" accept="application/pdf,image/*" className="hidden" onChange={uploadFile} />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-[#1A1D25] -mx-6 px-6 py-3 border-t border-slate-700/60">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700/40">Cancelar</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-50">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando…</> : <><Check className="w-4 h-4" /> Salvar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium text-slate-400 mb-1">{label}{required && <span className="text-amber-400"> *</span>}</span>
      {children}
    </label>
  );
}