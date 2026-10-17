import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { useProfile } from "@/lib/ProfileContext";
import { OAT_CHANGE_TYPE_LABELS, OAT_CHANGE_STATUS_LABELS, safeParse } from "@/lib/oatUtils";

export default function OatApprovalsPanel({ onClose, onDecision }) {
  const { profileFilter } = useProfile();
  const [requests, setRequests] = useState(null);
  const [busy, setBusy] = useState(null);
  const [tab, setTab] = useState("pending");

  const load = () => {
    base44.entities.OatChangeRequest.filter(profileFilter, { sort: "-created_date", limit: 100 })
      .then((r) => setRequests(r.items)).catch(() => setRequests([]));
  };
  useEffect(() => { load(); }, [profileFilter]);

  const decide = async (req, status) => {
    setBusy(req.id);
    try {
      const me = await base44.auth.me().catch(() => null);
      const by = me ? me.full_name || me.email || me.id : "desconhecido";
      await base44.entities.OatChangeRequest.update(req.id, {
        status, reviewed_by: by, reviewed_at: new Date().toISOString(),
      });
      load();
      onDecision?.();
    } catch (e) {
      alert(e?.response?.data?.error || e?.data?.error || e.message || "Erro ao processar a solicitação.");
    }
    setBusy(null);
  };

  const all = requests || [];
  const pending = all.filter((r) => r.status === "pending");
  const list = tab === "pending" ? pending : all;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between z-10">
          <div>
            <h2 className="font-semibold text-lg text-slate-100">Central de Aprovações</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {pending.length > 0 ? `${pending.length} solicitação(ões) pendente(s)` : "Nenhuma pendência"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex gap-1 border-b border-slate-700/60">
            {[{ v: "pending", l: `Pendentes (${pending.length})` }, { v: "all", l: `Todas (${all.length})` }].map((t) => (
              <button
                key={t.v}
                onClick={() => setTab(t.v)}
                className={`px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors ${tab === t.v ? "text-amber-300 border-b-2 border-amber-500" : "text-slate-500 hover:text-slate-300"}`}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-5">
          {requests === null ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
          ) : list.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-3" />
              <p className="text-sm text-slate-500">{tab === "pending" ? "Tudo em dia — nenhuma solicitação pendente." : "Nenhuma solicitação registrada."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((r) => {
                const changes = safeParse(r.changes, {});
                const isBusy = busy === r.id;
                return (
                  <div key={r.id} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-200 truncate">{r.oat_name || "OAT"}</p>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${statusStyle(r.status)}`}>
                        {OAT_CHANGE_STATUS_LABELS[r.status] || r.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-600/50 text-slate-400 bg-slate-700/20">
                        {OAT_CHANGE_TYPE_LABELS[r.change_type] || r.change_type}
                      </span>
                      <span className="text-xs text-slate-500">Solicitado por {r.requested_by}</span>
                    </div>
                    {(changes.description || r.reason) && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                        {changes.description || r.reason}
                      </p>
                    )}
                    {r.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => decide(r, "approved")}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-50"
                        >
                          {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Aprovar
                        </button>
                        <button
                          onClick={() => decide(r, "rejected")}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" /> Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function statusStyle(status) {
  if (status === "pending") return "border-amber-500/30 text-amber-300 bg-amber-500/10";
  if (status === "approved") return "border-emerald-500/30 text-emerald-300 bg-emerald-500/10";
  if (status === "rejected") return "border-rose-500/30 text-rose-300 bg-rose-500/10";
  return "border-slate-500/30 text-slate-400 bg-slate-500/10";
}