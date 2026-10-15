import React, { useEffect, useRef, useState, useCallback } from "react";
import { loadPresentation, renderSlideToElement, getThumbnails } from "pptx-viewer";
import { base44 } from "@/api/base44Client";
import { X, ChevronLeft, ChevronRight, Loader2, Grid3x3, Maximize, Minimize, AlertTriangle, ArrowLeft } from "lucide-react";

export default function PptxViewer({ doc, onClose }) {
  const [presentation, setPresentation] = useState(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showThumbs, setShowThumbs] = useState(false);
  const [thumbs, setThumbs] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideRef = useRef(null);
  const containerRef = useRef(null);
  const presRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
        const res = await fetch(signed_url);
        if (!res.ok) throw new Error("download");
        const buf = await res.arrayBuffer();
        const pres = await loadPresentation(buf);
        if (cancelled) { pres.cleanup?.(); return; }
        presRef.current = pres;
        setPresentation(pres);
        setCurrent(0);
        const svgThumbs = getThumbnails(pres, 160);
        setThumbs(svgThumbs.map((svg) => {
          try { return new XMLSerializer().serializeToString(svg); } catch { return ""; }
        }));
        setLoading(false);
      } catch (e) {
        if (!cancelled) { setError("Não foi possível carregar a apresentação."); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [doc.id]);

  useEffect(() => {
    if (!presentation || !slideRef.current) return;
    slideRef.current.innerHTML = "";
    try { renderSlideToElement(presentation, current, slideRef.current); } catch {}
  }, [presentation, current]);

  useEffect(() => () => { presRef.current?.cleanup?.(); }, []);

  const total = presentation?.slides?.length || 0;
  const go = useCallback((i) => setCurrent((c) => Math.max(0, Math.min(i, total - 1))), [total]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(current + 1); }
      else if (e.key === "ArrowLeft") go(current - 1);
      else if (e.key === "Escape" && !document.fullscreenElement) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, go, onClose]);

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

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 bg-[#1A1D25] border-b border-slate-700/60 px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-amber-300 px-2 py-1.5 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-4 h-4" /> Biblioteca
          </button>
          <div className="hidden sm:block h-5 w-px bg-slate-700 mx-1" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate">{doc.title}</p>
            <p className="text-[11px] text-slate-500 truncate">{doc.file_name || "Apresentação PowerPoint"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowThumbs((o) => !o)} className={`p-1.5 rounded-lg hover:bg-white/5 ${showThumbs ? "text-amber-300" : "text-slate-300 hover:text-amber-300"}`} title="Miniaturas"><Grid3x3 className="w-4 h-4" /></button>
          <button onClick={toggleFullscreen} className="p-1.5 text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5" title="Tela cheia">{isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}</button>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5" title="Fechar"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-rose-400 text-sm p-8 gap-2">
          <AlertTriangle className="w-8 h-8" />
          {error}
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Carregando slides…</p>
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="flex-1 flex overflow-hidden bg-slate-900">
          {showThumbs && (
            <div className="w-44 shrink-0 overflow-y-auto bg-[#12141A] border-r border-slate-700/60 p-2 space-y-2">
              {thumbs.map((svgStr, i) => (
                <button key={i} onClick={() => go(i)} className={`block w-full rounded-lg overflow-hidden border-2 transition-colors ${i === current ? "border-amber-500" : "border-transparent hover:border-slate-600"}`}>
                  <img src={"data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr)} alt="" className="block w-full h-auto bg-white" />
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-auto flex items-start justify-center p-4">
            <div ref={slideRef} className="bg-white rounded-lg shadow-2xl w-full max-w-4xl min-h-[60vh]" />
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="flex items-center justify-center gap-3 bg-[#1A1D25] border-t border-slate-700/60 px-4 py-2.5 shrink-0">
          <button onClick={() => go(current - 1)} disabled={current <= 0} className="p-1.5 text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-slate-300 whitespace-nowrap">Slide {current + 1} de {total}</span>
          <button onClick={() => go(current + 1)} disabled={current >= total - 1} className="p-1.5 text-slate-300 hover:text-amber-300 rounded-lg hover:bg-white/5 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}