import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  X, CheckCircle2, Loader2, MailCheck, Users, Plane, Hourglass, HeartPulse,
  ChevronDown, ChevronUp, AlertTriangle,
} from "lucide-react";
import { ACCESS_LEVEL_LABELS } from "@/lib/accessControl";
import { ROLE_LABELS } from "@/lib/pilotUtils";
import { OAT_FUNCTION_LABELS, OAT_REGISTRATION_STATUS_LABELS } from "@/lib/oatUtils";

export default function ApprovalsPanel({ onClose, onDecision }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null); // { type, id, action }
  const [expanded, setExpanded] = useState(null); // { type, id }
  const [rejectReason, setRejectReason] = useState({});
  const [toast, setToast] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageUsers", { action: "list_approvals" });
      setData(res.data);
    } catch {
      setData({ invites: [], pilots: [], aircraft: [], oats: [] });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const approve = async (type, id) => {
    setBusy({ type, id, action: "approve" });
    try {
      const actionMap = {
        user_invite: "approve_invite",
        pilot: "approve_pilot",
        aircraft: "approve_aircraft",
        oat: "approve_oat",
      };
      const idField = type === "user_invite" ? "invite_id" : type === "pilot" ? "pilot_id" : type === "oat" ? "oat_id" : "aircraft_id";
      const res = await base44.functions.invoke("manageUsers", { action: actionMap[type], [idField]: id });
      setToast(res.data?.message || "Aprovado.");
      await load();
      onDecision?.();
    } catch (e) {
      setToast(e?.response?.data?.error || e.message || "Erro ao aprovar.");
    }
    setBusy(null);
  };

  const reject = async (type, id) => {
    const reason = rejectReason[`${type}_${id}`] || "";
    setBusy({ type, id, action: "reject" });
    try {
      const actionMap = {
        user_invite: "reject_invite",
        pilot: "reject_pilot",
        aircraft: "reject_aircraft",
        oat: "reject_oat",
      };
      const idField = type === "user_invite" ? "invite_id" : type === "pilot" ? "pilot_id" : type === "oat" ? "oat_id" : "aircraft_id";
      const res = await base44.functions.invoke("manageUsers", { action: actionMap[type], [idField]: id, reason });
      setToast(res.data?.message || "Rejeitado.");
      setRejectReason((r) => { const n = { ...r }; delete n[`${type}_${id}`]; return n; });
      setExpanded((e) => e?.type === type && e?.id === id ? null : e);
      await load();
      onDecision?.();
    } catch (e) {
      setToast(e?.response?.data?.error || e.message || "Erro ao rejeitar.");
    }
    setBusy(null);
  };

  const total = (data?.invites?.length || 0) + (data?.pilots?.length || 0) + (data?.aircraft?.length || 0) + (data?.oats?.length || 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 w-full max-w-3xl my-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 sticky top-0 bg-[#1A1D25] z-10">
          <div>
            <h2 className="font-semibold text-lg text-slate-100">Aprovações Pendentes</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {total > 0 ? `${total} item(ns) aguardando aprovação` : "Nenhuma aprovação pendente"}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-center justify-between">
            {toast}
            <button onClick={() => setToast("")} className="text-amber-400 hover:text-amber-200"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
          ) : total === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Tudo em dia — nenhuma aprovação pendente.</p>
            </div>
          ) : (
            <>
              {/* USER INVITES */}
              {data.invites.length > 0 && (
                <Section title="Convites de Usuário" icon={MailCheck} count={data.invites.length}>
                  {data.invites.map((inv) => (
                    <ApprovalCard
                      key={`inv_${inv.id}`}
                      item={inv}
                      type="user_invite"
                      busy={busy}
                      expanded={expanded}
                      setExpanded={setExpanded}
                      rejectReason={rejectReason}
                      setRejectReason={setRejectReason}
                      onApprove={() => approve("user_invite", inv.id)}
                      onReject={() => reject("user_invite", inv.id)}
                      renderDetails={() => (
                        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <Detail label="E-mail" value={inv.email} />
                          <Detail label="Login" value={inv.login} />
                          <Detail label="Nível de acesso" value={ACCESS_LEVEL_LABELS[inv.access_level] || inv.access_level} />
                          <Detail label="Matrícula" value={inv.registration} />
                          <Detail label="Unidade" value={inv.unit} />
                          <Detail label="Função" value={inv.job_title} />
                          <Detail label="Solicitado por" value={inv.invited_by_name} />
                          <Detail label="Data" value={inv.created_at ? new Date(inv.created_at).toLocaleString("pt-BR") : "—"} />
                        </div>
                      )}
                    />
                  ))}
                </Section>
              )}

              {/* PILOTS */}
              {data.pilots.length > 0 && (
                <Section title="Cadastro de Pilotos" icon={Users} count={data.pilots.length}>
                  {data.pilots.map((p) => (
                    <ApprovalCard
                      key={`pilot_${p.id}`}
                      item={{ ...p, name: p.name }}
                      type="pilot"
                      busy={busy}
                      expanded={expanded}
                      setExpanded={setExpanded}
                      rejectReason={rejectReason}
                      setRejectReason={setRejectReason}
                      onApprove={() => approve("pilot", p.id)}
                      onReject={() => reject("pilot", p.id)}
                      renderDetails={() => (
                        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <Detail label="Nome de guerra" value={p.war_name} />
                          <Detail label="Função" value={ROLE_LABELS[p.role] || p.role} />
                          <Detail label="E-mail" value={p.email} />
                          <Detail label="Base" value={p.base} />
                          <Detail label="CANAC" value={p.anac_code} />
                          <Detail label="#CANAC/CPF" value={p.registration} />
                          <Detail label="Criado em" value={p.created_date ? new Date(p.created_date).toLocaleString("pt-BR") : "—"} />
                        </div>
                      )}
                    />
                  ))}
                </Section>
              )}

              {/* AIRCRAFT */}
              {data.aircraft.length > 0 && (
                <Section title="Cadastro de Aeronaves" icon={Plane} count={data.aircraft.length}>
                  {data.aircraft.map((a) => (
                    <ApprovalCard
                      key={`ac_${a.id}`}
                      item={{ ...a, name: `${a.name} — ${a.model || ""}` }}
                      type="aircraft"
                      busy={busy}
                      expanded={expanded}
                      setExpanded={setExpanded}
                      rejectReason={rejectReason}
                      setRejectReason={setRejectReason}
                      onApprove={() => approve("aircraft", a.id)}
                      onReject={() => reject("aircraft", a.id)}
                      renderDetails={() => (
                        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <Detail label="Matrícula" value={a.name} />
                          <Detail label="Modelo" value={a.model} />
                          <Detail label="Fabricante" value={a.manufacturer} />
                          <Detail label="Ano" value={a.year} />
                          <Detail label="Status operacional" value={a.status} />
                          <Detail label="Criado em" value={a.created_date ? new Date(a.created_date).toLocaleString("pt-BR") : "—"} />
                        </div>
                      )}
                    />
                  ))}
                </Section>
              )}

              {/* OATS */}
              {data.oats.length > 0 && (
                <Section title="Cadastro de OATs" icon={HeartPulse} count={data.oats.length}>
                  {data.oats.map((o) => (
                    <ApprovalCard
                      key={`oat_${o.id}`}
                      item={{ ...o, name: o.name }}
                      type="oat"
                      busy={busy}
                      expanded={expanded}
                      setExpanded={setExpanded}
                      rejectReason={rejectReason}
                      setRejectReason={setRejectReason}
                      onApprove={() => approve("oat", o.id)}
                      onReject={() => reject("oat", o.id)}
                      renderDetails={() => (
                        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <Detail label="Nome de guerra" value={o.war_name} />
                          <Detail label="Função" value={OAT_FUNCTION_LABELS[o.role] || o.role} />
                          <Detail label="E-mail" value={o.email} />
                          <Detail label="Base" value={o.base} />
                          <Detail label="CANAC" value={o.anac_code} />
                          <Detail label="Situação cadastral" value={OAT_REGISTRATION_STATUS_LABELS[o.registration_status] || o.registration_status} />
                          <Detail label="Criado em" value={o.created_date ? new Date(o.created_date).toLocaleString("pt-BR") : "—"} />
                        </div>
                      )}
                    />
                  ))}
                </Section>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/60 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700/40">Fechar</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, count, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ApprovalCard({ item, type, busy, expanded, setExpanded, rejectReason, setRejectReason, onApprove, onReject, renderDetails }) {
  const isBusy = busy?.type === type && busy?.id === item.id;
  const isExpanded = expanded?.type === type && expanded?.id === item.id;
  const reasonKey = `${type}_${item.id}`;

  return (
    <div className="rounded-xl border border-slate-700/60 bg-[#12141A] overflow-hidden">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-100 truncate">{item.name}</p>
            <p className="text-xs text-slate-500 truncate">
              {type === "user_invite" ? item.email : type === "pilot" ? item.email || item.base : `${item.model || ""} ${item.manufacturer || ""}`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setExpanded(isExpanded ? null : { type, id: item.id })}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-0.5"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {isExpanded ? "Menos" : "Detalhes"}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-700/40">
            {renderDetails()}
            {item.admin_notes && (
              <p className="mt-2 text-xs text-slate-400 bg-slate-700/20 rounded-lg px-3 py-2">
                <strong>Obs.:</strong> {item.admin_notes}
              </p>
            )}
          </div>
        )}

        {/* Reject reason input */}
        {isExpanded && (
          <div className="mt-3">
            <input
              type="text"
              value={rejectReason[reasonKey] || ""}
              onChange={(e) => setRejectReason((r) => ({ ...r, [reasonKey]: e.target.value }))}
              placeholder="Motivo da rejeição (opcional)…"
              className="w-full px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onApprove}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-50"
          >
            {isBusy?.action === "approve" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Aprovar
          </button>
          <button
            onClick={onReject}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 disabled:opacity-50"
          >
            {isBusy?.action === "reject" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
            Rejeitar
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between gap-2 py-0.5">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-300 text-right truncate">{value || "—"}</span>
    </div>
  );
}