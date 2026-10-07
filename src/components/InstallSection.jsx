import React, { useEffect, useState } from "react";
import { Bot, Apple, Link2, Share, Copy, Check, Download } from "lucide-react";

const APP_URL = "https://rsandoli-training.base44.app";
const STORAGE_KEY = "pwa_install_dismissed_at";

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
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

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

  const showIOS = () => {
    alert("No iPhone/iPad: Abra no Safari, toque em Compartilhar e selecione 'Adicionar à Tela de Início'.");
  };

  const openApp = async () => {
    // Tenta o Web Share API (WhatsApp, e-mail, SMS nativos no mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "RSandoli_Training",
          text: "Acesse o app RSandoli_Training:",
          url: APP_URL,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch {}
    }
    // Fallback: copia o link
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="mt-6">
      {/* Título */}
      <p
        className="text-center font-semibold mb-3"
        style={{ color: "#333333", fontFamily: "Inter, Roboto, system-ui, sans-serif" }}
      >
        Instale nosso App
      </p>

      {/* Botões lado a lado */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={installAndroid}
          disabled={!deferredPrompt}
          className="flex items-center justify-center gap-2 h-11 rounded-lg text-white text-sm font-medium shadow-md transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "#34A853", borderRadius: "8px" }}
        >
          {deferredPrompt ? <Download className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          Instalar no Android
        </button>
        <button
          onClick={showIOS}
          className="flex items-center justify-center gap-2 h-11 rounded-lg text-white text-sm font-medium shadow-md transition-all hover:opacity-90"
          style={{ background: "#007AFF", borderRadius: "8px" }}
        >
          <Apple className="w-4 h-4" />
          Instalar no iOS
        </button>
      </div>

      {/* Texto explicativo iOS */}
      <p className="text-xs text-center mt-3 px-2 leading-relaxed" style={{ color: "#B0BEC5" }}>
        No iPhone/iPad: Abra no Safari e toque em "Adicionar à Tela de Início"
      </p>

      {/* Link Abrir App */}
      <button
        onClick={openApp}
        className="w-full mt-3 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all hover:opacity-80"
        style={{ background: "#F2F2F2", color: "#0056A3", borderRadius: "8px" }}
      >
        {copied || shared ? (
          <Check className="w-4 h-4" style={{ color: "#34A853" }} />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
        {copied ? "Link copiado!" : shared ? "Compartilhado!" : "Abrir App"}
      </button>
    </div>
  );
}