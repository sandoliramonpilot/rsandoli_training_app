import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, X, HelpCircle } from "lucide-react";
import { usePWAInstall, isStandalone, isInstallDismissed, dismissInstall } from "@/lib/pwa";

// Banner discreto de instalação — exibido apenas quando aplicável e não recusado recentemente.
export default function InstallPrompt() {
  const { deferred, canInstallNatively, promptInstall, platform } = usePWAInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (isInstallDismissed()) return;
    // Mostra quando o navegador sinaliza instalação nativa (Android/desktop) ou no iOS
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    dismissInstall();
  };

  const handleInstall = async () => {
    if (canInstallNatively) {
      const choice = await promptInstall();
      if (choice?.outcome === "accepted") setVisible(false);
    } else {
      // Sem instalação nativa (iOS) — encaminha para a página de instruções
      window.location.href = "/instalar-aplicativo";
    }
  };

  if (!visible || isStandalone()) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[380px] z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Instale o RSandoli Training</span>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Fechar"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Adicione o aplicativo à tela inicial para acessar com mais rapidez e utilizar uma
            experiência semelhante à de um aplicativo instalado.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Instalar aplicativo
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 h-11 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              Agora não
            </button>
          </div>

          <div className="pt-2 border-t border-border">
            <Link
              to="/instalar-aplicativo"
              onClick={() => setVisible(false)}
              className="text-xs text-primary hover:underline flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Como instalar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}