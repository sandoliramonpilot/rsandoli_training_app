import { useEffect, useState } from "react";

// Estado de conectividade do dispositivo.
// `navigator.onLine` é indicativo: o app nunca assume que uma operação de
// servidor terá sucesso apenas porque o dispositivo diz estar conectado.
export function useOnlineStatus() {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}

export function isOffline() {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

/** Reconhece falha de rede sem mascará-la como erro de validação do servidor. */
export function isNetworkError(error) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  const msg = String(error?.message || error || "").toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed") ||
    msg.includes("load failed") ||
    msg.includes("fetch failed") ||
    msg.includes("timeout")
  );
}