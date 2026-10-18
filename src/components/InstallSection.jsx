import React, { useEffect, useState } from "react";
import { Download, Apple, Share, Copy, Check, Smartphone } from "lucide-react";
import { usePWAInstall, isStandalone } from "@/lib/pwa";

const APP_URL = "https://rsandoli-training.base44.app";

// Seção de instalação exibida na tela de login — tema-aware.
export default function InstallSection() {
  const { deferred, canInstallNatively, promptInstall, platform } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (isStandalone()) return null;

  const installAndroid = async () => {
    if (canInstallNatively) {
      await promptInstall();
    } else {
      window.location.href = "/instalar-aplicativo";
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="mt-6">
      <p className="text-center font-semibold text-sm text-foreground mb-3">Instale o aplicativo</p>

      <div className="grid grid-cols-2 gap-3">
        {platform === "ios" ? (
          <button
            onClick={() => (window.location.href = "/instalar-aplicativo")}
            className="flex items-center justify-center gap-2 h-11 rounded-lg text-white text-sm font-medium shadow-md transition-all hover:opacity-90 bg-primary"
          >
            <Apple className="w-4 h-4" />
            Instalar no iOS
          </button>
        ) : (
          <button
            onClick={installAndroid}
            disabled={!canInstallNatively && platform !== "android"}
            className="flex items-center justify-center gap-2 h-11 rounded-lg text-white text-sm font-medium shadow-md transition-all hover:opacity-90 bg-primary disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Instalar
          </button>
        )}
        <button
          onClick={() => (window.location.href = "/instalar-aplicativo")}
          className="flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-medium transition-all hover:opacity-80 border border-border text-foreground bg-card"
        >
          <Smartphone className="w-4 h-4" />
          Como instalar
        </button>
      </div>

      <button
        onClick={copyLink}
        className="w-full mt-3 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all hover:opacity-80 bg-secondary text-foreground"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        {copied ? "Link copiado" : "Copiar link de acesso"}
      </button>
    </div>
  );
}