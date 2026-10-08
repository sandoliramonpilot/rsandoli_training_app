import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { can, getAccessLevel } from "@/lib/accessControl";
import {
  PILOT_LICENSE_TYPES, PILOT_LICENSE_SITUATIONS, PILOT_LICENSE_SITUATION_STYLES,
  PILOT_LICENSE_APPROVAL_STATUS, PILOT_LICENSE_VALIDITY_SOURCES,
  licenseSituationAuto, daysUntil,
} from "@/lib/pilotUtils";
import PilotLicenseForm from "./PilotLicenseForm";
import {
  Plus, Pencil, Trash2, Send, CheckCircle2, X, FileText, ShieldCheck,
  Loader2, AlertTriangle, XCircle,
} from "lucide-react";

export default function PilotLicensesSection({ pilot, isManager, onRefresh }) {
  const { user: me } = useAuth();
  const [licenses, setLicenses] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(null);
  const [toast, setToast] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const isGeral = getAccessLevel(me) === "admin_geral";
  // O próprio piloto pode gerenciar as licenças do seu cadastro (auto-atendimento).
  const isSelf = !!(
    me &&
    pilot &&
    ((pilot.user_id && me.id === pilot.user_id) ||
      (pilot.email && me.email && String(pilot.email).toLowerCase() === String(me.email).toLowerCase()))
  );
  const canEdit = isManager || isSelf;

  const load = useCallback(async () => {
    const list = await base44.entities.PilotLicense.filter({ pilot_id: pilot.id }).catch(() => []);
    setLicenses(list);
  }, [pilot.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const logAudit = async (action, details) => {
    try {
      await base44.entities.AccessAuditLog.create({
        actor_user_id: me?.id || null,
        actor_name: me?.full_name || me?.email || "Sistema",
        target_name: pilot.full_name,
        action: `Licença — ${action}`,
        details,
        created_at: new Date().toISOString(),
      });
    } catch {}
  };

  const handleSaved = async () => {
    setShowForm(false);
    setEditing(null);
    await load();
    onRefresh?.();
    setToast(editing ? "Licença atualizada com sucesso." : "Licença criada com sucesso.");
    await logAudit(editing ? "edição" : "criação", editing ? `Licença editada: ${editing.license_type_label || editing.license_type}` : `Nova licença criada`);
  };

  const handleDelete = async (lic) => {
    if (!confirm(`Excluir a licença "${lic.license_type_label || lic.license_type}"?`)) return;
    setBusy(lic.id);
    try {
      await base44.entities.PilotLicense.delete(lic.id);
      await logAudit("exclusão", `Licença excluída: ${lic.license_type_label || lic.license_type}`);
      await load();
      setToast("Licença excluída.");
    } catch (e) {
      setToast(e?.response?.data?.error || "Erro ao excluir.");
    }
    setBusy(null);
  };

  const sendForReview = async (lic) => {
    setBusy(lic.id);
    try {
      const log = JSON.parse(lic.approval_log || "[]");
      log.push({ action: "sent_review", by: me?.full_name || me?.email, at: new Date().toISOString() });
      await base44.entities.PilotLicense.update(lic.id, { approval_status: "pending_review", approval_log: JSON.stringify(log) });
      await logAudit("envio para conferência", `Licença enviada: ${lic.license_type_label || lic.license_type}`);
      await load();
      setToast("Licença enviada para conferência.");
    } catch (e) {
      setToast(e?.response?.data?.error || "Erro ao enviar.");
    }
    setBusy(null);
  };

  const approve = async (lic) => {
    setBusy(lic.id);
    try {
      const log = JSON.parse(lic.approval_log || "[]");
      log.push({ action: "approved", by: me?.full_name || me?.email, at: new Date().toISOString() });
      await base44.entities.PilotLicense.update(lic.id, {
        approval_status: "approved",
        reviewed_by: me?.full_name || me?.email,
        reviewed_at: new Date().toISOString(),
        review_decision: "approved",
        approval_log: JSON.stringify(log),
      });
      await logAudit("aprovação", `Licença aprovada: ${lic.license_type_label || lic.license_type}`);
      await load();
      setToast("Licença aprovada.");
    } catch (e) {
      setToast(e?.response?.data?.error || "Erro ao aprovar.");
    }
    setBusy(null);
  };

  const confirmReject = async () => {
    if (!rejecting) return;
    setBusy(rejecting.id);
    try {
      const log = JSON.parse(rejecting.approval_log || "[]");
      log.push({ action: "rejected", by: me?.full_name || me?.email, at: new Date().toISOString(), reason: rejectReason });
      await base44.entities.PilotLicense.update(rejecting.id, {
        approval_status: "rejected",
        reviewed_by: me?.full_name || me?.email,
        reviewed_at: new Date().toISOString(),
        review_decision: "rejected",
        review_justification: rejectReason,
        approval_log: JSON.stringify(log),
      });
      await logAudit("rejeição", `Licença rejeitada: ${rejecting.license_type_label || rejecting.license_type}${rejectReason ? ` — ${rejectReason}` : ""}`);
      await load();
      setToast("Licença rejeitada.");
    } catch (e) {
      setToast(e?.response?.data?.error || "Erro ao rejeitar.");
    }
    setBusy(null);
    setRejecting(null);
    setRejectReason("");
  };

  const openFile = async (uri) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri });
      window.open(signed_url, "_blank");
    } catch { alert("Não foi possível abrir o arquivo."); }
  };

  if (!licenses) {
    return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="space-y-3">
      {toast && (
        <div className="px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-center justify-between">
          {toast}
          <button onClick={() => setToast("")} className="text-amber-400 hover:text-amber-200"><X className="w-4 h-4" /></button>
        </div>
      )}

      {licenses.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhuma licença cadastrada. Clique em "Adicionar" para criar.</p>
      ) : (
        <div className="space-y-2">
          {licenses.map((lic) => {
            const sitAuto = licenseSituationAuto(lic);
            const sitStyle = PILOT_LICENSE_SITUATION_STYLES[sitAuto] || PILOT_LICENSE_SITUATION_STYLES.pending;
            const sitLabel = (PILOT_LICENSE_SITUATIONS.find((s) => s.id === sitAuto) || {}).label || sitAuto;
            const appr = PILOT_LICENSE_APPROVAL_STATUS[lic.approval_status] || PILOT_LICENSE_APPROVAL_STATUS.draft;
            const typeLabel = lic.license_type === "other" ? (lic.other_license_name || "Outra licença") : (lic.license_type_label || lic.license_type);
            const d = lic.expiry_date ? daysUntil(lic.expiry_date) : null;
            const isBusy = busy === lic.id;
            const canReview = isGeral || can(me, "pilotos", "aprovar");

            return (
              <div key={lic.id} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-100">{typeLabel}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${sitStyle}`}>{sitLabel}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${appr.style}`}>{appr.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-slate-500">
                      {lic.license_number && <span>Nº {lic.license_number}</span>}
                      {lic.category && <span>Cat: {lic.category}</span>}
                      {lic.authority && <span>{lic.authority}</span>}
                      {d !== null && (
                        <span className={d < 0 ? "text-rose-400" : d <= 90 ? "text-amber-400" : "text-emerald-400"}>
                          Validade: {new Date(lic.expiry_date).toLocaleDateString("pt-BR")} ({d < 0 ? `vencido há ${Math.abs(d)}d` : `${d}d`})
                        </span>
                      )}
                    </div>
                    {lic.description && <p className="text-xs text-slate-400 mt-1.5">{lic.description}</p>}
                    {lic.validity_source && (
                      <p className="text-[10px] text-slate-600 mt-1">
                        Validade: {(PILOT_LICENSE_VALIDITY_SOURCES.find((s) => s.id === lic.validity_source) || {}).label || lic.validity_source}
                        {lic.validity_source === "calculated" && lic.validity_rule && ` — ${lic.validity_rule}`}
                      </p>
                    )}
                    {lic.document_uri && (
                      <button onClick={() => openFile(lic.document_uri)} className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 mt-1.5">
                        <FileText className="w-3 h-3" /> {lic.document_name || "Abrir documento"}
                      </button>
                    )}
                    {lic.reviewed_by && (
                      <p className="text-[10px] text-slate-600 mt-1">Conferido por: {lic.reviewed_by}{lic.reviewed_at ? ` em ${new Date(lic.reviewed_at).toLocaleString("pt-BR")}` : ""}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-700/40">
                  {canEdit && (
                    <ActionBtn onClick={() => { setEditing(lic); setShowForm(true); }} icon={Pencil} label="Editar" />
                  )}
                  {canEdit && lic.approval_status === "draft" && (
                    <ActionBtn onClick={() => sendForReview(lic)} icon={Send} label="Enviar para conferência" busy={isBusy} tone="amber" />
                  )}
                  {canReview && lic.approval_status === "pending_review" && (
                    <>
                      <ActionBtn onClick={() => approve(lic)} icon={CheckCircle2} label="Aprovar" busy={isBusy} tone="emerald" />
                      <ActionBtn onClick={() => { setRejecting(lic); setRejectReason(""); }} icon={XCircle} label="Rejeitar" busy={isBusy} tone="rose" />
                    </>
                  )}
                  {isGeral && (
                    <ActionBtn onClick={() => handleDelete(lic)} icon={Trash2} label="Excluir" busy={isBusy} tone="rose" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {canEdit && (
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300">
          <Plus className="w-4 h-4" /> Adicionar licença
        </button>
      )}

      {showForm && (
        <PilotLicenseForm
          pilot={pilot}
          license={editing}
          existingLicenses={licenses}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}

      {rejecting && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 w-full max-w-md p-6 space-y-4">
            <h3 className="font-semibold text-slate-100">Rejeitar licença</h3>
            <p className="text-sm text-slate-400">Tem certeza que deseja rejeitar a licença "{rejecting.license_type_label || rejecting.license_type}"?</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Justificativa (opcional)…"
              className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setRejecting(null); setRejectReason(""); }} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-700/40">Cancelar</button>
              <button onClick={confirmReject} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25">
                <XCircle className="w-4 h-4" /> Confirmar rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ onClick, icon: Icon, label, busy, tone = "slate" }) {
  const tones = {
    slate: "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40",
    amber: "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10",
    emerald: "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10",
    rose: "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10",
  };
  return (
    <button onClick={onClick} disabled={busy} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-transparent transition-colors disabled:opacity-50 ${tones[tone]}`}>
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}