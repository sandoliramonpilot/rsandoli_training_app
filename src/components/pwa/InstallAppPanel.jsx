import React from "react";
import { Link } from "react-router-dom";
import {
  Download,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Monitor,
  Trash2,
} from "lucide-react";
import { useInstall } from "@/lib/pwa";
import InstallGuide from "@/components/pwa/InstallGuide";

const BENEFITS = [
  "Abre em janela própria, sem a barra de endereço do navegador.",
  "Ícone e nome próprios na tela inicial, área de trabalho ou dock.",
  "Acesso mais rápido no dia a dia operacional.",
  "Mesmo login, mesmas permissões e os mesmos dados da versão web.",
];

export default function InstallAppPanel() {
  const { canInstall, installed, platform, promptInstall } = useInstall();
  const canPrompt = canInstall;
  const needsSafari = platform.id === "ios" && !platform.safari;

  const install = async () => {
    if (canPrompt) await promptInstall();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <img
            src="/icons/icon-192.png"
            alt="Ícone do RSandoli Training"
            width="88"
            height="88"
            className="h-[88px] w-[88px] shrink-0 rounded-2xl border border-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">
              Configurações
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              Instalar RSandoli Training
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Instale o RSandoli Training neste dispositivo para acessar o aplicativo diretamente
              pela tela inicial.
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Nome</dt>
            <dd className="text-sm text-foreground">RSandoli Training</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Nome curto
            </dt>
            <dd className="text-sm text-foreground">RSandoli</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Estado atual da instalação
            </dt>
            <dd className="mt-0.5 inline-flex items-center gap-2 text-sm">
              {installed ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="text-foreground">Aplicativo instalado neste dispositivo</span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  Ainda não instalado — o aplicativo está sendo usado pelo navegador.
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Compatibilidade do navegador
            </dt>
            <dd className="text-sm text-muted-foreground">
              {canPrompt
                ? "Este navegador oferece instalação automática."
                : needsSafari
                ? "Neste dispositivo, a instalação pelo Safari está disponível."
                : "A instalação automática não pôde ser confirmada. Use as instruções abaixo para verificar no menu do navegador."}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {installed ? (
            <span className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-secondary px-4 text-sm font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
              Aplicativo instalado neste dispositivo
            </span>
          ) : canPrompt ? (
            <button
              type="button"
              onClick={install}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Instalar aplicativo
            </button>
          ) : (
            <span className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-secondary px-4 text-sm text-muted-foreground">
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              Use as instruções abaixo para instalar
            </span>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          {platform.id === "desktop" ? (
            <Monitor className="h-5 w-5 text-primary" aria-hidden="true" />
          ) : (
            <Smartphone className="h-5 w-5 text-primary" aria-hidden="true" />
          )}
          Instalação em {platform.label}
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Siga a sequência abaixo. O procedimento é o mesmo tanto para a instalação automática
          quanto para a manual.
        </p>
        <InstallGuide platformId={platform.id} safariFallback={platform.safari} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">Benefícios da instalação</h2>
          <ul className="mt-3 space-y-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <RefreshCw className="h-5 w-5 text-primary" aria-hidden="true" />
            Atualizações automáticas
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Novas versões publicadas ficam disponíveis automaticamente para o aplicativo instalado.
            A versão nova é baixada em segundo plano e você escolhe o momento de aplicá-la, para
            não interromper um registro em andamento.
          </p>

          <h3 className="mt-5 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Trash2 className="h-4 w-4 text-primary" aria-hidden="true" />
            Como desinstalar
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Remova o ícone do RSandoli Training como faria com qualquer aplicativo: mantenha
            pressionado o ícone na tela inicial e escolha desinstalar ou remover. Nos computadores,
            use o menu do navegador ou as configurações do aplicativo instalado. Nenhum registro já
            sincronizado é apagado por essa ação.
          </p>

          <h3 className="mt-5 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            Privacidade e termos
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Consulte a{" "}
            <Link to="/privacidade" className="text-primary underline underline-offset-4">
              Política de Privacidade
            </Link>{" "}
            e os{" "}
            <Link to="/termos" className="text-primary underline underline-offset-4">
              Termos de Uso
            </Link>
            .
          </p>
        </section>
      </div>

      <p className="text-xs text-muted-foreground">
        Adicionar à tela inicial não é o mesmo que publicar nas lojas de aplicativos: o aplicativo
        instalado usa o mesmo endereço, o mesmo banco de dados e as mesmas regras da versão web.
      </p>
    </div>
  );
}