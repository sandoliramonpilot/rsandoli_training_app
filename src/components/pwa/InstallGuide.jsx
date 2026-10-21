import React from "react";
import { Share, MoreVertical, MonitorDown, Plus } from "lucide-react";

// Instruções específicas por dispositivo. O texto é a instrução principal:
// os ícones apenas reforçam, nunca substituem a informação.

const STEPS = {
  ios: [
    { text: "Abra o RSandoli Training no Safari.", icon: null },
    { text: "Toque no botão Compartilhar.", icon: Share },
    { text: "Selecione “Adicionar à Tela de Início”.", icon: Plus },
    { text: "Confirme em “Adicionar”.", icon: null },
  ],
  android: [
    { text: "Abra o menu do navegador.", icon: MoreVertical },
    { text: "Selecione “Instalar aplicativo” ou “Adicionar à tela inicial”.", icon: MonitorDown },
    { text: "Confirme a instalação.", icon: null },
  ],
  desktop: [
    { text: "Procure o ícone de instalação na barra de endereço do navegador.", icon: MonitorDown },
    { text: "Ou abra o menu do navegador e escolha “Instalar RSandoli Training”.", icon: MoreVertical },
    { text: "Confirme a instalação. O aplicativo abre em uma janela própria.", icon: null },
  ],
};

export default function InstallGuide({ platformId = "desktop", safariFallback = false }) {
  const type = platformId === "ios" ? "ios" : platformId === "android" ? "android" : "desktop";
  const steps = STEPS[type];

  return (
    <div className="space-y-3">
      {type === "ios" && !safariFallback && (
        <p className="text-sm text-muted-foreground">
          Neste dispositivo, abra o endereço do RSandoli Training no Safari para concluir a
          instalação.
        </p>
      )}
      <ol className="space-y-2.5">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.text} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-xs font-semibold text-foreground"
              >
                {i + 1}
              </span>
              <span className="text-sm text-foreground leading-relaxed flex items-start gap-2">
                {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />}
                {step.text}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}