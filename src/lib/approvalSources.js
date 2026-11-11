// Configuração de fontes de aprovação usada pela central de Controle de Aprovações.
// Espelha a configuração do backend (base44/functions/manageApprovalCentral/entry.ts).
// Apenas rótulos/ícones — a lógica de status vive no backend.

export const APPROVAL_SOURCES = [
  { key: "aircraft", label: "Aeronaves", icon: "Plane" },
  { key: "pilot", label: "Pilotos", icon: "Users" },
  { key: "pilot_license", label: "Licenças", icon: "Award" },
  { key: "pilot_habilitacao", label: "Habilitações", icon: "BadgeCheck" },
  { key: "library_doc", label: "Biblioteca", icon: "Library" },
  { key: "training_doc", label: "Treinamentos", icon: "GraduationCap" },
  { key: "user_invite", label: "Convites", icon: "UserPlus" },
  { key: "oat_change", label: "OAT", icon: "HeartPulse" },
  { key: "pilot_change", label: "Alterações de Piloto", icon: "UserCog" },
  { key: "qrh_validation", label: "QRH", icon: "Siren" },
  { key: "checklist_validation", label: "Checklists", icon: "ClipboardCheck" },
];

export const APPROVAL_SOURCE_LABEL = APPROVAL_SOURCES.reduce((acc, s) => {
  acc[s.key] = s.label;
  return acc;
}, {});

export const DECISION_LABELS = {
  approved: { label: "Aprovado", tone: "emerald" },
  rejected: { label: "Reprovado", tone: "rose" },
  correction_requested: { label: "Correção solicitada", tone: "amber" },
  suspended: { label: "Suspenso", tone: "orange" },
  unsuspended: { label: "Reativado", tone: "sky" },
};

export const DECISION_OPTIONS = [
  { value: "approved", label: "Aprovar", tone: "emerald" },
  { value: "rejected", label: "Reprovar", tone: "rose" },
  { value: "correction_requested", label: "Solicitar correção", tone: "amber" },
  { value: "suspended", label: "Suspender uso", tone: "orange" },
  { value: "unsuspended", label: "Reativar (remover suspensão)", tone: "sky" },
];

// Dados de exemplo para a primeira renderização (antes do backend disponível).
export const SAMPLE_PENDING = [
  {
    id: "s1", source_key: "aircraft", title: "PR-ABC", subtitle: "AS350 B2 · Operador Demo · Arcanjo 16",
    status: "pending", created_date: "2026-11-09T12:00:00Z",
    summary: { Matrícula: "PR-ABC", Modelo: "AS350 B2", Operador: "Operador Demo", Callsign: "Arcanjo 16" },
    doc_uri: null, doc_name: null,
  },
  {
    id: "s2", source_key: "library_doc", title: "Manual de Voo AW119", subtitle: "Manuais · REV 03",
    status: "pending", created_date: "2026-11-10T09:30:00Z",
    summary: { Título: "Manual de Voo AW119", Categoria: "Manuais", Revisão: "03", Enviado: "adm@rsandoli" },
    doc_uri: "sample://manual.pdf", doc_name: "manual_aw119_rev03.pdf",
  },
  {
    id: "s3", source_key: "pilot_license", title: "PPA — João Silva", subtitle: "Licença ANAC · CMT 12345",
    status: "pending", created_date: "2026-11-10T14:10:00Z",
    summary: { Piloto: "João Silva", Tipo: "PPA", Número: "CMT 12345", Validade: "2027-01-15" },
    doc_uri: "sample://licenca.pdf", doc_name: "licenca_joao.pdf",
  },
  {
    id: "s4", source_key: "checklist_validation", title: "Pré-Voo · H125 B3e", subtitle: "Variante B3e",
    status: "pending", created_date: "2026-11-11T08:00:00Z",
    summary: { Fase: "Pré-Voo", Variante: "B3e", Grupo: "H125" },
    doc_uri: null, doc_name: null,
  },
];

export const SAMPLE_SUSPENDED = [
  {
    id: "s5", source_key: "training_doc", title: "Briefing de Emergência — Vídeo", subtitle: "Capítulo 4",
    status: "suspended", created_date: "2026-11-05T10:00:00Z",
    summary: { Título: "Briefing de Emergência — Vídeo", Capítulo: "4", Enviado: "instrutor@rsandoli" },
    doc_uri: "sample://brief.mp4", doc_name: "briefing.mp4",
  },
];

export const SAMPLE_HISTORY = [
  { id: "h1", source_entity: "pilot", record_title: "Maria Souza", module_label: "Pilotos", decision: "approved", justification: "Documentação completa.", reviewed_by_name: "Admin Geral", reviewed_at: "2026-11-08T16:00:00Z" },
  { id: "h2", source_entity: "library_doc", record_title: "Manual AW119 REV02", module_label: "Biblioteca", decision: "rejected", justification: "Revisão desatualizada.", reviewed_by_name: "Admin Geral", reviewed_at: "2026-11-06T11:20:00Z" },
  { id: "h3", source_entity: "training_doc", record_title: "Briefing de Emergência — Vídeo", module_label: "Treinamentos", decision: "suspended", justification: "Conteúdo em revisão de segurança.", reviewed_by_name: "Admin Geral", reviewed_at: "2026-11-05T10:30:00Z" },
  { id: "h4", source_entity: "pilot_license", record_title: "PPA — Carlos Lima", module_label: "Licenças", decision: "correction_requested", justification: "Data de validade ilegível.", reviewed_by_name: "Admin Geral", reviewed_at: "2026-11-04T09:00:00Z" },
];