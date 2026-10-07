import React, { useEffect, useState } from "react";
import { Download, Share, Apple, Smartphone, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const APP_URL = "https://rsandoli-training.base44.app";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios/i.test(navigator.userAgent);
}

export default function InstallSection() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOS, setShowIOS] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone()) return null;

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="mt-6 pt-5 border-t border-border">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
          Instale nosso App
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {deferredPrompt ? (
            <Button
              onClick={installAndroid}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar no Android
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowIOS((s) => !s)}
              className="text-sm"
              size="sm"
            >
              <Apple className="w-4 h-4 mr-2" />
              Instalar no iOS
              {showIOS ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </Button>
          )}
        </div>

        {showIOS && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border text-left">
            <div className="flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                No <strong className="text-foreground">Safari</strong>, toque em{" "}
                <Share className="inline w-3 h-3 -mt-0.5 text-primary" />{" "}
                <strong className="text-foreground">Compartilhar</strong> e selecione{" "}
                <strong className="text-foreground">"Adicionar à Tela de Início"</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-[11px] text-muted-foreground">Link de acesso:</span>
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      </div>
    </div>
  );
}