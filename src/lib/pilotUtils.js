// Pilot module helpers — expiry computation, JSON parsing, labels
// Atualização controlada do módulo Pilotos — constantes conforme especificação.

// Funções exercidas (Seção 10) — preserva "1º Comando" exatamente
export const FUNCTION_LABELS = {
  manager: "Gestor",
  commander: "1º Comando",
  copilot: "Copiloto",
  trainee: "Piloto aluno",
  instructor: "Instrutor eventual",
  pilot_collaborator: "Piloto colaborador",
  first_officer: "1º Comando",
  pilot_student: "Piloto aluno",
  instructor_eventual: "Instrutor eventual",
};

// Alias para compatibilidade com código existente
export const ROLE_LABELS = FUNCTION_LABELS;

export const FUNCTION_SITUATIONS = [
  { id: "active", label: "Ativa" },
  { id: "suspended", label: "Suspensa" },
  { id: "closed", label: "Encerrada" },
  { id: "evaluation", label: "Em avaliação" },
];

// Habilitações iniciais (Seção 11)
export const HABILITATION_TYPES = [
  { id: "hmnc", label: "HMNC" },
  { id: "hmnt", label: "HMNT" },
  { id: "ifrh", label: "IFR-H" },
  { id: "invh", label: "INVH" },
  { id: "hmlt", label: "HMLT" },
  { id: "exacred", label: "EXACRED" },
  { id: "other", label: "Outra habilitação" },
];

// Compatibilidade com código existente
export const LICENSE_TYPES = HABILITATION_TYPES;

export const HABILITATION_SITUATIONS = [
  { id: "valid", label: "Válida" },
  { id: "near_expiry", label: "Próxima do vencimento" },
  { id: "expired", label: "Vencida" },
  { id: "suspended", label: "Suspensa" },
  { id: "renewing", label: "Em renovação" },
  { id: "pending", label: "Pendente de conferência" },
  { id: "na", label: "Não aplicável" },
];

// Certificados e cursos (Seção 12)
export const CERTIFICATE_TYPES = [
  { id: "crm", label: "CRM" },
  { id: "dangerous_goods", label: "Artigos Perigosos" },
  { id: "op_safety", label: "Segurança Operacional" },
  { id: "aph", label: "APH" },
  { id: "nvg", label: "NVG" },
  { id: "recurring_flight", label: "Treinamento periódico de voo" },
  { id: "recurring_ground", label: "Treinamento periódico de solo" },
  { id: "emergency_training", label: "Treinamento de emergências" },
  { id: "other", label: "Outros cursos" },
];

export const CERTIFICATE_SITUATIONS = [
  { id: "valid", label: "Válido" },
  { id: "near_expiry", label: "Próximo do vencimento" },
  { id: "expired", label: "Vencido" },
  { id: "no_expiry", label: "Sem vencimento" },
  { id: "pending", label: "Pendente de conferência" },
  { id: "rejected", label: "Rejeitado" },
  { id: "archived", label: "Arquivado" },
];

// CMA — classes e situações (Seção 13)
export const CMA_CLASSES = [
  { id: "class1", label: "Classe 1" },
  { id: "class2", label: "Classe 2" },
  { id: "other", label: "Outra" },
];

export const CMA_SITUATIONS = [
  { id: "valid_90plus", label: "Válido por mais de 90 dias" },
  { id: "valid_61_90", label: "Vence entre 61 e 90 dias" },
  { id: "valid_31_60", label: "Vence entre 31 e 60 dias" },
  { id: "valid_16_30", label: "Vence entre 16 e 30 dias" },
  { id: "valid_15", label: "Vence em até 15 dias" },
  { id: "expired", label: "Vencido" },
  { id: "pending", label: "Pendente" },
  { id: "no_info", label: "Sem informação" },
  { id: "suspended", label: "Suspenso" },
];

// Aeronaves e endossos (Seção 14)
export const AIRCRAFT_MODELS = [
  { id: "aw119_mk2", label: "AW119 MkII" },
  { id: "aw119kx", label: "AW119Kx" },
  { id: "aw119kxi", label: "AW119KXi" },
  { id: "other", label: "Outros" },
];

export const ENDORSEMENT_HABILITATION_TYPES = [
  { id: "hmnc", label: "HMNC" },
  { id: "hmnt", label: "HMNT" },
  { id: "hmlt", label: "HMLT" },
  { id: "type", label: "Tipo" },
  { id: "other", label: "Outra" },
];

export const ENDORSEMENT_FUNCTIONS = [
  { id: "pic", label: "Piloto em comando" },
  { id: "copilot", label: "Copiloto" },
  { id: "student", label: "Piloto aluno" },
  { id: "instructor", label: "Instrutor" },
];

export const ENDORSEMENT_SITUATIONS = [
  { id: "valid", label: "Válida" },
  { id: "expired", label: "Vencida" },
  { id: "suspended", label: "Suspensa" },
  { id: "training", label: "Em treinamento" },
  { id: "pending", label: "Pendente de aprovação" },
  { id: "closed", label: "Encerrada" },
];

