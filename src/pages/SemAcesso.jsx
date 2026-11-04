import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function SemAcesso() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#12141A] text-slate-200 p-6">
      <ShieldAlert className="w-14 h-14 text-amber-500 mb-5" />
      <h1 className="text-xl font-semibold text-slate-100">Nenhum módulo liberado</h1>
      <p className="text-sm text-slate-400 mt-2 text-center max-w-md">
        Sua conta ainda não tem acesso a um módulo de treinamento. Solicite ao
        administrador a liberação do AW119 ou do H125.
      </p>
      {user?.email && (
        <p className="text-xs text-slate-500 mt-3">Conta: {user.email}</p>
      )}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigate('/perfil')}
          className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 text-sm font-medium hover:bg-amber-400"
        >
          Meu perfil
        </button>
        <button
          onClick={() => logout?.()}
          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:border-slate-500"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
