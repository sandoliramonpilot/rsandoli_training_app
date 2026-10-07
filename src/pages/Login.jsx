import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, User as UserIcon, Lock } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import InstallSection from "@/components/InstallSection";
import { safeReturnTo } from "@/lib/authReturnTo";
import { getAccountStatus } from "@/lib/accessControl";

const LOGO_URL = "https://media.base44.com/images/public/6abbcee2e405be8f7f7ba4ef/8d21e7f79_Logo_APP.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
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
      }
      window.location.href = returnTo;
    } catch (err) {
      setError("Não foi possível realizar o acesso. Verifique suas credenciais e tente novamente.");
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", returnTo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo + Título */}
        <div className="text-center mb-8">
          <img
            src={LOGO_URL}
            alt="RSandoli_Training"
            className="w-20 h-20 rounded-2xl mx-auto mb-4 shadow-lg object-cover"
          />
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#333333", fontFamily: "Inter, Roboto, system-ui, sans-serif" }}>
            RSandoli_Training
          </h1>
          <p className="text-sm mt-1" style={{ color: "#B0BEC5" }}>Acesse sua conta</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-lg border p-8" style={{ borderColor: "#F2F2F2" }}>
          {/* Google */}
          <Button
            variant="outline"
            className="w-full h-12 text-sm font-medium mb-5"
            style={{ borderColor: "#B0BEC5", color: "#333333" }}
            onClick={handleGoogle}
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            Entrar com Google
          </Button>

          {/* Divisor */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: "#F2F2F2" }} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3" style={{ color: "#B0BEC5" }}>ou</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#FF6B6B15", color: "#FF6B6B" }}>
              {error}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: "#333333" }}>Usuário</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#B0BEC5" }} aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  style={{ borderColor: "#B0BEC5", color: "#333333" }}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" style={{ color: "#333333" }}>Senha</Label>
                <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: "#0056A3" }}>
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#B0BEC5" }} aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  style={{ borderColor: "#B0BEC5", color: "#333333" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
                  style={{ color: "#B0BEC5" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 font-medium text-white rounded-lg shadow-md transition-all hover:opacity-90"
              style={{ background: "#007AFF", borderRadius: "8px" }}
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
          <p className="text-center text-sm mt-5" style={{ color: "#B0BEC5" }}>
            Não tem uma conta?{" "}
            <Link
              to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
              className="font-medium hover:underline"
              style={{ color: "#0056A3" }}
            >
              Criar conta
            </Link>
          </p>
        </div>

        {/* Seção de Instalação */}
        <InstallSection />
      </div>
    </div>
  );
}