// Situação cadastral (Seção 5/8)
export const REGISTRATION_STATUS_LABELS = {
  active: "Ativo",
  inactive: "Inativo",
  vacation: "Férias",
  leave: "Afastado",
  training: "Em treinamento",
  pending: "Cadastro pendente",
};

export const REGISTRATION_STATUS_STYLES = {
  active: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  inactive: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  vacation: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  leave: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  training: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  pending: "bg-amber-500/10 text-amber-300 border-amber-500/30",
};

// Documentos (Seção 16)
export const DOC_CATEGORIES = [
  { id: "license", label: "Licença" },
  { id: "cma", label: "CMA" },
  { id: "certificate", label: "Certificado" },
  { id: "passport", label: "Passaporte" },
  { id: "personal", label: "Documento pessoal" },
  { id: "cv", label: "Currículo" },
  { id: "contract", label: "Contrato" },
  { id: "habilitacao", label: "Habilitação" },
  { id: "endorsement", label: "Endosso" },
  { id: "comprovante", label: "Comprovante" },
  { id: "other", label: "Outro anexo" },
];

// Horas — chaves e rótulos (Seção 4/15)
export const HOURS_FIELDS = [
  { key: "total", label: "Horas totais" },
  { key: "rotary", label: "Horas em helicópteros" },
  { key: "aw119_mk2", label: "Horas no AW119 MkII" },
  { key: "aw119kx", label: "Horas no AW119Kx" },
  { key: "aw119kxi", label: "Horas no AW119KXi" },
  { key: "ifr", label: "Horas IFR" },
  { key: "nvg", label: "Horas NVG" },
  { key: "pic", label: "Horas como piloto em comando" },
  { key: "copilot", label: "Horas como copiloto" },
  { key: "instructor", label: "Horas como instrutor" },
];

export const HOURS_SOURCES = [
  { id: "declared", label: "Declarada pelo piloto" },
  { id: "imported", label: "Importada do Diário de Bordo" },
  { id: "administrative", label: "Inserida administrativamente" },
  { id: "validated", label: "Validada pela organização" },
];

// Campos protegidos — somente leitura para usuários comuns (Seção 9)
export const PROTECTED_FIELDS = [
  "full_name", "role", "email_login", "registration", "cpf",
  "organization", "unit", "is_master", "permission", "user_id",
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

// Cálculo de situação do CMA com faixas detalhadas (Seção 13)
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

export const CMA_COLORS = {
  valid_90plus: { dot: "bg-emerald-500", pill: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  valid_61_90: { dot: "bg-sky-500", pill: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
  valid_31_60: { dot: "bg-yellow-500", pill: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30" },
  valid_16_30: { dot: "bg-orange-500", pill: "bg-orange-500/10 text-orange-300 border-orange-500/30" },
  valid_15: { dot: "bg-orange-500", pill: "bg-orange-500/10 text-orange-300 border-orange-500/30" },
  expired: { dot: "bg-rose-500", pill: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
  no_info: { dot: "bg-slate-500", pill: "bg-slate-500/10 text-slate-400 border-slate-500/30" },
  pending: { dot: "bg-slate-500", pill: "bg-slate-500/10 text-slate-400 border-slate-500/30" },
};

export function collectExpiries(pilot) {
  const items = [];
  const licenses = safeParse(pilot.licenses, []);
  const certificates = safeParse(pilot.certificates, []);
  const documents = safeParse(pilot.documents, []);
  const cma = safeParse(pilot.cma, null);
  const endorsements = safeParse(pilot.aircraft_endorsements, []);

  licenses.forEach((l) => l.expiry && items.push({ kind: "Habilitação", label: l.typeLabel || l.type || "Habilitação", date: l.expiry }));
  certificates.forEach((c) => c.expiry && items.push({ kind: "Curso", label: c.typeLabel || c.type || "Curso", date: c.expiry }));
  documents.forEach((d) => d.expiry && items.push({ kind: "Documento", label: d.label || d.categoryLabel || "Documento", date: d.expiry }));
  endorsements.forEach((e) => e.expiry && items.push({ kind: "Endosso", label: `${e.modelLabel || e.model || "Aeronave"}`, date: e.expiry }));
  if (cma && cma.expiry) items.push({ kind: "CMA", label: "Certificado Médico Aeronáutico", date: cma.expiry });

  return items.sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function nextCriticalExpiry(pilot) {
  const items = collectExpiries(pilot);
  if (items.length === 0) return null;
  const worst = items.reduce((a, b) => {
    const da = daysUntil(a.date) ?? Infinity;
    const db = daysUntil(b.date) ?? Infinity;
    return db < da ? b : a;
  });
  return { ...worst, ...expiryStatus(worst.date) };
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

// Mascarar CPF para exibição parcial (Seção 28)
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