import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Plane, ShieldCheck, Users, ArrowLeft } from "lucide-react";

export default function Sobre() {
  return (
    <div className="min-h-screen bg-[#12141A] text-[#F2EFE6]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao app
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <GraduationCap className="w-8 h-8 text-slate-900" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">RSANDOLI PILOTS</p>
            <h1 className="text-3xl font-bold tracking-tight">Sobre o HeliPilot Pro</h1>
          </div>
        </div>

        <div className="space-y-5 text-slate-300 leading-relaxed">
          <p>
            O <strong className="text-amber-300">HeliPilot Pro</strong> é uma plataforma completa de instrução teórica,
            treinamento operacional, gestão de pilotos e consulta técnica digital, desenvolvida especificamente
            para equipes que operam o helicóptero <strong>Leonardo AW119Kx Koala</strong>. A aplicação centraliza
            todo o ecossistema operacional em um único ambiente digital, unindo o rigor da documentação
            aeronáutica oficial com a praticidade de uma interface moderna e responsiva.
          </p>

          <p>
            A plataforma oferece módulos de <strong>Academy</strong> com currículo estruturado de treinamento
            (AW119 Training, Limitações, Procedimentos Normais e de Emergência, Treinamento Recorrente,
            Briefing de Emergência e Recursos Audiovisuais), além de ferramentas operacionais como
            Diário de Bordo, Checklists, QRH e QRH-EFIS para consulta rápida em voo. O módulo de gestão
            de pilotos e OAT/TRIP.OPER permite o cadastro completo de tripulantes, com controle de
            licenças, habilitações, qualificações, endossos, autorizações operacionais e escalas,
            tudo com rastreabilidade e auditoria.
          </p>

          <p>
            <strong className="text-amber-300">Para quem é:</strong> pilotos comandantes e copilotos,
            instrutores aeronáuticos, gestores de operações, equipe OAT/TRIP.OPER e administradores
            que precisam de uma ferramenta confiável para manter a capacitação técnica sempre atualizada
            e os registros operacionais em conformidade com os requisitos da ANAC e das autoridades
            aeronáuticas. A plataforma atende tanto o treinamento inicial quanto o recorrente,
            com acompanhamento individual de progresso e validade de certificações.
          </p>

          <p>
            <strong className="text-amber-300">Quem constrói:</strong> o HeliPilot Pro é desenvolvido e mantido
            pela equipe RSANDOLI PILOTS Helicopter Training, com expertise em operações de asas rotativas
            e foco na segurança operacional. O conteúdo técnico é estruturado segundo o padrão
            AW119 Training, com fluxo de aprovação administrativa para todos os materiais da Academy,
            garantindo que cada documento, aula ou arquivo passe por revisão antes de ser publicado
            para os usuários. A plataforma opera em conformidade com as publicações oficiais do
            fabricante e da ANAC, com transparência didática sobre o status de cada informação.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 pt-4">
            <FeatureCard icon={Plane} title="Operacional" desc="Diário de bordo, checklists e QRH digital" />
            <FeatureCard icon={GraduationCap} title="Academy" desc="Treinamento teórico e recorrente estruturado" />
            <FeatureCard icon={Users} title="Gestão" desc="Pilotos, OAT, licenças e escalas com auditoria" />
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap gap-4 text-sm">
          <Link to="/contato" className="text-amber-400 hover:text-amber-300">Contato</Link>
          <Link to="/privacidade" className="text-slate-500 hover:text-slate-300">Política de Privacidade</Link>
          <Link to="/termos" className="text-slate-500 hover:text-slate-300">Termos de Uso</Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-[#1A1D25] rounded-xl border border-slate-700/60 p-4">
      <Icon className="w-5 h-5 text-amber-400 mb-2" />
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </div>
  );
}