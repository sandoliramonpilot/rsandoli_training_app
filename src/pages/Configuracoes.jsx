import React, { useState } from "react";
import { Download, Palette, WifiOff, ShieldCheck } from "lucide-react";
import InstallAppPanel from "@/components/pwa/InstallAppPanel";
import AppearanceSettings from "@/components/perfil/AppearanceSettings";
import OfflineContentPanel from "@/components/OfflineContentPanel";
import DeviceSecurityPanel from "@/components/DeviceSecurityPanel";

const TABS = [
  { id: "instalar", label: "Instalar aplicativo", icon: Download },
  { id: "aparencia", label: "Aparência", icon: Palette },
  { id: "offline", label: "Conteúdo offline", icon: WifiOff },
  { id: "seguranca", label: "Segurança do dispositivo", icon: ShieldCheck },
];

export default function Configuracoes() {
  const [tab, setTab] = useState("instalar");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Administração</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Instalação do aplicativo, aparência, conteúdo offline e segurança deste dispositivo.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Seções de configuração"
        className="flex flex-wrap gap-2"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "instalar" && <InstallAppPanel />}
      {tab === "aparencia" && (
        <div className="space-y-6">
          <AppearanceSettings />
          <p className="text-xs text-muted-foreground">
            O aplicativo instalado usa a mesma preferência de tema, incluindo o modo Automático, que
            acompanha a aparência configurada no dispositivo.
          </p>
        </div>
      )}
      {tab === "offline" && <OfflineContentPanel />}
      {tab === "seguranca" && <DeviceSecurityPanel />}
    </div>
  );
}