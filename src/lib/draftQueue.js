// Fila de rascunhos locais com sincronização idempotente (best-effort via client_id).
// Preserva operações pendentes quando offline e sincroniza após reconexão.
// Não armazena senhas ou tokens — apenas dados de formulários de registros operacionais.

import { base44 } from "@/api/base44Client";

const QUEUE_KEY = "rsandoli_draft_queue";

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeQueue(q) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export function listPendingDrafts() {
  return readQueue().filter((d) => d.status !== "synced");
}

export function listAllDrafts() {
  return readQueue();
}

export function enqueueDraft({ entity, operation = "create", data, label }) {
  const q = readQueue();
  const item = {
    client_id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    entity,
    operation,
    data,
    label: label || `${entity}`,
    status: "pending",
    created_at: new Date().toISOString(),
    attempts: 0,
    error: null,
    server_id: null,
  };
  q.push(item);
  writeQueue(q);
  return item;
}

export function removeDraft(client_id) {
  writeQueue(readQueue().filter((d) => d.client_id !== client_id));
}

export function updateDraft(client_id, patch) {
  const q = readQueue();
  const i = q.findIndex((d) => d.client_id === client_id);
  if (i >= 0) {
    q[i] = { ...q[i], ...patch };
    writeQueue(q);
  }
}

export function clearSyncedDrafts() {
  writeQueue(readQueue().filter((d) => d.status !== "synced"));
}

export function clearAllDrafts() {
  writeQueue([]);
}

let syncing = false;

/**
 * Sincroniza rascunhos pendentes. Idempotência best-effort: cada item só é reprocessado
 * se ainda não foi marcado como "synced". O client_id é preservado para rastreio.
 */
export async function syncDrafts(onProgress) {
  if (syncing) return { ran: false };
  syncing = true;
  try {
    const pending = readQueue().filter((d) => d.status === "pending" || d.status === "error");
    for (const draft of pending) {
      updateDraft(draft.client_id, { status: "syncing", error: null });
      try {
        const res = await base44.entities[draft.entity].create(draft.data);
        updateDraft(draft.client_id, {
          status: "synced",
          server_id: res?.id || null,
          synced_at: new Date().toISOString(),
        });
        onProgress && onProgress({ draft, ok: true });
      } catch (e) {
        updateDraft(draft.client_id, {
          status: "error",
          error: e?.message || "Falha na sincronização",
          attempts: (draft.attempts || 0) + 1,
        });
        onProgress && onProgress({ draft, ok: false, error: e?.message });
      }
    }
    return { ran: true };
  } finally {
    syncing = false;
  }
}