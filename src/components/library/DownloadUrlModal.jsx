import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { LIBRARY_CATEGORIES, DOC_STATUS } from "@/lib/libraryData";
import { Loader2, X, Link2, Download } from "lucide-react";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50";

export default function DownloadUrlModal({ aircraft, onClose, onDone }) {
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
    url: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("");

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Informe o título do documento."); return; }
    if (!form.url.trim()) { setError("Informe a URL do arquivo .pptx."); return; }
    if (!/^https?:\/\//i.test(form.url.trim())) { setError("URL inválida — deve começar com http:// ou https://"); return; }
    setSaving(true);
    setError("");
    setPhase("Baixando arquivo da URL…");
    try {
      const me = await base44.auth.me().catch(() => null);
      const uploadedBy = me?.full_name || me?.email || "";
      const uploadedAt = new Date().toISOString();

      let fname = "apresentacao.pptx";
      try {
        const u = new URL(form.url.trim());
        const parts = u.pathname.split("/");
        if (parts[parts.length - 1]) fname = decodeURIComponent(parts[parts.length - 1]);
      } catch {}
      if (!/\.pptx$/i.test(fname)) fname += ".pptx";

      const res = await base44.functions.invoke("downloadPptxFromUrl", { url: form.url.trim(), file_name: fname });
      const data = res.data || {};
      if (data.error) { setError(data.error); setSaving(false); setPhase(""); return; }

      setPhase("Salvando na biblioteca…");
      const ac = aircraft.find((a) => a.id === form.aircraft_id);
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description || null,
        keyword: form.keyword || null,
        tags: form.tags ? normalizeTags(form.tags) : null,
        doc_number: form.doc_number || null,
        revision_number: form.revision_number || null,
        revision_date: form.revision_date || null,
        publish_date: form.publish_date || null,
        validity_date: form.validity_date || null,
        aircraft_id: form.aircraft_id || null,
        aircraft_registration: ac?.registration || null,
        status: form.status,
        file_uri: data.file_uri,
        file_name: data.file_name || fname,
        file_size: data.file_size,
        uploaded_by: uploadedBy,
        uploaded_at: uploadedAt,
      };
      await base44.entities.LibraryDocument.create(payload);
      onDone();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || err?.data?.error || err.message || "Erro ao baixar e salvar a apresentação.");
    } finally {
      setSaving(false);
      setPhase("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-100">Baixar PowerPoint de URL</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={save} className="px-6 py-5 space-y-4">
          <Field label="URL do arquivo .pptx *">
            <div className="relative">
              <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input required type="url" value={form.url} onChange={set("url")} className={`${inputCls} pl-10`} placeholder="https://exemplo.com/apresentacao.pptx" />
            </div>
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Título do documento *"><input required value={form.title} onChange={set("title")} className={inputCls} placeholder="Ex: Treinamento AW119Kx — Sistemas" /></Field>
            <Field label="Categoria *">
              <select value={form.category} onChange={set("category")} className={inputCls}>
                {LIBRARY_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Número ou código do documento"><input value={form.doc_number} onChange={set("doc_number")} className={inputCls} /></Field>
            <Field label="Número da revisão"><input value={form.revision_number} onChange={set("revision_number")} className={inputCls} /></Field>
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
            <Field label="Palavra-chave"><input value={form.keyword} onChange={set("keyword")} className={inputCls} /></Field>
          </div>

          <Field label="Descrição">
            <textarea value={form.description} onChange={set("description")} rows={2} className={inputCls} />
          </Field>
          <Field label="Tags (separadas por vírgula)">
            <input value={form.tags} onChange={set("tags")} className={inputCls} placeholder="Ex: treinamento, sistemas" />
          </Field>

          {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{error}</div>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700/40">Cancelar</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-slate-900 hover:bg-amber-400 disabled:opacity-50 inline-flex items-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> {phase || "Processando…"}</> : <><Download className="w-4 h-4" /> Baixar e salvar</>}
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