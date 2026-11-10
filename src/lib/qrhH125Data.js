// Camada de dados do QRH H125 (AS350 B2 / B3e).
// Reutiliza o conteúdo transcrito em h125PocketChecklistData.js e adiciona
// chaves estáveis por procedimento para vincular o estado de validação
// persistido na entidade QrhValidation.
//
// AVISO: conteúdo operacional transcrito de fonte fornecida, pendente de
// validação técnica aeronáutica. Não substitui o RFM/POH vigente (ANAC).
import { H125_POCKET_SOURCE, H125_POCKET_GROUPS } from "@/lib/h125PocketChecklistData";

// Mapeia o id de sub-variante (ProfileContext) -> chave de H125_POCKET_SOURCE
export const QRH_H125_VARIANT_KEYS = {
  b2_vemd: "B2",
  b3e_arriel2d: "B3e",
};

export const QRH_H125_GROUPS = H125_POCKET_GROUPS; // emergencias, normais, limites

/** Chave estável para um procedimento dentro de uma variante. */
export function buildQrhProcedureKey(variantKey, group, procName) {
  const norm = (s) => String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${variantKey}:${group}:${norm(procName)}`;
}

/** Retorna a estrutura de QRH para uma variante, com procedure_key em cada item. */
export function getQrhH125Data(variantKey) {
  const source = H125_POCKET_SOURCE[variantKey] || H125_POCKET_SOURCE.B2;
  const withKeys = (group) =>
    (source[group] || []).map((item, idx) => ({
      ...item,
      procedure_key: buildQrhProcedureKey(variantKey, group, item.n),
      group,
      index: idx,
    }));
  return {
    variantKey,
    label: source.label,
    short: source.short,
    pdfUrl: source.pdfUrl,
    emergencias: withKeys("emergencias"),
    normais: withKeys("normais"),
    limites: withKeys("limites"),
  };
}

/** Rótulo curto do estado de validação. */
export const VALIDATION_STATUS_META = {
  pending: { label: "Pendente", color: "amber", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  approved: { label: "Aprovado", color: "emerald", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  rejected: { label: "Reprovado", color: "rose", badge: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};