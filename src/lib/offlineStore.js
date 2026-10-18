// Armazenamento offline controlado (IndexedDB) para conteúdos autorizados:
// procedimentos, documentos e checklists aprovados. Mantém revisão e data de sincronização.
// Não armazena credenciais, tokens ou dados sensíveis sem proteção.

const DB_NAME = "rsandoli_offline";
const STORE = "content";
const VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Salva um conteúdo offline autorizado.
 * @param {Object} item { id, type, title, revision, content (Blob|string), sync_date, aircraftProfile, source_url }
 */
export async function saveOfflineContent(item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineContent(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function listOfflineContent(type) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      let items = req.result || [];
      if (type) items = items.filter((i) => i.type === type);
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function removeOfflineContent(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearOfflineContent() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

// Baixa e armazena um conteúdo a partir de uma URL assinada (blob).
export async function downloadAndStore({ id, type, title, revision, aircraftProfile, source_url }) {
  const res = await fetch(source_url);
  if (!res.ok) throw new Error("Falha ao baixar conteúdo para offline");
  const blob = await res.blob();
  await saveOfflineContent({
    id,
    type,
    title,
    revision,
    aircraftProfile,
    content: blob,
    content_type: blob.type,
    sync_date: new Date().toISOString(),
    source_url,
  });
  return true;
}