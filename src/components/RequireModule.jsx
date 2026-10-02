import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { can, getAccessLevel, getAccountStatus } from "@/lib/accessControl";
import { Loader2, Lock } from "lucide-react";

/**
 * Protege uma rota por módulo: exige permissão "visualizar" (ou "administrar" para audit).
 * Uso: <Route element={<RequireModule moduleId="usuarios" fallback={<Navigate to="/" />} />}> <Route path="/usuarios" ... /> </Route>
 */
export default function RequireModule({ moduleId, action = "visualizar", children }) {
  const { user, isLoadingAuth, isAuthenticated } = useAuth();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated || !user) {
      setAllowed(false);
      return;
    }
    const status = getAccountStatus(user);
    if (status !== "ativa" && status !== "convite_pendente") {
      setAllowed(false);
      return;
    }
    setAllowed(can(user, moduleId, action));
  }, [user, isLoadingAuth, isAuthenticated, moduleId, action]);

  if (isLoadingAuth || allowed === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#12141A]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }
  if (!allowed) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#12141A] text-slate-200 p-6">
        <Lock className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-lg font-medium text-slate-300">Acesso não autorizado</p>
        <p className="text-sm text-slate-500 mt-1 text-center max-w-sm">
          Você não tem permissão para acessar este módulo. Entre em contato com o administrador.
        </p>
        <a href="/" className="mt-6 text-amber-400 hover:text-amber-300 text-sm font-medium">Voltar ao painel</a>
      </div>
    );
  }
  return children;
}