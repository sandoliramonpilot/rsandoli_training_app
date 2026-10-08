// OAT/TRIP.OPER module helpers — labels, expiry computation, JSON parsing.
// Módulo independente — não compartilha identificadores com Pilotos.

export const OAT_FUNCTION_LABELS = {
  oat: "OAT",
  oat_nurse: "OAT/Enfermeiro",
  instructor: "Instrutor",
  pilot_collaborator: "Piloto colaborador",
  other: "Outra função autorizada",
};

export const OAT_FUNCTION_SITUATIONS = [
  { id: "active", label: "Ativa" },
  { id: "suspended", label: "Suspensa" },
  { id: "closed", label: "Encerrada" },
  { id: "evaluation", label: "Em avaliação" },
];

export const OAT_HABILITATION_TYPES = [
  { id: "hmnc", label: "HMNC" },
  { id: "hmnt", label: "HMNT" },
  { id: "ifrh", label: "IFR-H" },
  { id: "invh", label: "INVH" },
  { id: "hmlt", label: "HMLT" },
  { id: "exacred", label: "EXACRED" },
  { id: "oat_qual", label: "Qualificação OAT" },
  { id: "other", label: "Outra habilitação" },
];

export const OAT_HABILITATION_SITUATIONS = [
  { id: "valid", label: "Válida" },
  { id: "near_expiry", label: "Próxima do vencimento" },
  { id: "expired", label: "Vencida" },
  { id: "suspended", label: "Suspensa" },
  { id: "renewing", label: "Em renovação" },
  { id: "pending", label: "Pendente de conferência" },
  { id: "na", label: "Não aplicável" },
];

export const OAT_CERTIFICATE_TYPES = [
  { id: "crm", label: "CRM" },
  { id: "dangerous_goods", label: "Artigos Perigosos" },
  { id: "op_safety", label: "Segurança Operacional" },
  { id: "aph", label: "APH" },
  { id: "recurring_flight", label: "Treinamento periódico de voo" },
  { id: "recurring_ground", label: "Treinamento periódico de solo" },
  { id: "emergency_training", label: "Treinamento de emergências" },
  { id: "other", label: "Outros cursos" },
];

export const OAT_CERTIFICATE_SITUATIONS = [
  { id: "valid", label: "Válido" },
  { id: "near_expiry", label: "Próximo do vencimento" },
  { id: "expired", label: "Vencido" },
  { id: "no_expiry", label: "Sem vencimento" },
  { id: "pending", label: "Pendente de conferência" },
  { id: "rejected", label: "Rejeitado" },
  { id: "archived", label: "Arquivado" },
];

export const OAT_CMA_CLASSES = [
  { id: "class1", label: "Classe 1" },
  { id: "class2", label: "Classe 2" },
  { id: "other", label: "Outra" },
];

export const OAT_AIRCRAFT_MODELS = [
  { id: "aw119_mk2", label: "AW119 MkII" },
  { id: "aw119kx", label: "AW119Kx" },
  { id: "aw119kxi", label: "AW119KXi" },
  { id: "other", label: "Outros" },
];

export const OAT_ENDORSEMENT_FUNCTIONS = [
  { id: "oat", label: "OAT" },
  { id: "oat_nurse", label: "OAT/Enfermeiro" },
  { id: "instructor", label: "Instrutor" },
  { id: "other", label: "Outra" },
];

export const OAT_ENDORSEMENT_SITUATIONS = [
  { id: "valid", label: "Válida" },
  { id: "expired", label: "Vencida" },
  { id: "suspended", label: "Suspensa" },
  { id: "training", label: "Em treinamento" },
  { id: "pending", label: "Pendente de aprovação" },
  { id: "closed", label: "Encerrada" },
];

export const OAT_DOC_CATEGORIES = [
  { id: "cma", label: "CMA" },
  { id: "certificate", label: "Certificado" },
  { id: "passport", label: "Passaporte" },
  { id: "personal", label: "Documento pessoal" },
  { id: "cv", label: "Currículo" },
  { id: "contract", label: "Contrato" },
  { id: "comprovante", label: "Comprovante" },
  { id: "authorization", label: "Autorização" },
  { id: "license", label: "Licença" },
  { id: "other", label: "Outro anexo" },
];

export const OAT_REGISTRATION_STATUS_LABELS = {
  active: "Ativo",
  inactive: "Inativo",
  vacation: "Férias",
  leave: "Afastado",
  training: "Em treinamento",
  pending: "Cadastro pendente",
};

export const OAT_REGISTRATION_STATUS_STYLES = {
  active: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  inactive: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  vacation: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  leave: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  training: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  pending: "bg-amber-500/10 text-amber-300 border-amber-500/30",
};

export const OAT_CHANGE_TYPE_LABELS = {
  simple: "Alteração simples",
  operational: "Alteração operacional",
  critical: "Alteração crítica",
};

