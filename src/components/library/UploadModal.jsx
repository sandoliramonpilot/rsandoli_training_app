import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { LIBRARY_CATEGORIES, DOC_STATUS } from "@/lib/libraryData";
import { Upload, Loader2, X } from "lucide-react";
import { useProfile } from "@/lib/ProfileContext";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50";
const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

export default function UploadModal({ aircraft, onClose, onDone }) {
  const { profileFilter, profileValue } = useProfile();
  const [editing, setEditing] = useState(null); // documento existente sendo substituído
  const [existingDocs, setExistingDocs] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category: LIBRARY_CATEGORIES[0].id,
    description: "",
    keyword: "",
    tags: "",
    doc_number: "",
    revision_number: "",
    revision_date: "",
    publish_date: "",
    validity_date: "",
    aircraft_id: "",
    status: "active",
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const loadExisting = async () => {
    const d = await base44.entities.LibraryDocument.filter(profileFilter, { sort: "-created_date", limit: 200 }).then(r => r.items).catch(() => []);
    setExistingDocs(d);
  };
  React.useEffect(() => { loadExisting(); }, []);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const selectFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) {
      setError("Somente arquivos PDF são aceitos.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("O arquivo excede o tamanho máximo permitido (25 MB).");
      return;
    }
    setError("");
    setFile(f);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title) { setError("Informe o título do documento."); return; }
    if (!file) { setError("Selecione o arquivo PDF."); return; }
    if (!form.revision_number && !form.category) { /* ok */ }
    setSaving(true);
    setError("");
    try {
      const me = await base44.auth.me().catch(() => null);
      const uploadedBy = me?.full_name || me?.email || "";
      const uploadedAt = new Date().toISOString();
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const ac = aircraft.find((a) => a.id === form.aircraft_id);
      const payload = {
        ...form,
        tags: form.tags ? normalizeTags(form.tags) : null,
        description: form.description || null,
        keyword: form.keyword || null,
        doc_number: form.doc_number || null,
        revision_number: form.revision_number || null,
        revision_date: form.revision_date || null,
        publish_date: form.publish_date || null,
        validity_date: form.validity_date || null,
        aircraft_id: form.aircraft_id || null,
        aircraft_registration: ac?.registration || null,
        file_uri,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: uploadedBy,
        uploaded_at: uploadedAt,
        approval_status: "pending_review",
      };

      if (editing) {
        // Controle de versões: preserva o histórico da versão anterior
        const prevVersions = editing.versions ? JSON.parse(editing.versions) : [];
        const newVersions = [
          ...prevVersions,
          { file_uri: editing.file_uri, revision_number: editing.revision_number, uploaded_by: editing.uploaded_by, uploaded_at: editing.uploaded_at },
        ];
        payload.versions = JSON.stringify(newVersions);
        // Nova versão volta a aguardar aprovação
        payload.reviewed_by = null;
        payload.reviewed_at = null;
        payload.review_decision = null;
        payload.review_justification = null;
        await base44.entities.LibraryDocument.update(editing.id, payload);
      } else {
        await base44.entities.LibraryDocument.create({ ...payload, aircraftProfile: profileValue });
      }
      onDone();
      onClose();
    } catch (err) {
      setError("Erro ao enviar documento. Verifique o arquivo e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const chooseExisting = async (id) => {
    if (!id) { setEditing(null); return; }
    const doc = existingDocs.find((d) => d.id === id);
    if (doc) {
      if (!confirm(`Realmente deseja substituir o arquivo de "${doc.title}"? As versões anteriores serão preservadas no histórico.`)) {
        return;
      }
      setEditing(doc);
      setForm({
        title: doc.title || "",
        category: doc.category || LIBRARY_CATEGORIES[0].id,
        description: doc.description || "",
        keyword: doc.keyword || "",
        tags: doc.tags || "",
        doc_number: doc.doc_number || "",
        revision_number: doc.revision_number || "",
        revision_date: doc.revision_date || "",
        publish_date: doc.publish_date || "",
        validity_date: doc.validity_date || "",
        aircraft_id: doc.aircraft_id || "",
        status: doc.status || "active",
      });
    } else {
      setEditing(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-100">{editing ? "Substituir versão do documento" : "Enviar documento"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={save} className="px-6 py-5 space-y-4">
          {/* Substituição de documento existente (controle de versões) */}
          {!editing && existingDocs.length > 0 && (
            <label className="block">
              <span className="block text-xs font-medium text-slate-400 mb-1.5">Substituir documento existente (nova versão)</span>
              <select onChange={(e) => chooseExisting(e.target.value)} className={inputCls}>
                <option value="">— Enviar como novo documento —</option>
                {existingDocs.map((d) => <option key={d.id} value={d.id}>{d.title} ({d.doc_number || "s/ código"})</option>)}
              </select>
            </label>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Título do documento *"><input required value={form.title} onChange={set("title")} className={inputCls} placeholder="Ex: RFMS AW119Kx Rev 12" /></Field>
            <Field label="Categoria *">
              <select value={form.category} onChange={set("category")} className={inputCls}>
                {LIBRARY_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Número ou código do documento"><input value={form.doc_number} onChange={set("doc_number")} className={inputCls} placeholder="Ex: 119-00-102" /></Field>
            <Field label="Número da revisão"><input value={form.revision_number} onChange={set("revision_number")} className={inputCls} placeholder="Ex: 12" /></Field>
            <Field label="Data da revisão"><input type="date" value={form.revision_date} onChange={set("revision_date")} className={inputCls} /></Field>
            <Field label="Data de publicação"><input type="date" value={form.publish_date} onChange={set("publish_date")} className={inputCls} /></Field>
            <Field label="Data de validade"><input type="date" value={form.validity_date} onChange={set("validity_date")} className={inputCls} /></Field>
            <Field label="Status">
              <select value={form.status} onChange={set("status")} className={inputCls}>
                {DOC_STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Aeronave relacionada">
              <select value={form.aircraft_id} onChange={set("aircraft_id")} className={inputCls}>
                <option value="">— Nenhuma —</option>
                {aircraft.map((a) => <option key={a.id} value={a.id}>{a.registration} — {a.model}</option>)}
              </select>
            </Field>
            <Field label="Palavra-chave"><input value={form.keyword} onChange={set("keyword")} className={inputCls} placeholder="Termo de busca principal" /></Field>
          </div>

          <Field label="Descrição">
            <textarea value={form.description} onChange={set("description")} rows={2} className={inputCls} placeholder="Breve descrição do conteúdo" />
          </Field>
          <Field label="Tags (separadas por vírgula)">
            <input value={form.tags} onChange={set("tags")} className={inputCls} placeholder="Ex: motor, limitações, emergência" />
          </Field>

          <label className="block">
            <span className="block text-xs font-medium text-slate-400 mb-1.5">Arquivo PDF *</span>
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-amber-500/50 transition-colors">
              {file ? (
                <p className="text-sm text-slate-200 font-medium">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Clique para selecionar um PDF (máx. 25 MB)</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={selectFile} />
          </label>

          {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{error}</div>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700/40">Cancelar</button>
            <button type="submit" disabled={saving || !file || !form.title} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-slate-900 hover:bg-amber-400 disabled:opacity-50 inline-flex items-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</> : editing ? "Substituir versão" : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function normalizeTags(tags) {
  const seen = new Set();
  const out = [];
  tags.split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => {
    const key = t.toLowerCase();
    if (!seen.has(key)) { seen.add(key); out.push(t); }
  });
  return out.join(", ");
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}