// "Sair e remover dados deste dispositivo": encerra sessão e limpa caches/locais privados.
// Não exclui registros já sincronizados com o banco de dados.

import { clearOfflineContent } from "./offlineStore";
import { clearAllDrafts } from "./draftQueue";

const PRESERVE_KEYS = ["theme_pref", "terms_accepted"];

export async function clearDeviceData() {
  // 1. Caches do Service Worker
  if ("caches" in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {}
  }

  // 2. Conteúdo offline protegido (IndexedDB)
  try {
    await clearOfflineContent();
  } catch {}

  // 3. Rascunhos locais
  clearAllDrafts();

  // 4. localStorage — remove chaves do app, preserva preferências de tema/termos
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && !PRESERVE_KEYS.includes(k) && !k.startsWith("base44")) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}

  // 5. sessionStorage
  try {
    sessionStorage.clear();
  } catch {}

  // 6. Desregistra o Service Worker (remove arquivos offline protegidos do SW)
  if ("serviceWorker" in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    } catch {}
  }

  return true;
}