export const OAT_CHANGE_STATUS_LABELS = {
  draft: "Rascunho",
  pending: "Pendente",
  in_review: "Em análise",
  doc_check: "Em conferência documental",
  tech_review: "Em revisão técnica",
  approved: "Aprovada",
  rejected: "Rejeitada",
  cancelled: "Cancelada",
  expired: "Expirada",
  completed: "Concluída",
};

export const OAT_HOURS_SOURCES = [
  { id: "declared", label: "Declarada" },
  { id: "imported", label: "Importada do Diário de Bordo" },
  { id: "administrative", label: "Inserida administrativamente" },
  { id: "validated", label: "Validada pela organização" },
];

// Campos protegidos — somente leitura para usuários comuns
export const OAT_PROTECTED_FIELDS = [
  "full_name", "role", "email_login", "anac_code", "cpf",
  "organization", "unit", "permission", "user_id", "legacy_pilot_id",
];

export function safeParse(v, fallback) {
  if (!v) return fallback;
  try {
    const p = typeof v === "string" ? JSON.parse(v) : v;
    return p ?? fallback;
  } catch {
    return fallback;
  }
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
}

export function expiryStatus(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return { status: "none", days: null, label: "—" };
  if (days < 0) return { status: "expired", days, label: `Vencido há ${Math.abs(days)}d` };
  if (days <= 15) return { status: "15", days, label: `${days}d` };
  if (days <= 30) return { status: "30", days, label: `${days}d` };
  if (days <= 60) return { status: "60", days, label: `${days}d` };
  if (days <= 90) return { status: "90", days, label: `${days}d` };
  return { status: "ok", days, label: `${days}d` };
}

export function cmaStatus(cmaData) {
  if (!cmaData || !cmaData.expiry) return { status: "no_info", days: null, label: "Sem informação" };
  const days = daysUntil(cmaData.expiry);
  if (days === null) return { status: "no_info", days: null, label: "Sem informação" };
  if (days < 0) return { status: "expired", days, label: "Vencido" };
  if (days <= 15) return { status: "valid_15", days, label: `Vence em ${days}d` };
  if (days <= 30) return { status: "valid_16_30", days, label: `Vence em ${days}d` };
  if (days <= 60) return { status: "valid_31_60", days, label: `Vence em ${days}d` };
  if (days <= 90) return { status: "valid_61_90", days, label: `Vence em ${days}d` };
  return { status: "valid_90plus", days, label: `Válido (${days}d)` };
}

export const EXPIRY_COLORS = {
  expired: { dot: "bg-rose-500", text: "text-rose-400", pill: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
  "15": { dot: "bg-orange-500", text: "text-orange-400", pill: "bg-orange-500/10 text-orange-300 border-orange-500/30" },
  "30": { dot: "bg-amber-500", text: "text-amber-400", pill: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  "60": { dot: "bg-yellow-500", text: "text-yellow-400", pill: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30" },
  "90": { dot: "bg-sky-500", text: "text-sky-400", pill: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
  ok: { dot: "bg-emerald-500", text: "text-emerald-400", pill: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  none: { dot: "bg-slate-500", text: "text-slate-400", pill: "bg-slate-500/10 text-slate-400 border-slate-500/30" },
};

export function collectExpiries(oat) {
  const items = [];
  const licenses = safeParse(oat.licenses, []);
  const certificates = safeParse(oat.certificates, []);
  const documents = safeParse(oat.documents, []);
  const cma = safeParse(oat.cma, null);
  const endorsements = safeParse(oat.aircraft_endorsements, []);

  licenses.forEach((l) => l.expiry && items.push({ kind: "Habilitação", label: l.typeLabel || l.type || "Habilitação", date: l.expiry }));
  certificates.forEach((c) => c.expiry && items.push({ kind: "Curso", label: c.typeLabel || c.type || "Curso", date: c.expiry }));
  documents.forEach((d) => d.expiry && items.push({ kind: "Documento", label: d.label || d.categoryLabel || "Documento", date: d.expiry }));
  endorsements.forEach((e) => e.expiry && items.push({ kind: "Endosso", label: `${e.modelLabel || e.model || "Aeronave"}`, date: e.expiry }));
  if (cma && cma.expiry) items.push({ kind: "CMA", label: "Certificado Médico Aeronáutico", date: cma.expiry });

  return items.sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function nextCriticalExpiry(oat) {
  const items = collectExpiries(oat);
  if (items.length === 0) return null;
  const worst = items.reduce((a, b) => {
    const da = daysUntil(a.date) ?? Infinity;
    const db = daysUntil(b.date) ?? Infinity;
    return db < da ? b : a;
  });
  return { ...worst, ...expiryStatus(worst.date) };
}

export function maskCPF(cpf) {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length < 11) return cpf;
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
}

export function maskRG(rg) {
  if (!rg) return "—";
  if (rg.length <= 4) return rg;
  return `${"•".repeat(rg.length - 4)}${rg.slice(-4)}`;
}

export function fmtDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("pt-BR");
}

export function fmtDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString("pt-BR");
}