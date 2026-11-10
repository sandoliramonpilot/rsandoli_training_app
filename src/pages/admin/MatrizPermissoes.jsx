import React from "react";
import {
  ACCESS_LEVELS, PERMISSION_MODULES, DEFAULT_PERMISSIONS_BY_LEVEL,
} from "@/lib/accessControl";
import { AIRCRAFT_PROFILES, PROFILE_LABELS } from "@/lib/aircraftProfile";
import { ShieldCheck, Plane, Lock, KeyRound, FileCheck2, Layers } from "lucide-react";

const ACTION_CODES = {
  visualizar: "V", criar: "C", editar: "E", excluir: "X", aprovar: "AP",
  finalizar: "F", exportar: "EXP", download: "DL", administrar: "ADM",
  proprios: "PR", unidade: "UN", todos: "T",
};

const SERVER_GUARDS = [
  { icon: Lock, title: "Autenticação e hierarquia", desc: "Toda função de backend valida sessão, situação da conta e nível hierárquico antes de agir. Ninguém executa ações de nível igual ou superior ao seu." },
  { icon: KeyRound, title: "Código step-up (operações sensíveis)", desc: "Alterar nível, situação da conta, permissões, conceder Master ou redefinir senha exigem código de 6 dígitos HMAC-SHA256, consumido em uma única tentativa." },
  { icon: Plane, title: "Escopo de perfis de aeronave", desc: "Administradores não-geral só veem e gerenciam usuários dentro dos perfis de aeronave que administram. Atribuição de perfis fora do escopo é rejeitada pelo backend." },
  { icon: ShieldCheck, title: "Auditoria completa", desc: "Toda ação administrativa grava registro em AccessAuditLog com ator, alvo, ação e detalhes, para rastreabilidade." },
];

const CHECKLIST = [
  { label: "Administrador Geral: criar, editar, bloquear e redefinir senha de usuários", tag: "admin_geral" },
  { label: "Administrador de módulo único: enxerga apenas usuários do seu perfil de aeronave", tag: "escopo" },
  { label: "Usuário com AW119 + H125: alterna perfis no seletor e vê ambos os treinamentos", tag: "duplo" },
  { label: "Usuário recém-cadastrado sem perfil: vê tela de \"nenhum módulo liberado\" e não acessa treinamento", tag: "sem_perfil" },
  { label: "Alteração de nível de acesso: exige código step-up e grava auditoria", tag: "sensivel" },
  { label: "Atribuição de perfil fora do escopo: rejeitada pelo backend", tag: "escopo" },
  { label: "Conta bloqueada/suspensa/desativada: login e ações administrativas negadas", tag: "situacao" },
  { label: "Navegação e conteúdo acompanham o módulo ativo (AW119/H125)", tag: "modulo_ativo" },
];

export default function MatrizPermissoes() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Administração · Segurança</p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mt-1">Matriz de Permissões e Segurança</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Inventário do modelo de autorização por nível, módulo e perfil de aeronave, com o resumo das
          verificações server-side e o checklist de validação do ciclo de acesso e segurança.
        </p>
      </header>

      <NiveisCard />
      <MatrixCard />
      <ScopeCard />
      <ServerSideCard />
      <ValidationChecklist />
    </div>
  );
}

function NiveisCard() {
  return (
    <section className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
      <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Layers className="w-4 h-4" /> Níveis de acesso
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {ACCESS_LEVELS.map((l) => (
          <div key={l.id} className="rounded-xl border border-slate-700/60 bg-[#12141A] px-4 py-3">
            <p className="text-sm font-medium text-slate-100">{l.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">Rank {l.rank}{l.id === "admin_geral" ? " · Acesso total" : ""}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MatrixCard() {
  const levels = ACCESS_LEVELS.filter((l) => l.id !== "admin_geral");
  return (
    <section className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
      <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4" /> Matriz de permissões por nível
      </h2>
      <p className="text-xs text-slate-500 mb-3">
        Administrador Geral tem acesso total. Demais níveis seguem a matriz padrão abaixo (permissões
        personalizadas podem sobrescrever por módulo).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700/60">
              <th className="text-left py-2 pr-3 font-medium">Módulo</th>
              {levels.map((l) => (
                <th key={l.id} className="py-2 px-1.5 font-medium text-center whitespace-nowrap">{l.name.split(" ")[0]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_MODULES.map((m) => (
              <tr key={m.id} className="border-b border-slate-700/30">
                <td className="py-1.5 pr-3 text-slate-300">{m.name}</td>
                {levels.map((l) => {
                  const perms = DEFAULT_PERMISSIONS_BY_LEVEL[l.id]?.[m.id];
                  return (
                    <td key={l.id} className="py-1.5 px-1.5 text-center">
                      {perms && perms.length ? (
                        <span className="text-slate-200 font-mono">{perms.map((a) => ACTION_CODES[a] || a).join("·")}</span>
                      ) : (
                        <span className="text-slate-700">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-600 mt-2">
        V=visualizar · C=criar · E=editar · X=excluir · AP=aprovar · F=finalizar · EXP=exportar · DL=download · PR=próprios · UN=unidade · T=todos
      </p>
    </section>
  );
}

function ScopeCard() {
  return (
    <section className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
      <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Plane className="w-4 h-4" /> Escopo por perfil de aeronave
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {AIRCRAFT_PROFILES.map((p) => (
          <div key={p} className="rounded-xl border border-slate-700/60 bg-[#12141A] px-4 py-3">
            <p className="text-sm font-medium text-slate-100 flex items-center gap-2">
              <Plane className="w-3.5 h-3.5 text-amber-400" /> {PROFILE_LABELS[p]}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Habilita o módulo de treinamento {p}. Usuários com ambos os perfis alternam entre os
              treinamentos no seletor de perfil.
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-3">
        O campo <code className="text-amber-300">aircraft_profiles</code> do usuário controla o acesso aos
        treinamentos. Administradores não-geral só atribuem perfis que já gerenciam (escopo server-side).
      </p>
    </section>
  );
}

function ServerSideCard() {
  return (
    <section className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
      <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4" /> Verificações server-side
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {SERVER_GUARDS.map((g) => {
          const Icon = g.icon;
          return (
            <div key={g.title} className="rounded-xl border border-slate-700/60 bg-[#12141A] px-4 py-3 flex items-start gap-3">
              <Icon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-100">{g.title}</p>
                <p className="text-xs text-slate-500 mt-1">{g.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ValidationChecklist() {
  return (
    <section className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
      <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-2">
        <FileCheck2 className="w-4 h-4" /> Checklist de validação do ciclo
      </h2>
      <p className="text-xs text-slate-500 mb-3">
        Cenários a validar com contas administrativas, de módulo único, de módulos duplos e sem perfil completo.
      </p>
      <div className="space-y-2">
        {CHECKLIST.map((c, i) => (
          <label key={i} className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-[#12141A] px-3 py-2.5 cursor-pointer hover:border-slate-600">
            <input type="checkbox" className="accent-amber-500 mt-0.5" />
            <div>
              <p className="text-sm text-slate-200">{c.label}</p>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">{c.tag}</p>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}