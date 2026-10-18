import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Check, Smartphone, Apple, Monitor, Share, RefreshCw, ShieldCheck, WifiOff, Info } from "lucide-react";
import { usePWAInstall, useOnlineStatus, isStandalone } from "@/lib/pwa";
import { clearDeviceData } from "@/lib/deviceCleanup";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

const APP_ICON = "https://media.base44.com/images/public/6abbcee2e405be8f7f7ba4ef/b46e77fa3_generated_image.png";

export default function InstalarAplicativo() {
  const { canInstallNatively, promptInstall, installed, platform } = usePWAInstall();
  const online = useOnlineStatus();
  const { logout } = useAuth();
  const [cleaning, setCleaning] = useState(false);
  const [cleaned, setCleaned] = useState(false);

  const isInstalled = installed || isStandalone();

  const handleInstall = async () => {
    if (canInstallNatively) {
      await promptInstall();
    }
  };

  const handleClearDevice = async () => {
    if (!confirm("Tem certeza? Esta ação encerra a sessão e remove os dados deste dispositivo. Registros já sincronizados não são afetados.")) return;
    setCleaning(true);
    try {
      await clearDeviceData();
      await logout(true);
      setCleaned(true);
      setTimeout(() => window.location.reload(), 500);
    } catch {
      setCleaning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Administração · Configurações</p>
        <h1 className="text-3xl font-bold tracking-tight mt-1 text-foreground">Instalar RSandoli Training</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Instale o RSandoli Training neste dispositivo para acessar o aplicativo diretamente pela tela inicial.
        </p>
      </header>

      {!online && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <WifiOff className="w-4 h-4" />
          Sem conexão — a instalação requer acesso à internet.
        </div>
      )}

      {/* Card principal: estado + ícone + botão */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img src={APP_ICON} alt="RSandoli Training" className="w-24 h-24 rounded-2xl shadow-lg" />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground">RSandoli Training</h2>
            <p className="text-sm text-muted-foreground mt-1">A119 Koala · H125</p>
            <div className="mt-3">
              {isInstalled ? (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm font-semibold">
                  <Check className="w-4 h-4" />
                  Aplicativo instalado neste dispositivo
                </span>
              ) : canInstallNatively ? (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-semibold">
                  <Download className="w-4 h-4" />
                  Pronto para instalar
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-muted-foreground text-sm font-semibold">
                  <Info className="w-4 h-4" />
                  Verifique as instruções para o seu dispositivo
                </span>
              )}
            </div>
          </div>
          <div className="w-full sm:w-auto">
            {isInstalled ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2">
                <Check className="w-4 h-4 text-emerald-500" /> Instalado
              </div>
            ) : (
              <Button onClick={handleInstall} disabled={!canInstallNatively} className="bg-primary text-primary-foreground hover:opacity-90">
                <Download className="w-4 h-4" /> Instalar aplicativo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Instruções por plataforma */}
      <div className="grid sm:grid-cols-2 gap-4">
        <InstructionCard
          icon={Smartphone}
          title="Android (Chrome / Edge)"
          steps={[
            "Abra o menu do navegador (⋮)",
            'Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"',
            "Confirme a instalação",
          ]}
          highlight={platform === "android"}
        />
        <InstructionCard
          icon={Apple}
          title="iPhone e iPad (Safari)"
          steps={[
            "Abra o aplicativo no Safari",
            "Toque no botão Compartilhar",
            'Selecione "Adicionar à Tela de Início"',
            'Confirme em "Adicionar"',
          ]}
          highlight={platform === "ios"}
        />
        <InstructionCard
          icon={Monitor}
          title="Windows, macOS, ChromeOS e Linux"
          steps={[
            "Abra o menu do navegador",
            'Selecione "Instalar RSandoli Training"',
            "O app abre em janela própria e pode ser fixado na barra de tarefas ou Dock",
          ]}
          highlight={platform === "windows" || platform === "macos"}
        />
        <InstructionCard
          icon={ShieldCheck}
          title="Segurança e dados"
          steps={[
            "Mesma autenticação e permissões da versão web",
            "Sessão e tokens permanecem protegidos",
            "Atualizações automáticas ao abrir o app",
          ]}
        />
      </div>

      {/* Benefícios */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-3">Benefícios da instalação</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Abre em janela própria, sem barra de endereço</li>
          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Ícone próprio na tela inicial</li>
          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Acesso mais rápido ao painel e conteúdos</li>
          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Mesmos dados, permissões e perfis (A119 e H125)</li>
          <li className="flex items-start gap-2"><RefreshCw className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Atualizações automáticas quando uma nova versão for publicada</li>
        </ul>
      </div>

      {/* Desinstalação */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-2">Como desinstalar</h3>
        <p className="text-sm text-muted-foreground">
          Android: pressione o ícone na tela inicial e arraste para "Desinstalar" ou "Remover". iOS: pressione o ícone,
          toque em "Remover App" e confirme. Desktop: abra o app instalado, use o menu do navegador e selecione
          "Desinstalar". A desinstalação não afeta sua conta nem os registros salvos no servidor.
        </p>
      </div>

      {/* Sair e remover dados */}
      <div className="bg-card rounded-2xl border border-destructive/30 p-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-destructive" /> Segurança</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Encerra a sessão e remove os dados privados deste dispositivo (caches, arquivos offline e rascunhos locais).
          Registros já sincronizados com o servidor não são excluídos.
        </p>
        <Button variant="destructive" onClick={handleClearDevice} disabled={cleaning || cleaned}>
          {cleaning ? "Removendo..." : cleaned ? "Concluído" : "Sair e remover dados deste dispositivo"}
        </Button>
      </div>

      {/* Links legais */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <Link to="/privacidade" className="hover:text-primary hover:underline">Política de Privacidade</Link>
        <Link to="/termos" className="hover:text-primary hover:underline">Termos de Uso</Link>
      </div>
    </div>
  );
}

function InstructionCard({ icon: Icon, title, steps, highlight }) {
  return (
    <div className={`bg-card rounded-2xl border p-5 ${highlight ? "border-primary" : "border-border"}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      </div>
      <ol className="space-y-1.5">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-xs font-bold text-primary mt-0.5">{i + 1}.</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}