import React, { useEffect, useState } from "react";
import {
  WifiOff,
  RefreshCw,
  Download,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { can } from "@/lib/accessControl";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import {
  useOfflineState,
  listModulesOffline,
  markModulesSynced,
  listDocumentsOffline,
  saveDocumentOffline,
  removeDocumentOffline,
  revalidateDocumentsOffline,
  syncPendingOperations,
  getDocumentOfflineBlob,
  APPROVED_DOCUMENT_STATUS,
  offlineSupported,
} from "@/lib/offlineStore";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

export default function OfflineContentPanel() {
  const { user } = useAuth();
  const online = useOnlineStatus();
  const state = useOfflineState();
  const [modules, setModules] = useState([]);
  const [savedDocs, setSavedDocs] = useState([]);
  const [availableDocs, setAvailableDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const authorizedModules = modules.filter((m) => can(user, m.moduleId, "visualizar"));

  const load = async () => {
    if (!offlineSupported()) {
      setLoading(false);
      return;
    }
    try {
      const [mods, savedDocList, docPage] = await Promise.all([
        listModulesOffline().catch(() => []),
        listDocumentsOffline().catch(() => []),
        online
          ? base44.entities.LibraryDocument.filter(
              { approval_status: { $in: APPROVED_DOCUMENT_STATUS }, status: "active" },
              { sort: "-created_date", limit: 200 }
            )
              .then((p) => p.items || [])
              .catch(() => [])
          : Promise.resolve([]),
      ]);
      setModules(mods);
      setSavedDocs(savedDocList);
      setAvailableDocs(docPage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  const run = async (key, fn) => {
    setBusy(key);
    setError("");
    setMessage("");
    try {
      const result = await fn();
      if (typeof result === "string") setMessage(result);
    } catch (err) {
      setError(err?.message || "Não foi possível concluir a operação.");
    } finally {
      setBusy("");
      await load();
    }
  };

  const syncModules = () =>
    run("modules", async () => {
      if (!online) throw new Error("Conecte-se à internet para atualizar a lista de módulos.");
      const ids = authorizedModules.map((m) => m.id);
      await markModulesSynced(ids);
      return `${ids.length} módulo(s) operacionais disponíveis neste dispositivo.`;
    });

  const syncQueue = () =>
    run("queue", async () => {
      const result = await syncPendingOperations();
      if (result.skipped) throw new Error("Sem conexão para enviar agora.");
      return result.failed > 0
        ? `${result.synced} registro(s) enviados, ${result.failed} aguardando nova tentativa.`
        : `${result.synced} registro(s) enviados.`;
    });

  const checkUpdates = () =>
    run("revalidate", async () => {
      const r = await revalidateDocumentsOffline();
      if (r.skipped) throw new Error("Sem conexão para verificar revisões.");
      return `Verificação concluída: ${r.checked} documento(s) conferidos, ${r.revoked} removido(s), ${r.outdated} com revisão nova.`;
    });

  const saveDoc = (doc) => run(`save-${doc.id}`, () => saveDocumentOffline(doc));
  const removeDoc = (doc) => run(`remove-${doc.id}`, () => removeDocumentOffline(doc.id));

  const openDoc = async (doc) => {
    setError("");
    try {
      const blob = await getDocumentOfflineBlob(doc.id);
      if (!blob) throw new Error("Arquivo não encontrado neste dispositivo.");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError(err?.message || "Não foi possível abrir o documento.");
    }
  };

  if (!offlineSupported()) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Este navegador não oferece armazenamento local compatível. Os módulos operacionais
        continuam disponíveis pela versão web, sem uso offline.
      </div>
    );
  }

  const savedIds = new Set(savedDocs.map((d) => d.id));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <WifiOff className="h-5 w-5 text-primary" aria-hidden="true" />
          Conteúdo disponível sem conexão
        </h1>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Somente conteúdo operacional aprovado pode ser guardado neste dispositivo. Cada item
          mostra a revisão aplicada e a data da última sincronização.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
            {state.shellCached
              ? "Estrutura do aplicativo disponível neste dispositivo."
              : "Estrutura do aplicativo ainda não armazenada."}
          </span>
          <span>Última sincronização: {formatDate(state.lastSync)}</span>
          {state.pendingCount > 0 && (
            <span className="text-amber-500">
              {state.pendingCount} registro(s) aguardando envio
            </span>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={syncModules}
            disabled={busy === "modules" || !online}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy === "modules" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            )}
            Atualizar conteúdo offline
          </button>
          <button
            type="button"
            onClick={checkUpdates}
            disabled={busy === "revalidate" || !online}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-secondary px-4 text-sm font-medium text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy === "revalidate" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            )}
            Verificar revisões
          </button>
          {state.pendingCount > 0 && (
            <button
              type="button"
              onClick={syncQueue}
              disabled={busy === "queue" || !online}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-secondary px-4 text-sm font-medium text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy === "queue" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <CloudUpload className="h-4 w-4" aria-hidden="true" />
              )}
              Sincronizar agora
            </button>
          )}
        </div>

        {(message || error) && (
          <p className={`mt-4 text-sm ${error ? "text-destructive" : "text-primary"}`}>
            {error ? `Atenção: ${error}` : message}
          </p>
        )}

        {!online && (
          <p className="mt-4 text-sm text-rose-400">
            Sem conexão: envio de registros, aprovações, uploads e buscas no servidor ficam
            indisponíveis até a conexão retornar.
          </p>
        )}
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">Módulos operacionais</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Disponíveis conforme as suas permissões de acesso.
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          </div>
        ) : authorizedModules.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhum módulo operacional autorizado para o seu perfil.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {authorizedModules.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Revisão: {m.revision || "não informada pela fonte"} · Sincronizado:{" "}
                    {formatDate(m.syncedAt)}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium ${
                    m.syncedAt ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {m.syncedAt ? "Disponível offline" : "Não sincronizado"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">Documentos guardados offline</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Documentos aprovados e vigentes baixados para este dispositivo.
        </p>

        {savedDocs.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhum documento guardado offline.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {savedDocs.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-secondary/60 p-4"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {d.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Revisão: {d.revision_number || "não informada"}
                    {d.revision_date ? ` · ${d.revision_date}` : ""} · Guardado:{" "}
                    {formatDate(d.synced_at)}
                  </p>
                  {d.stale && (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-amber-500">
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      {d.stale_reason || "Conteúdo local desatualizado."}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openDoc(d)}
                    className="inline-flex min-h-[40px] items-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-opacity hover:opacity-80"
                  >
                    Abrir
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDoc(d)}
                    disabled={busy === `remove-${d.id}`}
                    aria-label={`Remover ${d.title} deste dispositivo`}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition-opacity hover:opacity-80 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground">
          Documentos aprovados disponíveis
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {online
            ? "Escolha o que deve ficar disponível neste dispositivo sem conexão."
            : "Conecte-se à internet para baixar novos documentos."}
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          </div>
        ) : availableDocs.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {online
              ? "Nenhum documento aprovado e vigente na Biblioteca."
              : "A lista depende de conexão."}
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {availableDocs.map((doc) => {
              const already = savedIds.has(doc.id);
              return (
                <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Revisão: {doc.revision_number || "não informada"}
                      {doc.revision_date ? ` · ${doc.revision_date}` : ""}
                      {doc.validity_date ? ` · Validade: ${doc.validity_date}` : ""}
                    </p>
                  </div>
                  {already ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Guardado offline
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => saveDoc(doc)}
                      disabled={!online || busy === `save-${doc.id}`}
                      className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-border bg-secondary px-3 text-sm font-medium text-foreground transition-opacity hover:opacity-80 disabled:opacity-50"
                    >
                      {busy === `save-${doc.id}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Download className="h-4 w-4" aria-hidden="true" />
                      )}
                      Guardar offline
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}