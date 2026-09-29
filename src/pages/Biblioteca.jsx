import React, { useState, useEffect, useMemo, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { LIBRARY_CATEGORIES, CATEGORY_LABELS } from "@/lib/libraryData";
import { Search, Upload, FileText, Star, Download, ExternalLink, Loader2, X } from "lucide-react";

export default function Biblioteca() {
  const [docs, setDocs] = useState(null);
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("library_favorites") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("library_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const load = async () => {
    const d = await base44.entities.LibraryDocument.list("-created_date", 200).catch(() => []);
    setDocs(d);
  };
  useEffect(() => { load(); }, []);

  const toggleFav = (id) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const filtered = useMemo(() => {
    if (!docs) return [];
    let list = docs;
    if (activeCat === "favorites") list = list.filter((d) => favorites.includes(d.id));
    else if (activeCat !== "all") list = list.filter((d) => d.category === activeCat);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((d) => [d.title, d.tags, d.description, CATEGORY_LABELS[d.category]].filter(Boolean).join(" ").toLowerCase().includes(q));
    }
    return list;
  }, [docs, activeCat, query, favorites]);

  const openDoc = async (doc) => {
    if (!doc.file_uri) return;
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
      window.open(signed_url, "_blank");
    } catch (e) {
      alert("Não foi possível abrir o documento.");
    }
  };

  if (!docs) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-sky-600 font-semibold">Documentação</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Biblioteca Técnica</h1>
          <p className="text-slate-500 mt-2 text-sm">Manuais, RFM, POH, SOP, boletins e cartas — organizados por categoria.</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Upload className="w-4 h-4" /> Enviar PDF
        </button>
      </header>

      <div className="relative max-w-lg">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar por título, tag ou categoria…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CatPill label="Todos" active={activeCat === "all"} onClick={() => setActiveCat("all")} count={docs.length} />
        <CatPill label="★ Favoritos" active={activeCat === "favorites"} onClick={() => setActiveCat("favorites")} count={favorites.length} />
        {LIBRARY_CATEGORIES.map((c) => (
          <CatPill key={c.id} label={c.name} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} count={docs.filter((d) => d.category === c.id).length} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm px-6 py-16 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Nenhum documento nesta categoria ainda. Use "Enviar PDF" para adicionar.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const cat = LIBRARY_CATEGORIES.find((c) => c.id === doc.category);
            const isFav = favorites.includes(doc.id);
            return (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat?.color || "from-slate-400 to-slate-600"} flex items-center justify-center shadow-sm`}>
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <button onClick={() => toggleFav(doc.id)} className="p-1 text-slate-300 hover:text-amber-500">
                    {isFav ? <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> : <Star className="w-4 h-4" />}
                  </button>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm leading-snug">{doc.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{cat?.name || doc.category}</p>
                {doc.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.tags.split(",").slice(0, 3).map((t, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{t.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button onClick={() => openDoc(doc)} disabled={!doc.file_uri} className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 disabled:opacity-40">
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onDone={load} />}
    </div>
  );
}

function UploadModal({ onClose, onDone }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("flight_manual");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const save = async (e) => {
    e.preventDefault();
    if (!title || !file) return;
    setSaving(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.LibraryDocument.create({
        title,
        category,
        file_uri,
        file_name: file.name,
        tags: tags || null,
        description: description || null,
      });
      onDone();
      onClose();
    } catch (err) {
      alert("Erro ao enviar documento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-900">Enviar documento</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={save} className="px-6 py-5 space-y-4">
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Título *</span>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Ex: RFM AW119Kx Rev 12" />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Categoria *</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {LIBRARY_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Tags (separadas por vírgula)</span>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} placeholder="Ex: motor, limitações, emergência" />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Descrição</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} placeholder="Opcional" />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Arquivo PDF *</span>
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-sky-400 transition-colors">
              {file ? (
                <p className="text-sm text-slate-700 font-medium">{file.name}</p>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Clique para selecionar um PDF</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancelar</button>
            <button type="submit" disabled={saving || !file || !title} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</> : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500";

function CatPill({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
        active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
      }`}
    >
      {label}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-slate-100"}`}>{count}</span>
    </button>
  );
}