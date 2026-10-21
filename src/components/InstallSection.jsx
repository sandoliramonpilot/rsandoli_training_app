import React from "react";
import { Download, CheckCircle2 } from "lucide-react";
import { useInstall } from "@/lib/pwa";
import InstallGuideDialog from "@/components/pwa/InstallGuideDialog";

// Opção de instalação para a tela de login e áreas equivalentes.
// Só aparece quando a instalação é possível e o app não está instalado.
export default function InstallSection() {
  const { canInstall, installed, platform, promptInstall } = useInstall();

  if (installed) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
        Aplicativo instalado neste dispositivo
      </div>
    );
  }

  const available = canInstall || (platform.id === "ios" && platform.safari);
  if (!available) return null;

  const install = async () => {
    if (canInstall) await promptInstall();
  };

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 text-center">
      <p className="text-sm font-semibold text-foreground">Instalar aplicativo</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Adicione o RSandoli Training à tela inicial deste dispositivo.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        {canInstall ? (
          <button
            type="button"
            onClick={install}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Instalar aplicativo
          </button>
        ) : (
          <InstallGuideDialog
            platformId={platform.id}
            safariFallback={platform.safari}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          />
        )}
        {canInstall && (
          <InstallGuideDialog platformId={platform.id} safariFallback={platform.safari} />
        )}
      </div>
    </div>
  );
}