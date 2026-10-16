import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck, CheckCircle2, Loader2, X, ExternalLink, FileText,
  BadgeCheck, Award, FileBadge, Stamp, Plane,
} from "lucide-react";

const ENTITY_ICONS = {
  license: BadgeCheck,
  qualification: Award,
  operational_auth: ShieldCheck,
  habilitacao: FileBadge,
  endorsement: Plane,
};

export default function TechnicalValidationsPanel({ user }) {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [toast, setToast] = useState("");
  const [showList, setShowList] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("approveTechnicalValidations", { action: "list" });
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

  const approveOne = async (item) => {
    setApprovingId(`${item.entity_key}_${item.id}`);
    try {
      const res = await base44.functions.invoke("approveTechnicalValidations", {
        action: "approve_one",
        entity_key: item.entity_key,
        id: item.id,
      });
      setToast(res.data?.message || "Validação aprovada.");
      await load();
    } catch (e) {
      setToast(e?.response?.data?.error || e.message || "Erro ao aprovar.");
    }
    setApprovingId(null);
  };

  const approveAll = async () => {
    if (!items || items.length === 0) return;
    if (!confirm(`Aprovar todas as ${items.length} validação(ões) técnicas pendentes?`)) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke("approveTechnicalValidations", { action: "approve_all" });
      setToast(res.data?.message || "Validações aprovadas.");
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

  const goToPilot = (pilotId) => {
    if (pilotId) navigate(`/pilots?pilot_id=${pilotId}`);
  };

  const total = items?.length || 0;

  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="font-semibold text-slate-100">Validações técnicas pendentes</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading ? "Carregando…" : total > 0 ? `${total} validação(ões) aguardando conferência` : "Nenhuma validação pendente"}
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
            Aprovar todas ({total})
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
          <p className="text-sm text-slate-500">Tudo em dia — nenhuma validação técnica pendente.</p>
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowList((s) => !s)}
            className="mt-4 text-xs text-amber-400 hover:text-amber-300"
          >
            {showList ? "Ocultar lista" : "Ver lista individual"}
          </button>

          {showList && (
            <div className="mt-3 space-y-2 max-h-96 overflow-y-auto pr-1">
              {items.map((item) => {
                const Icon = ENTITY_ICONS[item.entity_key] || FileText;
                const isBusy = approvingId === `${item.entity_key}_${item.id}`;
                return (
                  <div key={`${item.entity_key}_${item.id}`} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{item.entity_label}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-100 mt-1 truncate">{item.label}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500">
                          {item.pilot_name && <span>{item.pilot_name}</span>}
                          {item.number && <span>Nº {item.number}</span>}
                          {item.expiry_date && <span>Validade: {new Date(item.expiry_date).toLocaleDateString("pt-BR")}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.document_uri && (
                          <button
                            onClick={() => openDocument(item.document_uri)}
                            title="Abrir documento"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {item.pilot_id && (
                          <button
                            onClick={() => goToPilot(item.pilot_id)}
                            title="Abrir perfil do piloto"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/10"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => approveOne(item)}
                          disabled={isBusy}
                          title="Aprovar"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-50"
                        >
                          {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Aprovar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}