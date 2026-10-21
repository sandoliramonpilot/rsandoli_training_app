import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

// Aviso de atualização.
// A nova versão é baixada em segundo plano e só assume quando o usuário
// confirma, para não interromper formulários ou registros em andamento.
// Rascunhos ficam em armazenamento local e sobrevivem à atualização.
export default function UpdatePrompt() {
  const [waiting, setWaiting] = useState(null);
  const [visible, setVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return undefined;

    let registration = null;
    let reloading = false;

    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    const watch = (reg) => {
      if (!reg) return;
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaiting(reg.waiting);
        setVisible(true);
      }
      reg.addEventListener("updatefound", () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            setWaiting(installing);
            setVisible(true);
          }
        });
      });
    };

    navigator.serviceWorker.ready.then((reg) => {
      registration = reg;
      watch(reg);
    });
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    // Verifica atualizações ao voltar ao aplicativo.
    const checkForUpdate = () => {
      if (document.visibilityState === "visible") registration?.update().catch(() => {});
    };
    document.addEventListener("visibilitychange", checkForUpdate);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", checkForUpdate);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (!waiting) return;
    setUpdating(true);
    waiting.postMessage({ type: "SKIP_WAITING" });
  }, [waiting]);

  if (!visible) return null;

  return (
    <section
      aria-label="Atualização do aplicativo"
      className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[400px]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <RefreshCw className="h-4 w-4 text-primary" aria-hidden="true" />
            </span>
            <h2 className="text-sm font-semibold">Atualização disponível</h2>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Fechar o aviso de atualização"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="px-5 pt-2 text-sm text-muted-foreground leading-relaxed">
          Uma nova versão do RSandoli Training está pronta para uso. Você pode concluir a
          atividade atual antes de atualizar.
        </p>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <button
            type="button"
            onClick={applyUpdate}
            disabled={updating}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${updating ? "animate-spin" : ""}`} aria-hidden="true" />
            {updating ? "Atualizando…" : "Atualizar agora"}
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Depois
          </button>
        </div>
      </div>
    </section>
  );
}