import React, { useMemo, useState } from "react";
import { X, ShieldCheck, Check, XCircle, RotateCcw, Search, Loader2, BadgeCheck, Clock, AlertTriangle } from "lucide-react";
import { QRH_H125_VARIANT_KEYS, getQrhH125Data, VALIDATION_STATUS_META } from "@/lib/qrhH125Data";
import { useQrhValidation } from "@/lib/useQrhValidation";

// Painel de validacao do QRH H125: o Administrador Geral revisa e aprova /
// reprova / reabre cada procedimento por variante.
export default function QrhValidationPanel({ variantId, onClose }) {
  const variantKey = QRH_H125_VARIANT_KEYS[variantId] || "B2";
  const data = useMemo(() => getQrhH125Data(variantKey), [variantKey]);
  const { validationMap, saving, setStatus, approveAll, reload } = useQrhValidation(variantKey);
  const [query, setQuery] = useState("");
  const [justifying, setJustifying] = useState(null); // { proc, status }
  const [toast, setToast] = useState(null);

  const procedures = useMemo(() => {
    const all = [...data.emergencias, ...data.normais];
    const q = query.trim().toLowerCase();
    return q ? all.filter((p) => p.n.toLowerCase().includes(q) || p.g.toLowerCase().includes(q)) : all;
  }, [data, query]);

  const grouped = useMemo(() => {
    const byCat = {};
    procedures.forEach((p) => {
      if (!byCat[p.g]) byCat[p.g] = [];
      byCat[p.g].push(p);
    });
    return byCat;
  }, [procedures]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const handleDecision = async (proc, status, justification) => {
    const res = await setStatus(proc, status, justification);
    if (res.ok) flash(res.message || "Atualizado.");
    else flash(res.error || "Falha.");
    setJustifying(null);
  };

  const handleApproveAll = async () => {
    const res = await approveAll();
    if (res.ok) flash(`${res.count} procedimento(s) aprovado(s).`);
    else flash(res.error || "Falha.");
  };

  const pendingCount = [...data.emergencias, ...data.normais]
    .filter((p) => (validationMap[p.procedure_key]?.status || "pending") === "pending").length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-3xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 px-6 py-4 border-b border-slate-700/60 bg-[#1A1D25]/95 backdrop-blur flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-amber-500/30 bg-amber-500/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-slate-100">Validação do QRH · {data.short}</h2>
              <p className="text-xs text-slate-400">Revisão técnica do conteúdo transcrito · {data.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-200 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        {/* Aviso */}
        <div className="px-6 py-3 border-b border-slate-700/60 bg-amber-500/5 flex items-start gap-2 text-xs text-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>Esta validação atesta a conferência do conteúdo transcrito contra o RFM/POH vigente. Conteúdo aprovado permanece com o aviso de referência operacional a bordo.</p>
        </div>

        {/* Barra de ações */}
        <div className="px-6 py-3 border-b border-slate-700/60 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar procedimento…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/40"
            />
          </div>
          <span className="text-xs text-slate-400 inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {pendingCount} pendente(s)</span>
          <button
            onClick={handleApproveAll}
            disabled={saving || pendingCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Aprovar pendentes
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {Object.entries(grouped).map(([cat, procs]) => (
            <section key={cat}>
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">{cat}</h3>
              <div className="space-y-2">
                {procs.map((p) => {
                  const st = validationMap[p.procedure_key]?.status || "pending";
                  const meta = VALIDATION_STATUS_META[st];
                  const isJustifying = justifying?.proc?.procedure_key === p.procedure_key;
                  return (
                    <div key={p.procedure_key} className="rounded-lg border border-slate-700/60 bg-[#12141A] px-3.5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-100 truncate">{p.n}</p>
                          {p.c && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.c}</p>}
                          {validationMap[p.procedure_key]?.reviewed_by && st !== "pending" && (
                            <p className="text-[10px] text-slate-600 mt-1">
                              {validationMap[p.procedure_key].reviewed_by}
                              {validationMap[p.procedure_key].reviewed_at ? ` · ${new Date(validationMap[p.procedure_key].reviewed_at).toLocaleDateString("pt-BR")}` : ""}
                            </p>
                          )}
                        </div>
                        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </div>

                      {isJustifying ? (
                        <div className="mt-2.5 space-y-2">
                          <textarea
                            autoFocus
                            value={justifying.text}
                            onChange={(e) => setJustifying((j) => ({ ...j, text: e.target.value }))}
                            placeholder="Justificativa da decisão…"
                            rows={2}
                            className="w-full px-2.5 py-1.5 rounded-md bg-[#0D141C] border border-slate-700/60 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDecision(p, justifying.status, justifying.text.trim())}
                              disabled={saving || !justifying.text.trim()}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500 text-slate-900 disabled:opacity-40"
                            >
                              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Confirmar
                            </button>
                            <button onClick={() => setJustifying(null)} className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            onClick={() => handleDecision(p, "approved", "")}
                            disabled={saving}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors"
                          >
                            <BadgeCheck className="w-3 h-3" /> Aprovar
                          </button>
                          <button
                            onClick={() => setJustifying({ proc: p, status: "rejected", text: "" })}
                            disabled={saving}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/20 hover:bg-rose-500/25 disabled:opacity-40 transition-colors"
                          >
                            <XCircle className="w-3 h-3" /> Reprovar
                          </button>
                          {st !== "pending" && (
                            <button
                              onClick={() => setJustifying({ proc: p, status: "pending", text: "" })}
                              disabled={saving}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" /> Reabrir
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {toast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 shadow-xl">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}