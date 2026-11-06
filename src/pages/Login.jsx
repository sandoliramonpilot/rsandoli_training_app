import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { AIRCRAFT_PROFILES, DEFAULT_PROFILE } from '@/lib/aircraftProfile';
import { canLogin } from '@/lib/accessControl';
import { Loader2, Plane, Lock, Mail, ArrowRight } from 'lucide-react';

const AIRCRAFT_LABELS = {
  AW119: { nome: 'AW119 TRAINING', desc: 'Leonardo AW119Kx Koala' },
  H125: { nome: 'H125 TRAINING', desc: 'Airbus H125' },
};

function resolvePerfis(user) {
  if (!user) return [DEFAULT_PROFILE];
  if (user.is_master || user.access_level === 'admin_geral') return AIRCRAFT_PROFILES;

  let perfis = user.aircraft_profiles;
  if (typeof perfis === 'string') {
    try { perfis = JSON.parse(perfis); } catch { perfis = []; }
  }
  if (!Array.isArray(perfis) || perfis.length === 0) return [DEFAULT_PROFILE];

  const validos = perfis.filter((p) => AIRCRAFT_PROFILES.includes(p));
  return validos.length > 0 ? validos : [DEFAULT_PROFILE];
}

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [etapa, setEtapa] = useState('credenciais');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfis, setPerfis] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await base44.auth.signIn({ email, password: senha });

      const usuario = await base44.auth.me();

      if (!canLogin(usuario)) {
        setErro('Sua conta não está ativa. Fale com o administrador.');
        setCarregando(false);
        return;
      }

      const disponiveis = resolvePerfis(usuario);

      if (disponiveis.length === 0) {
        navigate('/sem-acesso');
        return;
      }

      if (disponiveis.length === 1) {
        localStorage.setItem('aircraft', disponiveis[0]);
        navigate('/training');
        return;
      }

      setPerfis(disponiveis);
      setEtapa('modulo');
    } catch (err) {
      setErro(err?.message || 'Não foi possível entrar. Verifique e-mail e senha.');
    } finally {
      setCarregando(false);
    }
  };

  const escolherModulo = (aeronave) => {
    localStorage.setItem('aircraft', aeronave);
    navigate('/training');
  };

  if (etapa === 'modulo') {
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
            {perfis.map((aeronave) => {
              const info = AIRCRAFT_LABELS[aeronave] || {
                nome: aeronave,
                desc: '',
              };
              return (
                <button
                  key={aeronave}
                  onClick={() => escolherModulo(aeronave)}
                  className="group text-left p-6 rounded-2xl bg-[#1A1D25] border border-slate-700/60 hover:border-amber-500/60 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mb-4">
                    <Plane className="w-5 h-5 text-slate-900" />
                  </div>
                  <p className="text-sm font-semibold text-slate-100">{info.nome}</p>
                  <p className="text-xs text-slate-500 mt-1">{info.desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-amber-400 mt-4 group-hover:gap-2 transition-all">
                    Entrar <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setEtapa('credenciais');
              setPerfis([]);
            }}
            className="w-full text-xs text-slate-500 hover:text-slate-300"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#12141A] p-6">
      <form onSubmit={entrar} className="w-full max-w-sm space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-100">Entrar</h1>
          <p className="text-sm text-slate-400 mt-1">Acesse sua conta de treinamento</p>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">E-mail</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Senha</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        {erro && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full py-2.5 rounded-lg bg-amber-500 text-slate-900 text-sm font-semibold hover:bg-amber-400 disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="flex justify-between text-xs pt-2">
          <a href="/forgot-password" className="text-slate-500 hover:text-amber-400">
            Esqueci a senha
          </a>
          <a href="/register" className="text-slate-500 hover:text-amber-400">
            Criar conta
          </a>
        </div>
      </form>
    </div>
  );
}
