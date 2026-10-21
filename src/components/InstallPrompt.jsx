import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useInstall, isDismissedRecently, dismissInstallPrompt } from "@/lib/pwa";
import InstallGuideDialog from "@/components/pwa/InstallGuideDialog";

// Banner discreto de instalação.
// Aparece apenas quando a instalação é realmente possível, o app não está
// instalado e o usuário não recusou recentemente. Não cobre informações nem
// comandos da tela.
export default function InstallPrompt() {
  const { canInstall, installed, platform, promptInstall } = useInstall();
  const [visible, setVisible] = useState(false);
  const [working, setWorking] = useState(false);

  const eligible =
    !installed && (canInstall || (platform.id === "ios" && platform.safari));

  useEffect(() => {
    if (!eligible || isDismissedRecently()) {
      setVisible(false);
      return undefined;
    }
    // Pequena espera para não disputar atenção com o primeiro uso da tela.
    const t = setTimeout(() => setVisible(true), 6000);
    return () => clearTimeout(t);
  }, [eligible]);

  if (!visible || !eligible) return null;

  const dismiss = () => {
    dismissInstallPrompt();
    setVisible(false);
  };

  const install = async () => {
    if (!canInstall) return;
    setWorking(true);
    try {
      const outcome = await promptInstall();
      if (outcome === "accepted") {
        setVisible(false);
      } else {
        dismiss();
      }
    } finally {
      setWorking(false);
    }
  };

  return (
    <section
      aria-label="Instalar o RSandoli Training"
      className="fixed inset-x-3 bottom-3 z-40 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[400px]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <Download className="h-4 w-4 text-primary" aria-hidden="true" />
            </span>
            <h2 className="text-sm font-semibold">Instale o RSandoli Training</h2>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar o convite de instalação"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="px-5 pt-2 text-sm text-muted-foreground leading-relaxed">
          Adicione o aplicativo à tela inicial para acessar com mais rapidez e utilizar uma
          experiência semelhante à de um aplicativo instalado.
        </p>

        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          {canInstall ? (
            <button
              type="button"
              onClick={install}
              disabled={working}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {working ? "Instalando…" : "Instalar aplicativo"}
            </button>
          ) : (
            <InstallGuideDialog
              platformId={platform.id}
              safariFallback={platform.safari}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            />
          )}
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Agora não
          </button>
          {canInstall && (
            <InstallGuideDialog platformId={platform.id} safariFallback={platform.safari} />
          )}
        </div>
      </div>
    </section>
  );
}