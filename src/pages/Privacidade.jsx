import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-[#12141A] text-[#F2EFE6]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao app
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-bold tracking-tight">Política de Privacidade</h1>
        </div>

        <p className="text-xs text-slate-500 mb-8">Última atualização: outubro de 2026</p>

        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          <Section title="1. Coleta de Dados">
            <p>
              A plataforma HeliPilot Pro coleta dados pessoais fornecidos pelo usuário no momento do cadastro
              e durante o uso da aplicação, incluindo nome completo, e-mail, telefone, matrícula, CPF, RG,
              dados de licenças e habilitações aeronáuticas, registros operacionais e informações de acesso
              (endereço IP, dispositivo e sessão). Esses dados são utilizados exclusivamente para a
              operacionalização da plataforma e gestão de tripulantes.
            </p>
          </Section>

          <Section title="2. Finalidade do Tratamento">
            <p>
              Os dados são tratados com a finalidade de gerenciar cadastros de pilotos e OAT/TRIP.OPER,
              controlar validade de licenças e certificações, registrar horas de voo e checklists, manter
              histórico de treinamento e progresso acadêmico, garantir a segurança operacional e cumprir
              requisitos regulatórios da ANAC e autoridades aeronáuticas.
            </p>
          </Section>

          <Section title="3. Compartilhamento">
            <p>
              Os dados pessoais não são compartilhados com terceiros para fins comerciais. O acesso aos
              dados é restrito a administradores autorizados e ao próprio usuário para seus registros.
              Dados agregados e anonimizados podem ser utilizados para análises internas sem identificação
              individual. A plataforma atende aos princípios da LGPD (Lei nº 13.709/2018).
            </p>
          </Section>

          <Section title="4. Segurança">
            <p>
              A plataforma adota medidas técnicas e administrativas para proteger os dados pessoais,
              incluindo criptografia em trânsito, controle de acesso baseado em papéis (RBAC), row-level
              security no banco de dados, registro de auditoria para operações sensíveis e autenticação
              multi-fator quando aplicável. Arquivos sensíveis são armazenados em armazenamento privado.
            </p>
          </Section>

          <Section title="5. Direitos do Titular">
            <p>
              O titular dos dados possui o direito de acessar, corrigir, atualizar e solicitar a exclusão
              de seus dados pessoais, conforme previsto pela LGPD. Solicitações podem ser enviadas através
              da página de contato. A exclusão de dados pode estar sujeita a requisitos de retenção
              regulatória aplicáveis ao setor aeronáutico.
            </p>
          </Section>

          <Section title="6. Retenção">
            <p>
              Os dados são mantidos pelo tempo necessário para cumprir as finalidades descritas e os
              requisitos legais e regulatórios do setor aeronáutico. Registros operacionais e de
              treinamento podem ser mantidos por períodos estabelecidos pela ANAC ou pela organização
              operadora, mesmo após o desligamento do tripulante.
            </p>
          </Section>

          <Section title="7. Contato">
            <p>
              Para questões relacionadas à privacidade e tratamento de dados pessoais, entre em contato
              através da página de <Link to="/contato" className="text-amber-400 hover:text-amber-300">Contato</Link>.
            </p>
          </Section>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap gap-4 text-sm">
          <Link to="/sobre" className="text-slate-500 hover:text-slate-300">Sobre</Link>
          <Link to="/contato" className="text-slate-500 hover:text-slate-300">Contato</Link>
          <Link to="/termos" className="text-slate-500 hover:text-slate-300">Termos de Uso</Link>
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