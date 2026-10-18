import React, { useEffect, useState } from "react";
import { Download, X, Share, Apple, Smartphone, Copy, Check } from "lucide-react";

const STORAGE_KEY = "pwa_install_dismissed_at";
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

function isMobileDevice() {
  return /android|iphone|ipad|ipod|mobile|iemobile|opera mini/i.test(navigator.userAgent);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState("android");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    // A instalação é relevante apenas em dispositivos móveis. No desktop o
    // navegador também dispara "beforeinstallprompt", o que abria este cartão
    // sobre a interface sem necessidade e atrapalhava a navegação.
    if (!isMobileDevice()) return;

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform("android");
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (isIOS()) {
      setPlatform("ios");
      const t = setTimeout(() => setVisible(true), 1500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[380px] z-30 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden" style={{ borderColor: "#F2F2F2" }}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: "#E3F2FD", borderColor: "#E3F2FD" }}>
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" style={{ color: "#007AFF" }} />
            <span className="text-sm font-semibold" style={{ color: "#0056A3" }}>Instalar aplicativo</span>
          </div>
          <button onClick={dismiss} className="hover:opacity-70 transition-opacity" style={{ color: "#B0BEC5" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: "#333333" }}>
            Instale o <strong>RSandoli_Training</strong> na tela inicial
            para acesso rápido como um app nativo — funciona offline e com as mesmas configurações da versão web.
          </p>

          {platform === "android" && deferredPrompt ? (
            <button
              onClick={installAndroid}
              className="w-full h-11 rounded-lg text-white text-sm font-medium shadow-md transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: "#34A853", borderRadius: "8px" }}
            >
              <Download className="w-4 h-4" />
              Instalar agora
            </button>
          ) : platform === "ios" ? (
            <div className="flex items-start gap-3 p-3 rounded-lg border" style={{ background: "#F2F2F2", borderColor: "#F2F2F2" }}>
              <Apple className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#333333" }} />
              <div className="text-xs leading-relaxed" style={{ color: "#333333" }}>
                No Safari, toque em <Share className="inline w-3 h-3 -mt-0.5" style={{ color: "#007AFF" }} />{" "}
                <strong>Compartilhar</strong> e selecione{" "}
                <strong>"Adicionar à Tela de Início"</strong>.
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 rounded-lg border" style={{ background: "#F2F2F2", borderColor: "#F2F2F2" }}>
              <Smartphone className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#333333" }} />
              <div className="text-xs leading-relaxed" style={{ color: "#333333" }}>
                No Chrome/Edge, abra o menu <strong>⋮</strong> e toque em{" "}
                <strong>"Instalar aplicativo"</strong>.
              </div>
            </div>
          )}

          <div className="pt-2 border-t" style={{ borderColor: "#F2F2F2" }}>
            <p className="text-[11px] mb-2" style={{ color: "#B0BEC5" }}>Ou envie este link de acesso:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-lg border text-xs truncate" style={{ background: "#F2F2F2", borderColor: "#F2F2F2", color: "#0056A3" }}>
                {APP_URL}
              </code>
              <button
                onClick={copyLink}
                className="px-3 py-2 rounded-lg border transition-all hover:opacity-80 shrink-0"
                style={{ borderColor: "#B0BEC5", color: "#0056A3" }}
              >
                {copied ? <Check className="w-3.5 h-3.5" style={{ color: "#34A853" }} /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}