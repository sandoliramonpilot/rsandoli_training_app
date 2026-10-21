import { useCallback, useEffect, useState } from "react";

// Estado de instalação do PWA.
// A disponibilidade real de instalação só pode ser confirmada pelo navegador
// (evento beforeinstallprompt). Quando não é possível detectar com segurança,
// o app apresenta mensagem neutra e instruções manuais.

const DISMISS_KEY = "pwa_install_dismissed_at";
export const INSTALL_COOLDOWN_DAYS = 14;

export function isStandalone() {
  if (typeof window === "undefined") return false;
  const modes = ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"];
  if (modes.some((m) => window.matchMedia(`(display-mode: ${m})`).matches)) return true;
  return window.navigator.standalone === true;
}

export function detectPlatform() {
  const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
  const touchMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iphone|ipad|ipod/i.test(ua) || touchMac) {
    // Chrome, Firefox e Edge no iOS não oferecem instalação por prompt.
    return { id: "ios", safari: !/crios|fxios|edgios/i.test(ua), label: "iPhone / iPad" };
  }
  if (/android/i.test(ua)) return { id: "android", safari: false, label: "Android" };
  return { id: "desktop", safari: false, label: "Computador" };
}

export function isDismissedRecently() {
  const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
  if (!at) return false;
  return Date.now() - at < INSTALL_COOLDOWN_DAYS * 86400000;
}

export function dismissInstallPrompt() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {}
}

export function clearInstallDismissal() {
  try {
    localStorage.removeItem(DISMISS_KEY);
  } catch {}
}

/**
 * Estado de instalação compartilhado.
 * `canInstall` reflete apenas o que o navegador informou.
 */
export function useInstall() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [platform] = useState(detectPlatform);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const mq = window.matchMedia("(display-mode: standalone)");
    const onModeChange = () => setInstalled(isStandalone());
    mq.addEventListener?.("change", onModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      mq.removeEventListener?.("change", onModeChange);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return "unavailable";
    deferred.prompt();
    try {
      const { outcome } = await deferred.userChoice;
      return outcome;
    } finally {
      setDeferred(null);
    }
  }, [deferred]);

  return { canInstall: !!deferred, installed, platform, promptInstall };
}