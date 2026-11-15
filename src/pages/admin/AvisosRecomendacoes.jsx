// src/pages/admin/AvisosRecomendacoes.jsx
import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Trash2, Edit3, Paperclip, AlertTriangle, Loader2, FileText, Image, Video, Presentation } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500";

const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.mp4,.pptx";
const MAX_MB = 50;

const emptyForm = {
  titulo: "",
  texto: "",
  importante: false,
  categoria: "operacional",
  anexos: [],
  publicado: true,
};

function fileIcon(name = "") {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["pdf", "doc", "docx"].includes(ext)) return FileText;
  if (["jpg", "jpeg", "png"].includes(ext)) return Image;
  if (ext === "mp4") return Video;
  if (ext === "pptx") return Presentation;
  return Paperclip;
}

export default function AvisosRecomendacoes() {
  const [avisos, setAvisos] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () =>
    setAvisos(await base44.entities.Aviso.list("-created_date").catch(() => []));

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      titulo: a.titulo || "",
      texto: a.texto || "",
      importante: !!a.importante,
      categoria: a.categoria || "operacional",
      anexos: a.anexos || [],
      publicado: a.publicado !== false,
    });
    setShowForm(true);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      if (file.size > MAX_MB * 1024 * 1024) {
        alert(`${file.name} excede ${MAX_MB} MB.`);
        continue;
      }
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push({ name: file.name, url: file_url, size: file.size, type: file.type });
    }
    setForm((p) => ({ ...p, anexos: [...(p.anexos || []), ...uploaded] }));
    setUploading(false);
  };

  const removeAnexo = (idx) =>
    setForm((p) => ({ ...p, anexos: p.anexos.filter((_, i) => i !== idx) }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      data_publicacao: new Date().toISOString().slice(0, 10),
    };
    try {
      if (editing) await base44.entities.Aviso.update(editing.id, payload);
      else await base44.entities.Aviso.create(payload);
      setShowForm(false);
      await load();
    } catch (err) {
      alert(err?.message || "Erro ao salvar aviso.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a) => {
    if (!confirm(`Excluir o aviso "${a.titulo}"?`)) return;
    await base44.entities.Aviso.delete(a.id);
    await load();
  };

  if (!avisos) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-sky-600 font-semibold">Administração</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Avisos e Recomendações
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Comunicados operacionais, diretrizes e materiais de consulta
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <Plus className="w-4 h-4" /> Novo aviso
        </button>
      </header>

      {avisos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm px-6 py-16 text-center">
          <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Nenhum aviso publicado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {avisos.map((a) => (
            <div
              key={a.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 ${
                a.importante ? "border-amber-300 ring-1 ring-amber-200/60" : "border-slate-200/80"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.importante && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        <AlertTriangle className="w-3 h-3" /> Importante
                      </span>
                    )}
                    <h3 className="text-base font-semibold text-slate-900">{a.titulo}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{a.texto}</p>
                  {a.anexos?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {a.anexos.map((f, i) => {
                        const Icon = fileIcon(f.name);
                        return (
                          <a
                            key={i}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {f.name}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(a)} className="p-2 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(a)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-lg text-slate-900">
                {editing ? "Editar aviso" : "Novo aviso"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={save} className="px-6 py-5 space-y-4">
              <label className="block">
                <span className="block text-xs font-medium text-slate-600 mb-1.5">Título *</span>
                <input required value={form.titulo} onChange={(e) => set("titulo", e.target.value)} className={inputCls} />
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-slate-600 mb-1.5">Conteúdo</span>
                <textarea
                  value={form.texto}
                  onChange={(e) => set("texto", e.target.value)}
                  rows={5}
                  className={inputCls}
                  placeholder="Registre aqui orientações que exigem atenção imediata da tripulação — restrições operacionais, mudanças de procedimento, alertas de segurança ou prazos de treinamento."
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-medium text-slate-600 mb-1.5">Categoria</span>
                  <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)} className={inputCls}>
                    <option value="operacional">Operacional</option>
                    <option value="seguranca">Segurança</option>
                    <option value="treinamento">Treinamento</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </label>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.importante}
                      onChange={(e) => set("importante", e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    Marcar como importante
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-semibold text-slate-700">Anexos</p>
                <p className="text-[11px] text-slate-500">
                  Aceita .pdf, .jpg, .doc/.docx, .mp4 e .pptx — até {MAX_MB} MB por arquivo.
                </p>
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED}
                  onChange={(e) => uploadFiles(Array.from(e.target.files || []))}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                />
                {uploading && (
                  <p className="text-xs text-sky-600 inline-flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando…
                  </p>
                )}
                {form.anexos?.length > 0 && (
                  <ul className="space-y-1.5">
                    {form.anexos.map((f, i) => {
                      const Icon = fileIcon(f.name);
                      return (
                        <li key={i} className="flex items-center justify-between gap-2 text-xs bg-white rounded-lg border border-slate-200 px-2.5 py-1.5">
                          <span className="inline-flex items-center gap-1.5 text-slate-700 truncate">
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{f.name}</span>
                          </span>
                          <button type="button" onClick={() => removeAnexo(i)} className="text-slate-400 hover:text-rose-600 shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
                  Cancelar
                </button>
                <button type="submit" disabled={saving || uploading} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50">
                  {saving ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
