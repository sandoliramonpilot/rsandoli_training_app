import React, { useState } from "react";
import {
  EDITORIAL_STATUS, PENDING_CONTENT, EFIS_SOURCE,
} from "@/lib/qrhEfisData";
import { WarningList } from "@/components/qrhEfis/WarningBlock";
import {
  Eye, FileText, GraduationCap, ClipboardList, BookOpen, AlertTriangle,
  CheckCircle2, Clock, FileCheck, ChevronRight, Star, StarOff,
} from "lucide-react";

const LAYERS = [
  { id: "consulta", label: "Consulta Rápida", icon: Eye },
  { id: "completo", label: "Procedimento Completo", icon: FileText },
  { id: "estudo", label: "Estudo Dirigido", icon: GraduationCap },
  { id: "fonte", label: "Fonte e Revisão", icon: ClipboardList },
];

export default function ProcedureDetail({ proc, isFavorite, onToggleFavorite }) {
  const [layer, setLayer] = useState("completo");
  const status = EDITORIAL_STATUS[proc.status] || EDITORIAL_STATUS.aguardando_conferencia;
  const approved = proc.status === "aprovado_consulta";

  // Consulta rápida somente para procedimentos aprovados
  const availableLayers = approved
    ? LAYERS
    : LAYERS.filter((l) => l.id !== "consulta");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${status.color}`}>
                {status.label}
              </span>
              {proc.casMessages.map((m) => (
                <span key={m} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
                  {m}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-bold text-slate-100 leading-tight">{proc.title}</h2>
            <p className="text-sm text-amber-400/80 mt-0.5">{proc.titlePt}</p>
          </div>
          <button
            onClick={onToggleFavorite}
            className="p-2 rounded-lg text-slate-500 hover:text-amber-300 hover:bg-amber-500/10 transition-colors shrink-0"
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {isFavorite ? <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> : <StarOff className="w-5 h-5" />}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <Meta label="Sistema" value={proc.system} />
          <Meta label="Equipamento" value={proc.equipment} />
          <Meta label="Categoria" value={proc.category} />
          <Meta label="Aplicabilidade" value={proc.applicability} />
        </div>
      </div>

      {/* Layer tabs */}
      <div className="flex flex-wrap gap-2">
        {availableLayers.map((l) => {
          const Icon = l.icon;
          const active = layer === l.id;
          const disabled = l.id === "consulta" && !approved;
          return (
            <button
              key={l.id}
              onClick={() => setLayer(l.id)}
              disabled={disabled}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200 border border-slate-700/60 hover:border-slate-600"
              } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <Icon className="w-4 h-4" /> {l.label}
            </button>
          );
        })}
      </div>

      {/* Layer content */}
      {layer === "consulta" && <ConsultaLayer proc={proc} />}
      {layer === "completo" && <CompletoLayer proc={proc} />}
      {layer === "estudo" && <EstudoLayer proc={proc} />}
      {layer === "fonte" && <FonteLayer proc={proc} />}

      {/* Advertência permanente no rodapé do procedimento */}
      <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3">
        <p className="text-[11px] text-amber-300/90 leading-relaxed text-center font-medium">
          {EFIS_SOURCE.document} — {EFIS_SOURCE.section} — Doc No. {EFIS_SOURCE.docNumber}
        </p>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="text-slate-200 font-medium truncate">{value || "—"}</p>
    </div>
  );
}

// CAMADA 1 — CONSULTA RÁPIDA (somente aprovados)
function ConsultaLayer({ proc }) {
  return (
    <div className="space-y-3">
      <div className="bg-[#1A1D25] rounded-2xl border border-emerald-500/30 p-5">
        <SectionTitle icon={CheckCircle2} color="text-emerald-400">Reconhecimento</SectionTitle>
        <p className="text-sm text-slate-300">{proc.indications}</p>
      </div>
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <SectionTitle icon={AlertTriangle} color="text-amber-400">Ação Aprovada</SectionTitle>
        {proc.actions.length > 0 ? (
          <ol className="space-y-1.5">
            {proc.actions.map((a, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2">
                <span className="text-amber-400 font-mono shrink-0">{i + 1}.</span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500">{PENDING_CONTENT}</p>
        )}
      </div>
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <SectionTitle icon={AlertTriangle} color="text-rose-400">Limitação / Critério de Pouso</SectionTitle>
        <p className="text-sm text-slate-300">{proc.landingCriteria}</p>
      </div>
      <div className="text-xs text-slate-500 px-1">
        Ref.: {EFIS_SOURCE.document}, Section 3, p. {proc.page} — Rev. {proc.revision}
      </div>
    </div>
  );
}

// CAMADA 2 — PROCEDIMENTO COMPLETO
function CompletoLayer({ proc }) {
  return (
    <div className="space-y-3">
      {/* Condição e indicações */}
      <Card title="Condição / Indicações" icon={Eye}>
        <KV label="Mensagem CAS" value={proc.casMessages.join(", ") || "—"} mono />
        <KV label="Classificação CAS" value={proc.casClassification} />
        <KV label="Alerta sonoro / voz" value={proc.auralAlert} />
        <KV label="Condição de voo" value={proc.flightCondition || PENDING_CONTENT} />
        <div className="mt-3 pt-3 border-t border-slate-700/40">
          <p className="text-xs text-slate-500 mb-1">Indicações</p>
          <p className="text-sm text-slate-300">{proc.indications}</p>
        </div>
        <div className="mt-2">
          <p className="text-xs text-slate-500 mb-1">Efeitos</p>
          <p className="text-sm text-slate-300">{proc.effects}</p>
        </div>
      </Card>

      {/* Ações */}
      <Card title="Ações" icon={FileText}>
        {proc.actions.length > 0 ? (
          <ol className="space-y-1.5">
            {proc.actions.map((a, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2">
                <span className="text-amber-400 font-mono shrink-0">{i + 1}.</span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        ) : (
          <PendingNotice />
        )}
      </Card>

      {/* Decisões condicionais */}
      {proc.conditionalDecisions.length > 0 && (
        <Card title="Decisões Condicionais (Fluxograma)" icon={ChevronRight}>
          <div className="space-y-3">
            {proc.conditionalDecisions.map((d, i) => (
              <div key={i} className="rounded-lg border border-slate-700/60 bg-[#12141A] p-3">
                <p className="text-sm font-medium text-slate-200 mb-2">IF / SE: {d.condition}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2">
                    <p className="text-xs font-semibold text-emerald-400 mb-0.5">YES / SIM</p>
                    <p className="text-xs text-slate-300">{d.yes}</p>
                  </div>
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-2">
                    <p className="text-xs font-semibold text-rose-400 mb-0.5">NO / NÃO</p>
                    <p className="text-xs text-slate-300">{d.no}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Monitoramento e continuidade */}
      <Card title="Monitoramento e Continuidade" icon={Clock}>
        <KV label="Monitoramento" value={proc.monitoring} />
        <KV label="Limitações" value={proc.limitations} />
        <KV label="Critério de continuidade" value={proc.continuityCriteria} />
        <KV label="Critério de pouso" value={proc.landingCriteria} />
      </Card>

      {/* Warnings / Cautions / Notes */}
      {(proc.warnings.length > 0 || proc.cautions.length > 0 || proc.notes.length > 0) && (
        <Card title="Warnings / Cautions / Notes" icon={AlertTriangle}>
          <div className="space-y-2">
            <WarningList items={proc.warnings} type="warning" />
            <WarningList items={proc.cautions} type="caution" />
            <WarningList items={proc.notes} type="note" />
          </div>
        </Card>
      )}

      {/* Referências cruzadas */}
      {proc.crossReferences.length > 0 && (
        <Card title="Referências Cruzadas" icon={BookOpen}>
          <ul className="space-y-1">
            {proc.crossReferences.map((r, i) => (
              <li key={i} className="text-sm text-sky-300 hover:text-sky-200 cursor-pointer">{r}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Pontos a descrever (orientação de transcrição) */}
      {proc.descriptionPoints.length > 0 && (
        <Card title="Estrutura de Transcrição — Pontos a Conferir" icon={FileCheck}>
          <p className="text-xs text-slate-500 mb-2">
            Itens a serem transcritos fielmente do documento original (p. {proc.page}):
          </p>
          <ul className="space-y-1">
            {proc.descriptionPoints.map((d, i) => (
              <li key={i} className="text-sm text-slate-400 flex gap-2">
                <span className="text-slate-600 shrink-0">•</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

// CAMADA 3 — ESTUDO DIRIGIDO
function EstudoLayer({ proc }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-teal-500/30 bg-teal-950/20 p-4">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300">Modo de Estudo</span>
        </div>
        <p className="text-xs text-teal-200/70">
          Explicação didática — não substitui o procedimento aprovado. Não altera a ordem, valores ou mensagens CAS.
        </p>
      </div>

      <Card title="Descrição do Sistema" icon={BookOpen}>
        <p className="text-sm text-slate-300">
          {proc.studyContent?.systemDescription || PENDING_CONTENT}
        </p>
      </Card>

      <Card title="Significado da Falha" icon={AlertTriangle}>
        <p className="text-sm text-slate-300">
          {proc.studyContent?.faultMeaning || PENDING_CONTENT}
        </p>
      </Card>

      <Card title="Indicações e Informações Perdidas" icon={Eye}>
        <p className="text-sm text-slate-300">
          {proc.studyContent?.indicationsAndLoss || PENDING_CONTENT}
        </p>
      </Card>

      <Card title="Lógica de Reconfiguração" icon={ChevronRight}>
        <p className="text-sm text-slate-300">
          {proc.studyContent?.reconfigurationLogic || PENDING_CONTENT}
        </p>
      </Card>

      <Card title="Efeitos sobre Flight Director e HeliPilot" icon={FileText}>
        <p className="text-sm text-slate-300">
          {proc.studyContent?.fdAndHeliPilotEffects || PENDING_CONTENT}
        </p>
      </Card>

      <Card title="Erros Comuns de Interpretação" icon={AlertTriangle}>
        <p className="text-sm text-slate-300">
          {proc.studyContent?.commonErrors || PENDING_CONTENT}
        </p>
      </Card>

      <Card title="Perguntas de Revisão" icon={GraduationCap}>
        {proc.studyContent?.reviewQuestions?.length > 0 ? (
          <ol className="space-y-1.5">
            {proc.studyContent.reviewQuestions.map((q, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2">
                <span className="text-teal-400 font-mono shrink-0">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        ) : (
          <PendingNotice />
        )}
      </Card>
    </div>
  );
}

// CAMADA 4 — FONTE E REVISÃO
function FonteLayer({ proc }) {
  return (
    <div className="space-y-3">
      <Card title="Documento Fonte" icon={ClipboardList}>
        <KV label="Documento" value={EFIS_SOURCE.document} />
        <KV label="Seção" value={EFIS_SOURCE.section} />
        <KV label="Nº do documento" value={EFIS_SOURCE.docNumber} mono />
        <KV label="Página" value={proc.page} mono />
        <KV label="Revisão" value={proc.revision} />
        <KV label="Data da revisão" value={proc.revisionDate || "Pendente de conferência visual"} />
        <KV label="Aplicabilidade" value={proc.applicability} />
        <KV label="Configuração" value={proc.configuration || "Pendente de conferência"} />
      </Card>

      <Card title="Controle de Transcrição" icon={FileCheck}>
        <KV label="Data da transcrição" value={proc.transcriptionDate || "—"} />
        <KV label="Responsável pela transcrição" value={proc.transcribedBy || "—"} />
        <KV label="Responsável pela revisão" value={proc.reviewedBy || "—"} />
        <KV label="Responsável pela aprovação" value={proc.approvedBy || "—"} />
        <KV label="Status editorial" value={EDITORIAL_STATUS[proc.status]?.label || proc.status} />
      </Card>

      {proc.status !== "aprovado_consulta" && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">Conteúdo não aprovado para consulta operacional</span>
          </div>
          <p className="text-xs text-amber-200/80">
            Este procedimento não aparece no modo de Consulta Rápida até obter status "Aprovado para consulta".
            O conteúdo procedural deve ser conferido visualmente no documento original antes da publicação.
          </p>
        </div>
      )}
    </div>
  );
}

function Card({ title, icon: Icon, children }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-[#12141A] border-b border-slate-700/60">
        {Icon && <Icon className="w-4 h-4 text-amber-400" />}
        <h3 className="font-semibold text-sm text-slate-200">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function SectionTitle({ icon: Icon, color, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-4 h-4 ${color}`} />
      <h3 className="text-sm font-semibold text-slate-200">{children}</h3>
    </div>
  );
}

function KV({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-3 text-sm py-1.5 border-b border-slate-700/30 last:border-0">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className={`text-slate-200 text-right truncate ${mono ? "font-mono text-xs" : ""}`}>{value || "—"}</span>
    </div>
  );
}

function PendingNotice() {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
      <p className="text-sm text-amber-300/90 font-medium">{PENDING_CONTENT}</p>
    </div>
  );
}