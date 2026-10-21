import React, { useState } from "react";
import { ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { clearDeviceData } from "@/lib/offlineStore";

/**
 * Encerra a sessão e remove deste dispositivo os dados que pertencem ao usuário.
 * Registros já sincronizados permanecem no banco de dados do aplicativo.
 */
export async function signOutAndWipeDevice() {
  try {
    await clearDeviceData();
  } catch {}
  try {
    Object.keys(localStorage).forEach((key) => {
      // A preferência de tema não é dado pessoal e é mantida.
      if (key !== "theme_pref") localStorage.removeItem(key);
    });
    sessionStorage.clear();
  } catch {}
  try {
    await base44.auth.logout();
  } catch {}
  window.location.replace("/");
}

export default function DeviceSecurityPanel() {
  const [working, setWorking] = useState(false);

  const confirm = async () => {
    setWorking(true);
    await signOutAndWipeDevice();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h1 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
        Segurança do dispositivo
      </h1>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
        Use esta opção em dispositivos compartilhados. A sessão é encerrada, os tokens locais e os
        caches privados são removidos, e os arquivos guardados para uso offline são apagados. Nenhum
        registro já sincronizado com o banco de dados é excluído.
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            disabled={working}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-destructive px-4 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {working ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden="true" />
            )}
            Sair e remover dados deste dispositivo
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair e remover dados deste dispositivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado. Conteúdo guardado para uso offline, rascunhos ainda não
              enviados e caches privados serão removidos deste dispositivo. Os registros já
              sincronizados permanecem no banco de dados do aplicativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sair e remover dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}