// Utilitários e hooks de PWA: instalação, atualização e status de conexão.

import { useEffect, useState } from "react";

export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios/i.test(navigator.userAgent);
}

export function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

export function isMobile() {
  return /android|iphone|ipad|ipod|mobile|iemobile|opera mini/i.test(navigator.userAgent);
}

export function isMacOS() {
  return /macintosh|mac os x/i.test(navigator.userAgent) && !/iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isWindows() {
  return /windows/i.test(navigator.userAgent);
}

const DISMISS_KEY = "pwa_install_dismissed_at";
const DISMISS_DAYS = 14;

export function isInstallDismissed() {
  const v = localStorage.getItem(DISMISS_KEY);
  if (!v) return false;
  return (Date.now() - parseInt(v, 10)) / 86400000 < DISMISS_DAYS;
}

export function dismissInstall() {
  localStorage.setItem(DISMISS_KEY, Date.now().toString());
}

export function clearInstallDismiss() {
  localStorage.removeItem(DISMISS_KEY);
}

// Hook: captura beforeinstallprompt e rastreia estado de instalação.
export function usePWAInstall() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const onBIP = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onAppInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferred) return null;
    deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    return choice;
  };

  return {
    deferred,
    installed,
    canInstallNatively: !!deferred,
    promptInstall,
    platform: isIOS() ? "ios" : isAndroid() ? "android" : isMacOS() ? "macos" : isWindows() ? "windows" : "other",
  };
}

// Hook: detecção de atualização do Service Worker.
export function useSWUpdate() {
  const [updateReady, setUpdateReady] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let reg;
    navigator.serviceWorker.getRegistration().then((r) => {
      if (!r) return;
      reg = r;
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(nw);
            setUpdateReady(true);
          }
        });
      });
    });
    const interval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((r) => r && r.update());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const applyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), { once: true });
    } else {
      window.location.reload();
    }
  };

  return { updateReady, applyUpdate, setUpdateReady };
}

// Hook: status online/offline.
export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}