import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Armazenamento offline controlado do RSandoli Training.
//
// Guarda apenas conteúdo operacional aprovado e operações pendentes do próprio
// usuário. Nada de credenciais, tokens ou dados administrativos: o que é
// sensível permanece exclusivamente no servidor.
//
//  - catalog:   quais módulos operacionais estão disponíveis neste dispositivo
//  - documents: arquivos aprovados baixados para uso sem conexão (blob local)
//  - queue:     operações aguardando reconexão, com chave de idempotência
//  - meta:      marcadores internos (última sincronização)

const DB_NAME = "rsandoli-offline";
const DB_VERSION = 1;
const STORES = ["catalog", "documents", "queue", "meta"];
const PRIVATE_CACHE_PREFIXES = ["rsandoli-offline-content"];

/** Módulos operacionais que o aplicativo mantém disponíveis sem conexão. */
export const OFFLINE_MODULES = [
  { id: "checklists", label: "Checklists operacionais", path: "/checklist", moduleId: "checklists", revision: null },
  { id: "procedimentos_normais", label: "Procedimentos Normais", path: "/procedimentos-normais", moduleId: "procedimentos_normais", revision: null },
  { id: "procedimentos_emergencia", label: "Procedimentos de Emergência", path: "/procedimentos-emergencia", moduleId: "procedimentos_emergencia", revision: null },
  { id: "qrh", label: "QRH", path: "/qrh", moduleId: "qrh", revision: null },
  { id: "qrh_efis", label: "QRH-EFIS", path: "/qrh-efis", moduleId: "qrh_efis", revision: "Pendente de conferência visual" },
  { id: "limitacoes", label: "Limitações", path: "/limitacoes", moduleId: "limitacoes", revision: null },
  { id: "briefing_emergencia", label: "Briefing de Emergência", path: "/briefing-emergencia", moduleId: "briefing_emergencia", revision: null },
];

export const APPROVED_DOCUMENT_STATUS = ["approved", "approved_with_notes"];

export function offlineSupported() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

// ---------- IndexedDB ----------
let dbPromise = null;
function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      STORES.forEach((s) => {
        if (!db.objectStoreNames.contains(s)) {
          db.createObjectStore(s, { keyPath: s === "meta" ? "key" : "id" });
        }
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function getAll(store) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, "readonly");
        const r = t.objectStore(store).getAll();
        r.onsuccess = () => resolve(r.result || []);
        r.onerror = () => reject(r.error);
      })
  );
}

function getRecord(store, key) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, "readonly");
        const r = t.objectStore(store).get(key);
        r.onsuccess = () => resolve(r.result || null);
        r.onerror = () => reject(r.error);
      })
  );
}

function putRecord(store, value) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, "readwrite");
        t.objectStore(store).put(value);
        t.oncomplete = () => resolve(value);
        t.onerror = () => reject(t.error);
      })
  );
}

function deleteRecord(store, key) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, "readwrite");
        t.objectStore(store).delete(key);
        t.oncomplete = () => resolve(true);
        t.onerror = () => reject(t.error);
      })
  );
}

function clearStore(store) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, "readwrite");
        t.objectStore(store).clear();
        t.oncomplete = () => resolve(true);
        t.onerror = () => reject(t.error);
      })
  );
}

// ---------- Estado observável ----------
let snapshot = {
  ready: false,
  supported: offlineSupported(),
  shellCached: false,
  moduleCount: 0,
  documentCount: 0,
  staleCount: 0,
  pendingCount: 0,
  syncing: false,
  lastSync: null,
};
const listeners = new Set();

export function getOfflineSnapshot() {
  return snapshot;
}

