import React from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";

export default function Termos() {
  return (
    <div className="min-h-screen bg-[#12141A] text-[#F2EFE6]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao app
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-bold tracking-tight">Termos de Uso</h1>
        </div>

        <p className="text-xs text-slate-500 mb-8">Última atualização: outubro de 2026</p>

        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          <Section title="1. Aceitação dos Termos">
            <p>
              Ao acessar e utilizar a plataforma HeliPilot Pro, o usuário concorda integralmente com estes
              Termos de Uso e com a <Link to="/privacidade" className="text-amber-400 hover:text-amber-300">Política de Privacidade</Link>.
              O aceite dos termos é registrado no momento do primeiro acesso à plataforma, com registro
              de auditoria contendo data, hora, endereço IP e informações do dispositivo.
            </p>
          </Section>

          <Section title="2. Natureza da Plataforma">
            <p>
              O HeliPilot Pro é uma plataforma de instrução teórica, treinamento operacional e gestão de
              tripulantes para operações com helicópteros AW119Kx Koala. O conteúdo técnico disponibilizado
              na Academy tem caráter didático e complementar, não substituindo a documentação oficial
              aprovada pelo fabricante (Leonardo) ou pelas autoridades aeronáuticas (ANAC). Em caso de
              divergência, prevalece sempre a documentação oficial.
            </p>
          </Section>

          <Section title="3. Acesso e Autenticação">
            <p>
              O acesso à plataforma é restrito a usuários cadastrados e autorizados. Cada usuário é
              responsável pela confidencialidade de suas credenciais de acesso e por todas as atividades
              realizadas em sua conta. A plataforma suporta autenticação por e-mail/senha e provedores
              OAuth (Google, Microsoft, Facebook, Apple). O acesso pode ser bloqueado ou suspenso por
              administradores em caso de violação destes termos.
            </p>
          </Section>

          <Section title="4. Responsabilidades do Usuário">
            <p>
              O usuário compromete-se a fornecer informações verdadeiras e atualizadas em seu cadastro,
              utilizar a plataforma exclusivamente para fins profissionais relacionados às operações
              aeronáuticas, não compartilhar suas credenciais com terceiros e não tentar acessar dados
              de outros usuários sem autorização. A inserção deliberada de informações falsas em registros
              operacionais ou de certificações constitui violação grave destes termos.
            </p>
          </Section>

          <Section title="5. Conteúdo e Aprovação">
            <p>
              Todo o conteúdo publicado na Academy (módulos, aulas, arquivos e documentos) passa por um
              fluxo de aprovação administrativa antes de ser disponibilizado. Materiais pendentes de
              aprovação não são exibidos para usuários comuns. O status de aprovação é exibido
              transparentemente quando aplicável. O conteúdo técnico pode incluir marcações de status
              (confirmado, corrigido, pendente) para indicar o nível de validação oficial.
            </p>
          </Section>

          <Section title="6. Limitação de Responsabilidade">
            <p>
              A plataforma é fornecida "como está". A equipe RSANDOLI PILOTS não se responsabiliza por
              decisões operacionais tomadas com base exclusivamente no conteúdo da plataforma. As
              informações técnicas devem sempre ser confrontadas com a documentação oficial aprovada.
              A plataforma não substitui o julgamento profissional do piloto ou as regulamentações
              vigentes da autoridade aeronáutica.
            </p>
          </Section>

          <Section title="7. Modificações">
            <p>
              Estes Termos de Uso podem ser modificados a qualquer tempo. Alterções significativas serão
              comunicadas aos usuários. O uso continuado da plataforma após a modificação constitui
              aceitação dos termos atualizados.
            </p>
          </Section>

          <Section title="8. Contato">
            <p>
              Para questões relacionadas a estes Termos de Uso, entre em contato através da página de
              <Link to="/contato" className="text-amber-400 hover:text-amber-300"> Contato</Link>.
            </p>
          </Section>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap gap-4 text-sm">
          <Link to="/sobre" className="text-slate-500 hover:text-slate-300">Sobre</Link>
          <Link to="/contato" className="text-slate-500 hover:text-slate-300">Contato</Link>
          <Link to="/privacidade" className="text-slate-500 hover:text-slate-300">Política de Privacidade</Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-100 mb-2">{title}</h2>
      <div className="text-slate-400">{children}</div>
    </div>
  );
}