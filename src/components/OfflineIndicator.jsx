import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { WifiOff, CloudUpload, Cloud, AlertTriangle } from "lucide-react";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { useOfflineState, syncPendingOperations, revalidateDocumentsOffline } from "@/lib/offlineStore";

// Estado de conexão e de sincronização.
// Deixa explícito o que está pendente e o que depende de conexão.
export default function OfflineIndicator() {
  const online = useOnlineStatus();
  const state = useOfflineState();

  // Ao reconectar: envia operações pendentes e revalida o conteúdo offline.
  useEffect(() => {
    if (!online) return;
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await syncPendingOperations().catch(() => {});
      await revalidateDocumentsOffline().catch(() => {});
    })();
    return () => {
      cancelled = true;
    };
  }, [online]);

  if (online && state.pendingCount === 0 && state.staleCount === 0) return null;

  const tone = !online
    ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
    : "border-amber-500/40 bg-amber-500/10 text-amber-300";
  const Icon = !online ? WifiOff : state.staleCount > 0 ? AlertTriangle : CloudUpload;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border px-4 py-3 text-sm ${tone}`}
    >
      <span className="inline-flex items-center gap-2 font-medium">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {!online ? "Sem conexão" : "Sincronização"}
      </span>
      {!online && (
        <span className="text-rose-200/90">
          Conteúdo já disponível neste dispositivo continua acessível. Recursos que dependem do
          servidor ficam indisponíveis até a conexão retornar.
        </span>
      )}
      {state.pendingCount > 0 && (
        <span className="inline-flex items-center gap-1.5">
          <Cloud className="h-3.5 w-3.5" aria-hidden="true" />
          {state.pendingCount} registro(s) aguardando envio
          {state.syncing ? " — enviando…" : ""}
        </span>
      )}
      {online && state.staleCount > 0 && (
        <span>{state.staleCount} documento(s) offline com revisão desatualizada.</span>
      )}
      <Link to="/configuracoes" className="underline underline-offset-4 hover:opacity-80">
        Gerenciar conteúdo offline
      </Link>
    </div>
  );
}