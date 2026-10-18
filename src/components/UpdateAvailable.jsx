import React from "react";
import { RefreshCw, X } from "lucide-react";
import { useSWUpdate } from "@/lib/pwa";

// Aviso de atualização disponível — não interrompe formulários em andamento.
export default function UpdateAvailable() {
  const { updateReady, applyUpdate, setUpdateReady } = useSWUpdate();

  if (!updateReady) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[380px] z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Atualização disponível</span>
          </div>
          <button
            onClick={() => setUpdateReady(false)}
            aria-label="Fechar"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Uma nova versão do RSandoli Training está pronta para uso.
          </p>
          <div className="flex gap-2">
            <button
              onClick={applyUpdate}
              className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar agora
            </button>
            <button
              onClick={() => setUpdateReady(false)}
              className="px-4 h-11 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              Depois
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}