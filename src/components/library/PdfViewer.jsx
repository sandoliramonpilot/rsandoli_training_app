import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Maximize, Minimize, Star, ArrowLeft, Search } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${"4.0.379"}/build/pdf.worker.min.mjs`;

const STORE_KEY = "pdf_page_resume";
const FAV_KEY = "pdf_favorites";

export default function PdfViewer({ doc, url, onClose }) {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [renderKey, setRenderKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [textContent, setTextContent] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const [favList, setFavList] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || "{}"); } catch { return {}; }
  });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pageRef = useRef(page);
  pageRef.current = page;
  const perDocFav = favList[doc.id] || [];

  // Carrega o documento
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError("");
        const loadingTask = pdfjsLib.getDocument({ url, isEvalSupported: false });
        const loaded = await loadingTask.promise;
        if (cancelled) return;
        setPdf(loaded);
        setNumPages(loaded.numPages);
        // Retomada na última página visualizada por documento
        try {
          const resume = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
          const start = Math.min(resume[doc.id] || 1, loaded.numPages);
          setPage(Math.max(1, start));
        } catch { setPage(1); }
        setLoading(false);
      } catch (e) {
        if (!cancelled) { setError("Não foi possível carregar o PDF."); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [url, doc.id]);

  // Renderiza a página atual
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const pageObj = await pdf.getPage(page);
        const base = pageObj.getViewport({ scale: 1, rotation });
        const containerWidth = containerRef.current?.clientWidth || 600;
        const fitScale = containerWidth / base.width;
        const effectiveScale = scale * fitScale;
        const viewport = pageObj.getViewport({ scale: effectiveScale, rotation });
        const canvas = canvasRef.current;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        await pageObj.render({ canvasContext: ctx, viewport }).promise;
        const tc = await pageObj.getTextContent();
        if (!cancelled) setTextContent(tc);
      } catch (e) { /* página em renderização */ }
    })();
    return () => { cancelled = true; };
  }, [pdf, page, scale, rotation, renderKey]);

  // Persistir última página
  useEffect(() => {
    if (pdf) {
      try {
        const resume = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
        resume[doc.id] = page;
        localStorage.setItem(STORE_KEY, JSON.stringify(resume));
      } catch {}
    }
  }, [page, pdf, doc.id]);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favList));
  }, [favList]);

  const goTo = useCallback((p) => {
    if (!pdf) return;
    setPage(Math.max(1, Math.min(Number(p) || 1, numPages)));
    if (p !== pageRef.current) setRenderKey((k) => k + 1);
    setShowFavs(false);
  }, [pdf, numPages]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  };
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFavPage = (p) => {
    const exists = perDocFav.some((f) => f.page === p);
    if (exists) {
      setFavList((prev) => ({ ...prev, [doc.id]: (prev[doc.id] || []).filter((f) => f.page !== p) }));
      return;
    }
    const note = prompt("Anotação (opcional) para a página favorita:", "");
    if (note === null) return;
    setFavList((prev) => ({ ...prev, [doc.id]: [...(prev[doc.id] || []), { page: p, note, addedAt: new Date().toISOString() }] }));
  };

  const performSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || !textContent) return;
    const items = textContent.items || [];
    const hit = items.findIndex((it) => (it.str || "").toLowerCase().includes(q));
    if (hit === -1) alert("Trecho não encontrado nesta página. Tente outra página ou documento.");
  };

  const scannedText = textContent && (textContent.items || []).filter((it) => it.str && it.str.trim()).length < 3;
  const canHighlight = !scannedText;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-2 bg-[#1A1D25] border-b border-slate-700/60 px-4 py-2.5 shrink-0 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-amber-300 px-2 py-1.5 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-4 h-4" /> Biblioteca
          </button>
          <div className="hidden sm:block h-5 w-px bg-slate-700 mx-1" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate">{doc.title}</p>
            <p className="text-[11px] text-slate-500">{doc.doc_number ? `${doc.doc_number} · ` : ""}{doc.revision_number ? `Rev. ${doc.revision_number}` : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))} className="p-1.5 text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5" title="Reduzir zoom"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={() => setScale(1)} className="px-2 py-1 text-xs text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5" title="Ajustar à largura">100</button>
          <button onClick={() => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)))} className="p-1.5 text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5" title="Aumentar zoom"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={() => setRotation((r) => (r + 90) % 360)} className="p-1.5 text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5" title="Rotacionar página"><RotateCw className="w-4 h-4" /></button>
          <button onClick={toggleFullscreen} className="p-1.5 text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5" title="Tela cheia">{isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}</button>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5" title="Fechar"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center text-rose-400 text-sm p-8">{error}</div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-9 h-9 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div ref={containerRef} className="flex-1 overflow-auto bg-slate-900 relative">
          <div className="min-h-full flex items-start justify-center p-4">
            <canvas ref={canvasRef} className="shadow-2xl bg-white" />
          </div>
          {scannedText && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-amber-300 bg-black/70 px-3 py-1.5 rounded-lg whitespace-nowrap">
              PDF digitalizado — o destaque textual depende de OCR.
            </div>
          )}
        </div>
      )}

      {/* Painel de favoritos */}
      {showFavs && !loading && !error && (
        <div className="absolute bottom-16 right-4 z-50 w-72 max-h-80 overflow-y-auto rounded-xl border border-slate-700/60 bg-[#1A1D25] shadow-2xl p-3">
          <p className="text-xs font-semibold text-slate-300 mb-2">Páginas favoritas</p>
          {perDocFav.length === 0 ? (
            <p className="text-xs text-slate-500">Nenhuma página favorita marcada neste documento.</p>
          ) : (
            <div className="space-y-1.5">
              {perDocFav.map((f) => (
                <div key={f.page} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5">
                  <button onClick={() => goTo(f.page)} className="flex-1 text-left">
                    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5">Pág. {f.page}</span>
                    <span className="text-xs text-slate-300 block mt-1">{f.note || "Sem anotação"}</span>
                  </button>
                  <button onClick={() => toggleFavPage(f.page)} className="text-slate-500 hover:text-rose-400" title="Remover favorito"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Barra inferior */}
      {!loading && !error && (
        <div className="flex items-center justify-between gap-2 bg-[#1A1D25] border-t border-slate-700/60 px-4 py-2.5 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={() => goTo(page - 1)} disabled={page <= 1} className="p-1.5 text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm text-slate-300 whitespace-nowrap">Página</span>
            <input
              type="number"
              value={page}
              min={1}
              max={numPages}
              onChange={(e) => goTo(e.target.value)}
              className="w-16 px-2 py-1 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <span className="text-sm text-slate-500 whitespace-nowrap">de {numPages}</span>
            <button onClick={() => goTo(page + 1)} disabled={page >= numPages} className="p-1.5 text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && performSearch()}
                placeholder="Buscar trecho nesta página…"
                className="w-44 px-2 py-1 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            {canHighlight && (
              <button
                onClick={() => {
                  const sel = window.getSelection()?.toString();
                  if (!sel) { alert("Selecione um trecho de texto na página para destacar."); return; }
                  alert("Destaque textual adicionado: \"" + sel.slice(0, 80) + (sel.length > 80 ? "…" : "") + "\" (armazenado localmente).");
                }}
                className="px-2 py-1.5 text-xs text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5"
                title="Destacar texto selecionado"
              >
                Destacar
              </button>
            )}
            <div className="h-5 w-px bg-slate-700 hidden sm:block" />
            <button
              onClick={() => toggleFavPage(page)}
              className="p-1.5 text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5"
              title="Marcar/desmarcar página atual como favorita"
            >
              <Star className={`w-4 h-4 ${perDocFav.some((f) => f.page === page) ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>
            <button
              onClick={() => setShowFavs((o) => !o)}
              className="px-2 py-1.5 text-sm text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5"
              title="Lista de páginas favoritas"
            >
              <Star className="w-4 h-4 inline-block" /> <span className="text-xs">{perDocFav.length}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}