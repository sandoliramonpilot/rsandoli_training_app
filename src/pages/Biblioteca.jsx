import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { LIBRARY_CATEGORIES, DOC_STATUS_LABELS } from "@/lib/libraryData";
import { Search, Upload, FileText, Star, Loader2, X, Download, BookOpen, Link2, Presentation } from "lucide-react";
import UploadModal from "@/components/library/UploadModal";
import PdfViewer from "@/components/library/PdfViewer";
import PptxViewer from "@/components/library/PptxViewer";
import DownloadUrlModal from "@/components/library/DownloadUrlModal";
import AcademyApprovalBadge from "@/components/AcademyApprovalBadge";

// Legacy categories que podem existir em documentos antigos
const LEGACY_LABELS = {
  poh: "POH", mmel: "MMEL", mel: "MEL", qrh: "QRH",
  maintenance_manual: "Maintenance Manual", wiring_manual: "Wiring Manual",
  avionics_manual: "Avionics Manual", helipilot_manual: "HeliPilot Manual",
  genesys_manual: "Genesys IDU-680 Manual", anac: "Publicações ANAC",
  icao: "Publicações ICAO", faa: "Publicações FAA",
};

const catLabel = (id) => LIBRARY_CATEGORIES.find((c) => c.id === id)?.name || LEGACY_LABELS[id] || id;

