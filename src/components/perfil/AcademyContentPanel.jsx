import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AcademyContentReviewModal from "./AcademyContentReviewModal";
import {
  GraduationCap, CheckCircle2, Loader2, X, FileText, BookOpen,
  Pencil,
} from "lucide-react";

const ENTITY_ICONS = {
  training_doc: GraduationCap,
  library_doc: BookOpen,
};

export default function AcademyContentPanel({ user }) {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [reviewItem, setReviewItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("approveAcademyContent", { action: "list" });
      setItems(res.data?.items || []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const approveAll = async () => {
    if (!items || items.length === 0) return;
    if (!confirm(`Aprovar todos os ${items.length} conteúdo(s) pendente(s) da Academy?`)) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke("approveAcademyContent", { action: "approve_all" });
      setToast(res.data?.message || "Conteúdos aprovados.");
      await load();
    } catch (e) {
      setToast(e?.response?.data?.error || e.message || "Erro ao aprovar em lote.");
    }
    setBusy(false);
  };

  const openDocument = async (uri) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri });
      window.open(signed_url, "_blank");
    } catch {
      alert("Não foi possível abrir o documento.");
    }
  };

  const openReview = (item) => setReviewItem(item);
  const closeReview = () => setReviewItem(null);

  const total = items?.length || 0;

  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="font-semibold text-slate-100">Conteúdo da Academy aguardando aprovação</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading ? "Carregando…" : total > 0 ? `${total} conteúdo(s) aguardando aprovação` : "Nenhum conteúdo pendente"}
            </p>
          </div>
        </div>
        {total > 0 && (
          <button
            onClick={approveAll}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Aprovar todos ({total})
          </button>
        )}
      </div>

      {toast && (
        <div className="mt-3 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-center justify-between">
          {toast}
          <button onClick={() => setToast("")} className="text-amber-400 hover:text-amber-200"><X className="w-4 h-4" /></button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
      ) : total === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Tudo em dia — nenhum conteúdo da Academy pendente.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2 max-h-[28rem] overflow-y-auto pr-1">
          {items.map((item) => {
            const Icon = ENTITY_ICONS[item.entity_key] || FileText;
            return (
              <div key={`${item.entity_key}_${item.id}`} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-3 hover:border-amber-500/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => openReview(item)} className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{item.entity_label}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-100 mt-1 truncate">{item.title}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500">
                      {item.location && <span>{item.location_label}: {item.location}</span>}
                      {item.uploaded_by && <span>Por: {item.uploaded_by}</span>}
                      {item.file_type && <span className="uppercase">{item.file_type}</span>}
                    </div>
                  </button>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.file_uri && (
                      <button
                        onClick={() => openDocument(item.file_uri)}
                        title="Abrir documento"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => openReview(item)}
                      title="Revisar item"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Revisar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewItem && (
        <AcademyContentReviewModal
          item={reviewItem}
          onClose={closeReview}
          onDone={load}
        />
      )}
    </div>
  );
}