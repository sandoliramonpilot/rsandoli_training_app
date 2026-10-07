import React, { useEffect, useState } from "react";
import { Download, X, Share, Smartphone, Apple, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

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

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState("android");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Não exibir se já está rodando como app instalado
    if (isStandalone()) return;

    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform("android");
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Em iOS não há beforeinstallprompt — exibe após pequeno atraso
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
    sessionStorage.setItem(STORAGE_KEY, Date.now().toString());
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
    <div className="fixed bottom-4 inset-x-4 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[380px] z-[60] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#1A1D25] border border-amber-500/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-200">Instalar aplicativo</span>
          </div>
          <button onClick={dismiss} className="text-slate-500 hover:text-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Instale o <strong className="text-slate-100">RSANDOLI PILOTS</strong> na tela inicial
            para acesso rápido como um app nativo — funciona offline e com as mesmas configurações da versão web.
          </p>

          {platform === "android" && deferredPrompt ? (
            <Button
              onClick={installAndroid}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar agora
            </Button>
          ) : platform === "ios" ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#12141A] border border-slate-700/60">
                <Apple className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-400 leading-relaxed">
                  No Safari, toque em <Share className="inline w-3 h-3 -mt-0.5 text-amber-400" />{" "}
                  <strong className="text-slate-200">Compartilhar</strong> e selecione{" "}
                  <strong className="text-slate-200">"Adicionar à Tela de Início"</strong>.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#12141A] border border-slate-700/60">
              <Smartphone className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-400 leading-relaxed">
                No Chrome/Edge, abra o menu <strong className="text-slate-200">⋮</strong> e toque em{" "}
                <strong className="text-slate-200">"Instalar aplicativo"</strong>.
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-700/40">
            <p className="text-[11px] text-slate-500 mb-2">Ou envie este link de acesso:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-xs text-amber-300/80 truncate">
                {APP_URL}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="border-slate-700 text-slate-300 hover:text-amber-300 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}