export function subscribeOffline(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(patch) {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((l) => l());
}

export async function isShellCached() {
  if (typeof caches === "undefined") return false;
  try {
    return Boolean((await caches.match("/index.html")) || (await caches.match("/")));
  } catch {
    return false;
  }
}

export async function refreshOfflineState() {
  if (!offlineSupported()) {
    emit({ ready: true, supported: false });
    return;
  }
  try {
    const [mods, docs, queue, meta, shell] = await Promise.all([
      getAll("catalog"),
      getAll("documents"),
      getAll("queue"),
      getAll("meta"),
      isShellCached(),
    ]);
    emit({
      ready: true,
      supported: true,
      shellCached: shell,
      moduleCount: mods.length,
      documentCount: docs.length,
      staleCount: docs.filter((d) => d.stale).length,
      pendingCount: queue.length,
      lastSync: meta.find((m) => m.key === "last_sync")?.value || null,
    });
  } catch {
    emit({ ready: true });
  }
}

/** Assina o estado offline em componentes React. */
export function useOfflineState() {
  const [state, setState] = useState(getOfflineSnapshot);
  useEffect(() => {
    const unsubscribe = subscribeOffline(() => setState(getOfflineSnapshot()));
    refreshOfflineState();
    return unsubscribe;
  }, []);
  return state;
}

// ---------- Catálogo de módulos ----------
export async function listModulesOffline() {
  const saved = await getAll("catalog");
  const byId = new Map(saved.map((m) => [m.id, m]));
  return OFFLINE_MODULES.map((m) => ({
    ...m,
    syncedAt: byId.get(m.id)?.syncedAt || null,
  }));
}

/** Registra a data da última sincronização dos módulos autorizados ao usuário. */
export async function markModulesSynced(ids) {
  const now = Date.now();
  for (const id of ids) {
    const mod = OFFLINE_MODULES.find((m) => m.id === id);
    if (!mod) continue;
    await putRecord("catalog", { id, label: mod.label, revision: mod.revision, syncedAt: now });
  }
  await putRecord("meta", { key: "last_sync", value: now });
  await refreshOfflineState();
}

export async function clearModulesOffline() {
  await clearStore("catalog");
  await refreshOfflineState();
}

// ---------- Documentos aprovados ----------
export async function listDocumentsOffline() {
  const docs = await getAll("documents");
  return docs.map(({ blob, ...rest }) => ({ ...rest, size: blob?.size || rest.size || 0 }));
}

export async function getDocumentOfflineBlob(id) {
  const record = await getRecord("documents", id);
  return record?.blob || null;
}

/** Baixa e guarda um documento aprovado para uso sem conexão. */
export async function saveDocumentOffline(record) {
  if (!record?.file_uri) throw new Error("Este documento não possui arquivo anexado.");
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
    file_uri: record.file_uri,
  });
  const response = await fetch(signed_url);
  if (!response.ok) throw new Error("Não foi possível baixar o documento.");
  const blob = await response.blob();
  await putRecord("documents", {
    id: record.id,
    title: record.title,
    category: record.category,
    file_name: record.file_name || record.title,
    file_uri: record.file_uri,
    revision_number: record.revision_number || null,
    revision_date: record.revision_date || null,
    validity_date: record.validity_date || null,
    approval_status: record.approval_status || null,
    status: record.status || null,
    blob,
    synced_at: Date.now(),
    checked_at: null,
    stale: false,
    stale_reason: "",
  });
  await refreshOfflineState();
}

export async function removeDocumentOffline(id) {
  await deleteRecord("documents", id);
  await refreshOfflineState();
}

export async function clearDocumentsOffline() {
  await clearStore("documents");
  await refreshOfflineState();
}

/**
 * Revalida os documentos guardados assim que há conexão.
 * Conteúdo revogado, arquivado ou não aprovado deixa de ficar disponível no
 * dispositivo; revisões novas são sinalizadas como desatualizadas.
 */
