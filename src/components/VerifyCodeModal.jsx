import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Loader2, X } from "lucide-react";

/**
 * Modal de verificação por código de acesso para operações sensíveis.
 * onVerified(operation) é chamado após validação bem-sucedida.
 */
// Chaves devem ser idênticas a SENSITIVE_OPERATIONS em base44/shared/accessSecurity.js.
const OPERATION_LABELS = {
  change_account_status: "Alteração da situação da conta",
  change_access_level: "Alteração de nível de acesso",
  change_permissions: "Alteração de permissões",
  set_master: "Concessão de perfil Master",
  reset_password: "Redefinição de senha",
};
export default function VerifyCodeModal({ operation, onVerified, onClose }) {
  const [code, setCode] = useState("");
  const [masked, setMasked] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(true);
  const [wait, setWait] = useState(0);
  const [expiresIn, setExpiresIn] = useState(5);
  const sentOnce = useRef(false);

  const send = async () => {
    setError("");
    setInfo("");
    setSending(true);
    try {
      const res = await base44.functions.invoke("accessCode", { action: "send", purpose: "sensitive_op", operation });
      setMasked(res.data.masked);
      setExpiresIn(res.data.expiresInMinutes || 5);
      setWait(60);
    } catch (e) {
      const data = e?.response?.data || {};
      if (data.waitSeconds) { setWait(data.waitSeconds); setMasked(data.masked || ""); }
      else setError(data.error || "Não foi possível enviar o código.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (sentOnce.current) return; // evita dois envios no modo de desenvolvimento (StrictMode)
    sentOnce.current = true;
    send();
  }, []);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setInterval(() => setWait((w) => Math.max(0, w - 1)), 1000);
    return () => clearInterval(t);
  }, [wait]);

  const verify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // A verificação do código agora é feita no backend pela própria operação sensível.
      const err = await onVerified(code);
      if (err) setError(typeof err === "string" ? err : "Código inválido ou operação não concluída.");
    } catch (err) {
      // O SDK lança erro genérico ("Request failed with status code 403"). A mensagem
      // útil do backend vem em response.data.error.
      setError(err?.response?.data?.error || err?.message || "Código inválido ou operação não concluída.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-100">Verificação de acesso</h2>
              <p className="text-xs text-slate-500">{OPERATION_LABELS[operation] || "Operação sensível"}</p>            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>

        {sending ? (
          <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Enviando código…
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-400 mb-4">
              Enviamos um código para <span className="text-amber-300">{masked || "seu e-mail"}</span>. Ele é válido por {expiresIn} minutos.
            </p>
            {error && <div className="mb-3 px-3 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{error}</div>}
            {info && <div className="mb-3 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">{info}</div>}
            <form onSubmit={verify} className="space-y-4">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Código de 6 dígitos"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="bg-[#12141A] border-slate-700/60 text-center text-lg tracking-[0.4em] font-mono"
                autoFocus
                required
              />
              <Button type="submit" disabled={loading || code.length !== 6} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Confirmar código
              </Button>
            </form>
            <div className="flex items-center justify-between mt-4 text-xs">
              <button
                type="button"
                disabled={wait > 0}
                onClick={send}
                className="text-amber-400 hover:text-amber-300 disabled:text-slate-600 disabled:cursor-not-allowed"
              >
                {wait > 0 ? `Reenviar código (${wait}s)` : "Reenviar código"}
              </button>
              <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-300">Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}