import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, User as UserIcon, Lock, Plane, Check } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import InstallSection from "@/components/InstallSection";
import AppearanceSettings from "@/components/perfil/AppearanceSettings";
import { safeReturnTo } from "@/lib/authReturnTo";
import { getAccountStatus, firstAuthorizedPath, hasAnyAuthorizedModule, can } from "@/lib/accessControl";
import { setSelectedProfile } from "@/lib/aircraftProfile";

const LOGO_URL = "https://media.base44.com/images/public/6abbcee2e405be8f7f7ba4ef/8d21e7f79_Logo_APP.png";

const PROFILE_OPTIONS = [
  { id: "AW119", label: "AW119 Leonardo Helicopters", short: "AW119" },
  { id: "H125", label: "H125 Eurocopter", short: "H125" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfileState] = useState("");
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProfile) {
      setError("Selecione um perfil de aeronave para continuar.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Persiste o perfil selecionado antes do login para o ProfileContext usar
      setSelectedProfile(selectedProfile);

      await base44.auth.loginViaEmailPassword(email.trim(), password);
      const me = await base44.auth.me().catch(() => null);

      if (me && !["ativa", "convite_pendente"].includes(getAccountStatus(me))) {
        base44.auth.logout();
        setError("Sua conta está bloqueada ou desativada. Entre em contato com o administrador.");
        setLoading(false);
        return;
      }

      if (me) {
        try {
          await base44.auth.updateMe({ last_login_at: new Date().toISOString() });
          if (me.must_change_password) {
            window.location.href = "/perfil";
            return;
          }
        } catch {}

        // Redirecionamento: returnTo se for deep-link, senão Dashboard ou primeiro módulo autorizado
        if (!hasAnyAuthorizedModule(me)) {
          base44.auth.logout();
          setError("Seu usuário não possui módulos autorizados. Entre em contato com o administrador.");
          setLoading(false);
          return;
        }
        const dest = returnTo !== "/" ? returnTo : can(me, "dashboard", "visualizar") ? "/" : firstAuthorizedPath(me);
        window.location.href = dest;
      } else {
        window.location.href = returnTo;
      }
    } catch (err) {
      setError("Não foi possível realizar o acesso. Verifique suas credenciais e tente novamente.");
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    if (!selectedProfile) {
      setError("Selecione um perfil de aeronave para continuar.");
      return;
    }
    setSelectedProfile(selectedProfile);
    base44.auth.loginWithProvider("google", returnTo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#12141A] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo + Título */}
        <div className="text-center mb-8">
          <img
            src={LOGO_URL}
            alt="RSANDOLI PILOTS"
            className="w-20 h-20 rounded-2xl mx-auto mb-4 shadow-lg shadow-amber-500/20 object-cover"
          />
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            RSANDOLI PILOTS
          </h1>
          <p className="text-sm mt-1 text-slate-500 uppercase tracking-widest">Helicopter Training</p>
        </div>

        {/* Card de Login */}
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6 sm:p-8 shadow-xl">
          {/* Seleção de perfil de aeronave */}
          <div className="mb-5">
            <Label className="text-[11px] uppercase tracking-widest text-slate-500 mb-2.5 block">
              Perfil da aeronave
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {PROFILE_OPTIONS.map((opt) => {
                const active = selectedProfile === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { setSelectedProfileState(opt.id); setError(""); }}
                    className={`relative flex flex-col items-center gap-2 px-3 py-4 rounded-xl border-2 transition-all ${
                      active
                        ? "border-amber-500 bg-amber-500/10 text-amber-300"
                        : "border-slate-700/60 bg-[#12141A] text-slate-400 hover:border-slate-600 hover:text-slate-300"
                    }`}
                  >
                    {active && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-slate-900" />
                      </span>
                    )}
                    <Plane className={`w-6 h-6 ${active ? "text-amber-400" : "text-slate-500"}`} />
                    <span className="text-xs font-semibold leading-tight text-center">{opt.short}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium mb-4 bg-transparent border-slate-700/60 text-slate-300 hover:bg-slate-800/50 hover:text-white"
            onClick={handleGoogle}
          >
            <GoogleIcon className="w-4 h-4 mr-2" />
            Entrar com Google
          </Button>

          {/* Divisor */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1A1D25] px-3 text-slate-600">ou</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {error}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-400 text-xs">E-mail</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-[#12141A] border-slate-700/60 text-slate-200 placeholder:text-slate-600"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-400 text-xs">Senha</Label>
                <Link to="/forgot-password" className="text-xs hover:underline text-amber-400 hover:text-amber-300">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-[#12141A] border-slate-700/60 text-slate-200 placeholder:text-slate-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-semibold rounded-lg shadow-md transition-all hover:opacity-90 bg-amber-500 hover:bg-amber-400 text-slate-900"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Footer do card */}
          <p className="text-center text-sm mt-5 text-slate-500">
            Não tem uma conta?{" "}
            <Link
              to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
              className="font-medium hover:underline text-amber-400 hover:text-amber-300"
            >
              Criar conta
            </Link>
          </p>
        </div>

        <div className="mt-5">
          <AppearanceSettings />
        </div>

        {/* Seção de Instalação */}
        <InstallSection />
      </div>
    </div>
  );
}