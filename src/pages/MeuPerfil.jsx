import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ACCESS_LEVEL_LABELS, ACCOUNT_STATUS_LABELS, getAccessLevel, getAccountStatus } from "@/lib/accessControl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TechnicalValidationsPanel from "@/components/perfil/TechnicalValidationsPanel";
import { UserCircle, Loader2, Eye, EyeOff, Camera, ShieldCheck } from "lucide-react";

const PASSWORD_RULES = [
  { id: "len", label: "Mínimo de 8 caracteres", test: (v) => v.length >= 8 },
  { id: "upper", label: "Pelo menos uma letra maiúscula", test: (v) => /[A-Z]/.test(v) },
  { id: "lower", label: "Pelo menos uma letra minúscula", test: (v) => /[a-z]/.test(v) },
  { id: "num", label: "Pelo menos um número", test: (v) => /\d/.test(v) },
  { id: "special", label: "Pelo menos um caractere especial", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export default function MeuPerfil() {
  const { user, checkUserAuth } = useAuth();
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoUri, setPhotoUri] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setPhotoUri(user.photo_uri || "");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const level = getAccessLevel(user);
  const status = getAccountStatus(user);
  const isAdmin = level === "admin_geral" || level === "administrador";

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setPhotoUri(file_uri);
      await base44.auth.updateMe({ photo_uri: file_uri });
      await checkUserAuth();
      setMsg("Foto de perfil atualizada.");
    } catch (err) {
      setError("Não foi possível enviar a foto.");
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMsg("");
    try {
      await base44.auth.updateMe({ phone: phone.trim() });
      await checkUserAuth();
      setMsg("Perfil atualizado com sucesso.");
    } catch (err) {
      setError("Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwdError("");
    setPwdMsg("");
    if (newPwd !== confirmPwd) {
      setPwdError("A nova senha e a confirmação não coincidem.");
      return;
    }
    if (newPwd.trim() !== newPwd || newPwd.startsWith(" ") || newPwd.endsWith(" ")) {
      setPwdError("A senha não pode começar ou terminar com espaços.");
      return;
    }
    const login = (user.login || user.email || "").toLowerCase();
    if (newPwd.toLowerCase() === login) {
      setPwdError("A senha não pode ser igual ao login.");
      return;
    }
    const failed = PASSWORD_RULES.filter((r) => !r.test(newPwd));
    if (failed.length) {
      setPwdError("A nova senha não atende aos requisitos mínimos.");
      return;
    }
    setPwdSaving(true);
    try {
      await base44.auth.changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      await base44.functions.invoke("completePasswordChange", {});
      await checkUserAuth();
      setPwdMsg("Senha alterada com sucesso.");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err) {
      setPwdError(err?.message || "Não foi possível alterar a senha. Verifique a senha atual.");
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Conta</p>
        <h1 className="text-3xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Meu Perfil</h1>
        <p className="text-slate-400 mt-2 text-sm">Seus dados e configurações de acesso.</p>
      </header>

      {/* Dados */}
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 flex items-center justify-center overflow-hidden">
              {photoUri ? (
                <span className="text-2xl font-bold text-amber-300">{(user.full_name || "?").slice(0, 2).toUpperCase()}</span>
              ) : (
                <UserCircle className="w-12 h-12 text-amber-400/60" />
              )}
            </div>
            <label className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> Alterar foto
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>
          <div className="flex-1 grid sm:grid-cols-2 gap-4">
            <Info label="Nome completo" value={user.full_name} />
            <Info label="E-mail" value={user.email} />
            <Info label="Login" value={user.login || "—"} />
            <Info label="Matrícula" value={user.registration || "—"} />
            <Info label="Função / cargo" value={user.job_title || "—"} />
            <Info label="Unidade" value={user.unit || "—"} />
            <Info label="Nível de acesso" value={ACCESS_LEVEL_LABELS[level] || level} badge />
            <Info label="Situação da conta" value={ACCOUNT_STATUS_LABELS[status] || status} badge />
            <Info label="Último acesso" value={user.last_login_at ? new Date(user.last_login_at).toLocaleString("pt-BR") : "—"} />
          </div>
        </div>

        <form onSubmit={saveProfile} className="mt-6 pt-6 border-t border-slate-700/60 space-y-4">
          {msg && <div className="px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">{msg}</div>}
          {error && <div className="px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{error}</div>}
          <div className="max-w-sm space-y-1.5">
            <Label className="text-slate-400 text-xs">Telefone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-[#12141A] border-slate-700/60" />
          </div>
          <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-400 text-slate-900">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar perfil
          </Button>
        </form>
      </div>

      {/* Validações técnicas pendentes (admin) */}
      {isAdmin && <TechnicalValidationsPanel user={user} />}

      {/* Alterar senha */}
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6">
        <h2 className="font-semibold text-slate-100 mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-400" /> Alterar senha</h2>
        {pwdMsg && <div className="mb-4 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">{pwdMsg}</div>}
        {pwdError && <div className="mb-4 px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{pwdError}</div>}
        <form onSubmit={changePassword} className="space-y-4 max-w-md">
          <PasswordField label="Senha atual" value={currentPwd} onChange={setCurrentPwd} show={showPwd.current} onToggle={() => setShowPwd((s) => ({ ...s, current: !s.current }))} autoComplete="current-password" />
          <PasswordField label="Nova senha" value={newPwd} onChange={setNewPwd} show={showPwd.new} onToggle={() => setShowPwd((s) => ({ ...s, new: !s.new }))} autoComplete="new-password" />
          <PasswordField label="Confirmar nova senha" value={confirmPwd} onChange={setConfirmPwd} show={showPwd.confirm} onToggle={() => setShowPwd((s) => ({ ...s, confirm: !s.confirm }))} autoComplete="new-password" />
          <div className="rounded-lg bg-[#12141A] border border-slate-700/60 p-3 space-y-1">
            {PASSWORD_RULES.map((r) => {
              const ok = r.test(newPwd);
              return (
                <p key={r.id} className={`text-xs flex items-center gap-2 ${ok ? "text-emerald-400" : "text-slate-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-slate-600"}`} />
                  {r.label}
                </p>
              );
            })}
          </div>
          <Button type="submit" disabled={pwdSaving} className="bg-amber-500 hover:bg-amber-400 text-slate-900">
            {pwdSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Alterar senha
          </Button>
        </form>
      </div>
    </div>
  );
}

function Info({ label, value, badge }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
      {badge ? (
        <span className="inline-block mt-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">{value}</span>
      ) : (
        <p className="text-sm text-slate-200 mt-0.5">{value || "—"}</p>
      )}
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, autoComplete }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-400 text-xs">{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="bg-[#12141A] border-slate-700/60 pr-10"
          required
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}