export default function Biblioteca() {
  const [docs, setDocs] = useState(null);
  const [aircraft, setAircraft] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [aircraftFilter, setAircraftFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showUpload, setShowUpload] = useState(false);
  const [showDownloadUrl, setShowDownloadUrl] = useState(false);
  const [viewer, setViewer] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("library_favorites") || "[]"); } catch { return []; }
  });
  const [offlineDocs, setOfflineDocs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("offline_docs") || "[]"); } catch { return []; }
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem("library_favorites", JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem("offline_docs", JSON.stringify(offlineDocs));
    // keep only currently known offline docs if a doc list exists
    if (docs) {
      const known = new Set(docs.map((d) => d.id));
      if (offlineDocs.some((o) => !known.has(o.id))) {
        setOfflineDocs((prev) => prev.filter((o) => known.has(o.id)));
      }
    }
  }, [offlineDocs]);

  const load = async () => {
    const [d, a] = await Promise.all([
      base44.entities.LibraryDocument.list("-created_date", 200).catch(() => []),
      base44.entities.Aircraft.list().catch(() => []),
      base44.auth.me().catch(() => null),
    ]);
    setDocs(d);
    setAircraft(a);
    setUser(a);
  };
  useEffect(() => { load(); }, []);

  const toggleFav = (id) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const allTags = useMemo(() => {
    const set = new Set();
    (docs || []).forEach((d) => {
      (d.tags || "").split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => set.add(t.toLowerCase()));
    });
    return [...set].sort();
  }, [docs]);

  const filtered = useMemo(() => {
    if (!docs) return [];
    let list = docs;
    if (activeCat === "favorites") list = list.filter((d) => favorites.includes(d.id));
    else if (activeCat === "offline") list = list.filter((d) => offlineDocs.some((o) => o.id === d.id));
    else if (activeCat !== "all") list = list.filter((d) => d.category === activeCat);

    if (statusFilter !== "all") list = list.filter((d) => (d.status || "active") === statusFilter);
    if (tagFilter) list = list.filter((d) => (d.tags || "").toLowerCase().split(",").map(t => t.trim()).includes(tagFilter));
    if (aircraftFilter !== "all") list = list.filter((d) => (d.aircraft_id || "") === aircraftFilter);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((d) =>
        [d.title, d.tags, d.description, d.keyword, d.doc_number, d.revision_number,
         catLabel(d.category), d.aircraft_registration]
          .filter(Boolean).join(" ").toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "title": list = [...list].sort((a, b) => (a.title || "").localeCompare(b.title || "")); break;
      case "category": list = [...list].sort((a, b) => (catLabel(a.category) || "").localeCompare(catLabel(b.category) || "")); break;
      case "oldest": list = [...list].sort((a, b) => new Date(a.created_date) - new Date(b.created_date)); break;
      case "revision": list = [...list].sort((a, b) => String(a.revision_number || "").localeCompare(String(b.revision_number || ""), undefined, { numeric: true })); break;
      case "added": list = [...list].sort((a, b) => new Date(a.created_date) - new Date(b.created_date)).reverse(); break;
      case "recent": default: list = [...list].sort((a, b) => new Date(a.publish_date || a.created_date) - new Date(b.publish_date || b.created_date)).reverse(); break;
    }
    return list;
  }, [docs, activeCat, query, statusFilter, tagFilter, aircraftFilter, sortBy, favorites, offlineDocs]);

  const openDoc = async (doc) => {
    if (!doc.file_uri) return;
    const isPptx = (doc.file_name || "").toLowerCase().endsWith(".pptx");
    if (isPptx) {
      setViewer({ doc, type: "pptx" });
      return;
    }
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
      setViewer({ doc, url: signed_url, type: "pdf" });
    } catch (e) {
      alert("Não foi possível abrir o documento.");
    }
  };

  const toggleOffline = async (doc) => {
    const existing = offlineDocs.find((o) => o.id === doc.id);
    if (existing) {
      setOfflineDocs((prev) => prev.filter((o) => o.id !== doc.id));
      return;
    }
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
      const res = await fetch(signed_url);
      const blob = await res.blob();
      const data = await blob.arrayBuffer();
      const base64 = arrayBufferToBase64(data);
      const now = new Date().toISOString();
      setOfflineDocs((prev) => [...prev, { id: doc.id, title: doc.title, base64, fileName: doc.file_name || doc.title + ".pdf", syncedAt: now }]);
    } catch (e) {
      alert("Não foi possível baixar o documento para uso offline.");
    }
  };

  const isOfflineFor = (doc) => offlineDocs.some((o) => o.id === doc.id);

  if (!docs) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Conhecimento</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Biblioteca Técnica</h1>
          <p className="text-slate-400 mt-2 text-sm">Manuais, procedimentos e publicações técnicas aeronáuticas — organização, consulta e gestão de PDFs.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowDownloadUrl(true)}
            className="inline-flex items-center gap-2 border border-slate-700 text-slate-200 hover:border-amber-500/40 hover:text-amber-300 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Link2 className="w-4 h-4" /> Baixar PPTX de URL
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-amber-500/20"
          >
            <Upload className="w-4 h-4" /> Enviar PDF
          </button>
        </div>
      </header>

      {/* Busca */}
      <div className="relative max-w-lg">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar por título, tag, código, revisão, aeronave…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
        />
      </div>

      {/* Categorias */}
      <div className="flex flex-wrap gap-2">
        <CatPill label="Todos" active={activeCat === "all"} onClick={() => setActiveCat("all")} count={docs.length} />
        <CatPill label="★ Favoritos" active={activeCat === "favorites"} onClick={() => setActiveCat("favorites")} count={favorites.length} />
        <CatPill label=" Offline" active={activeCat === "offline"} onClick={() => setActiveCat("offline")} count={offlineDocs.length} />
        {LIBRARY_CATEGORIES.map((c) => (
          <CatPill key={c.id} label={c.name} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} count={docs.filter((d) => d.category === c.id).length} />
        ))}
      </div>

      {/* Filtros e ordenação */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30">
          <option value="all">Status: Todos</option>
          {Object.entries(DOC_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30">
          <option value="">Tag: Todas</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={aircraftFilter} onChange={(e) => setAircraftFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30">
          <option value="all">Aeronave: Todas</option>
          {aircraft.map((a) => <option key={a.id} value={a.id}>{a.registration}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30">
          <option value="recent">Ordenar: Data mais recente</option>
          <option value="oldest">Data mais antiga</option>
          <option value="title">Título</option>
          <option value="category">Categoria</option>
          <option value="revision">Revisão</option>
          <option value="added">Adicionados recentemente</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhum documento encontrado para os critérios informados.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const cat = LIBRARY_CATEGORIES.find((c) => c.id === doc.category);
            const isFav = favorites.includes(doc.id);
            const isOffline = isOfflineFor(doc);
            const status = DOC_STATUS_LABELS[doc.status] || "Vigente";
            const statusTone = doc.status === "archived" ? "text-slate-500" : doc.status === "superseded" ? "text-rose-400" : doc.status === "review" ? "text-amber-400" : "text-emerald-400";
            return (
              <div key={doc.id} className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5 hover:border-amber-500/30 hover:shadow-lg hover:shadow-black/30 transition-all flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-transparent flex items-center justify-center">
                    {(doc.file_name || "").toLowerCase().endsWith(".pptx") ? <Presentation className="w-5 h-5 text-amber-400" /> : <FileText className="w-5 h-5 text-amber-400" />}
                  </div>
                  <div className="flex items-center gap-1">
                    {isOffline && <Download className="w-4 h-4 text-emerald-400" />}
                    <button onClick={() => toggleFav(doc.id)} className="p-1 text-slate-500 hover:text-amber-400">
                      {isFav ? <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> : <Star className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-100 text-sm leading-snug">{doc.title}</h3>
                <p className="text-xs text-amber-400/70 mt-1">{cat?.name || catLabel(doc.category)}</p>
                {doc.doc_number && <p className="text-[11px] text-slate-500 mt-0.5">Código: {doc.doc_number}</p>}
                {doc.revision_number && <p className="text-[11px] text-slate-500">Rev.: {doc.revision_number}</p>}
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusTone} bg-slate-700/30`}>{status}</span>
                  <AcademyApprovalBadge status={doc.approval_status} size="xs" />
                  {(doc.tags || "").split(",").slice(0, 2).map((t, i) => t.trim() && (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-400">{t.trim()}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/40">
                  <button onClick={() => openDoc(doc)} disabled={!doc.file_uri} className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 disabled:opacity-40">
                    <BookOpen className="w-3.5 h-3.5" /> Visualizar
                  </button>
                  <button onClick={() => toggleOffline(doc)} className="inline-flex items-center text-xs text-slate-400 hover:text-emerald-400" title={isOffline ? "Remover cópia offline" : "Baixar para uso offline"}>
                    {isOffline ? <Download className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showUpload && <UploadModal aircraft={aircraft} onClose={() => setShowUpload(false)} onDone={load} />}
      {showDownloadUrl && <DownloadUrlModal aircraft={aircraft} onClose={() => setShowDownloadUrl(false)} onDone={load} />}
      {viewer?.type === "pdf" && <PdfViewer doc={viewer.doc} url={viewer.url} onClose={() => setViewer(null)} />}
      {viewer?.type === "pptx" && <PptxViewer doc={viewer.doc} onClose={() => setViewer(null)} />}
    </div>
  );
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function CatPill({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
        active ? "bg-amber-500 text-slate-900 border-amber-500" : "bg-[#1A1D25] text-slate-300 border-slate-700/60 hover:border-amber-500/40"
      }`}
    >
      {label}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-slate-900/20" : "bg-slate-700/40"}`}>{count}</span>
    </button>
  );
}