export async function revalidateDocumentsOffline() {
  if (!offlineSupported() || (typeof navigator !== "undefined" && !navigator.onLine)) {
    return { checked: 0, revoked: 0, outdated: 0, skipped: true };
  }
  const docs = await getAll("documents");
  let revoked = 0;
  let outdated = 0;
  let checked = 0;

  for (const doc of docs) {
    let fresh = null;
    let denied = false;
    try {
      fresh = await base44.entities.LibraryDocument.get(doc.id);
    } catch (err) {
      const status = err?.status || err?.response?.status || err?.data?.status;
      if (status === 403 || status === 404) denied = true;
    }
    if (denied || !fresh) {
      await deleteRecord("documents", doc.id);
      revoked++;
      continue;
    }
    const approved = APPROVED_DOCUMENT_STATUS.includes(fresh.approval_status);
    const usable =
      approved && !["archived", "superseded", "review"].includes(fresh.status || "active");
    if (!usable) {
      await deleteRecord("documents", doc.id);
      revoked++;
      continue;
    }
    const changed =
      (fresh.revision_number || null) !== doc.revision_number ||
      (fresh.revision_date || null) !== doc.revision_date;
    await putRecord("documents", {
      ...doc,
      approval_status: fresh.approval_status || null,
      status: fresh.status || null,
      revision_number: fresh.revision_number || null,
      revision_date: fresh.revision_date || null,
      validity_date: fresh.validity_date || null,
      checked_at: Date.now(),
      stale: changed,
      stale_reason: changed ? "Nova revisão disponível no servidor." : "",
    });
    checked++;
    if (changed) outdated++;
  }

  await refreshOfflineState();
  return { checked, revoked, outdated, skipped: false };
}

// ---------- Fila de operações pendentes ----------
export function newClientKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ck_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function listQueue() {
  return getAll("queue");
}

/**
 * Guarda uma operação para envio posterior.
 * A chave de idempotência impede que a mesma operação seja registrada duas
 * vezes se o usuário tentar enviar antes da reconexão.
 */
export async function enqueueOperation({ entity, payload, clientKey }) {
  const entry = {
    id: clientKey,
    entity,
    payload: { ...payload, client_key: clientKey },
    match_field: "client_key",
    match_value: clientKey,
    created_at: Date.now(),
    attempts: 0,
    last_error: "",
  };
  await putRecord("queue", entry);
  await refreshOfflineState();
  return entry;
}

export async function removeQueuedOperation(id) {
  await deleteRecord("queue", id);
  await refreshOfflineState();
}

const SYNC_ENTITIES = {
  ChecklistRecord: () => base44.entities.ChecklistRecord,
};

export async function syncPendingOperations() {
  const state = getOfflineSnapshot();
  if (state.syncing) return { skipped: true };
  if (!offlineSupported() || (typeof navigator !== "undefined" && !navigator.onLine)) {
    return { skipped: true };
  }

  emit({ syncing: true });
  let synced = 0;
  let duplicates = 0;
  let failed = 0;

  try {
    const ops = (await getAll("queue")).sort((a, b) => a.created_at - b.created_at);
    for (const op of ops) {
      const resolve = SYNC_ENTITIES[op.entity];
      if (!resolve) {
        await deleteRecord("queue", op.id);
        continue;
      }
      const api = resolve();
      try {
        // Idempotência: se o registro já chegou ao servidor, descarta a cópia local.
        const existing = await api.filter({ [op.match_field]: op.match_value }, { limit: 1 });
        if ((existing?.items || []).length > 0) {
          await deleteRecord("queue", op.id);
          duplicates++;
          continue;
        }
        await api.create(op.payload);
        await deleteRecord("queue", op.id);
        synced++;
      } catch (err) {
        failed++;
        await putRecord("queue", {
          ...op,
          attempts: (op.attempts || 0) + 1,
          last_error: String(err?.message || err || "Falha ao enviar"),
        });
      }
    }
    await putRecord("meta", { key: "last_sync", value: Date.now() });
  } finally {
    emit({ syncing: false });
    await refreshOfflineState();
  }

  return { synced, duplicates, failed, skipped: false };
}

// ---------- Remoção de dados do dispositivo ----------
/**
 * Apaga conteúdo offline, rascunhos pendentes e caches privados deste
 * dispositivo. Registros já sincronizados permanecem no banco do aplicativo.
 */
export async function clearDeviceData() {
  if (offlineSupported()) {
    try {
      for (const store of STORES) await clearStore(store);
    } catch {}
  }
  try {
    if (typeof caches !== "undefined") {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => PRIVATE_CACHE_PREFIXES.some((p) => n.startsWith(p)))
          .map((n) => caches.delete(n))
      );
    }
  } catch {}
  emit({
    moduleCount: 0,
    documentCount: 0,
    staleCount: 0,
    pendingCount: 0,
    lastSync: null,
  });
}