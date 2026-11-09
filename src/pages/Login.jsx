import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { canLogin, getAuthorizedAircraft } from "@/lib/accessControl";
import { PROFILE_LABELS, PROFILE_DESCRIPTIONS } from "@/lib/aircraftProfile";
import { Loader2, Plane, LogIn, ArrowRight, ShieldAlert } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth, authChecked, navigateToLogin } = useAuth();

  const [etapa, setEtapa] = useState("verificando");
  const [perfis, setPerfis] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!authChecked || isLoadingAuth) return;

    // Sem sessão: manda para a tela de login do Base44
    if (!isAuthenticated || !user) {
      setEtapa("sem-sessao");
      return;
    }

    // Conta inativa ou bloqueada
    if (!canLogin(user)) {
      setErro("Sua conta não está ativa. Fale com o administrador.");
      setEtapa("bloqueado");
      return;
    }

    const disponiveis = getAuthorizedAircraft(user);

    if (disponiveis.length === 0) {
      setEtapa("sem-modulo");
      return;
    }

    if (disponiveis.length === 1) {
      localStorage.setItem("aircraft_profile", disponiveis[0]);
      navigate("/training", { replace: true });
      return;
    }

    setPerfis(disponiveis);
    setEtapa("escolher-modulo");
  }, [user, isAuthenticated, isLoadingAuth, authChecked, navigate]);

  const escolherModulo = (aeronave) => {
    localStorage.setItem("aircraft_profile", aeronave);
    navigate("/training", { replace: true });
  };

  const entrarComBase44 = () => {
    navigateToLogin();
  };

  if (etapa === "verificando") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#12141A]">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Verificando sessão...
        </div>
      </div>
    );
  }

  if (etapa === "sem-sessao") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#12141A] p-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mx-auto">
            <Plane className="w-8 h-8 text-slate-900" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-100">Rsandoli Training</h1>
            <p className="text-sm text-slate-400 mt-2">
              Acesse sua conta para continuar o treinamento.
            </p>
          </div>

          <button
            onClick={entrarComBase44}
            className="w-full py-3 rounded-lg bg-amber-500 text-slate-900 text-sm font-semibold hover:bg-amber-400 inline-flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Entrar
          </button>

          <p className="text-[11px] text-slate-600">
            Você será redirecionado para a tela de autenticação.
          </p>
        </div>
      </div>
    );
  }

  if (etapa === "bloqueado") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#12141A] p-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-bold text-slate-100">Acesso bloqueado</h1>
          <p className="text-sm text-slate-400">{erro}</p>
          <button
            onClick={() => base44.auth.logout(window.location.href)}
            className="w-full py-2.5 rounded-lg border border-slate-700/60 text-slate-300 text-sm hover:border-slate-500"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  if (etapa === "sem-modulo") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#12141A] p-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-100">Nenhum módulo liberado</h1>
          <p className="text-sm text-slate-400">
            Sua conta ainda não tem acesso a um módulo de treinamento. Solicite ao
            administrador a liberação do AW119 ou do H125.
          </p>
          <button
            onClick={() => base44.auth.logout(window.location.href)}
            className="w-full py-2.5 rounded-lg border border-slate-700/60 text-slate-300 text-sm hover:border-slate-500"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#12141A] p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100">Selecione seu módulo</h1>
          <p className="text-sm text-slate-400 mt-1">
            Você tem acesso a mais de um treinamento. Escolha por onde começar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {perfis.map((aeronave) => (
            <button
              key={aeronave}
              onClick={() => escolherModulo(aeronave)}
              className="group text-left p-6 rounded-2xl bg-[#1A1D25] border border-slate-700/60 hover:border-amber-500/60 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mb-4">
                <Plane className="w-5 h-5 text-slate-900" />
              </div>
              <p className="text-sm font-semibold text-slate-100">
                {PROFILE_LABELS[aeronave] || aeronave} TRAINING
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {PROFILE_DESCRIPTIONS[aeronave] || ""}
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-amber-400 mt-4 group-hover:gap-2 transition-all">
                Entrar <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => base44.auth.logout(window.location.href)}
          className="w-full text-xs text-slate-500 hover:text-slate-300"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}
