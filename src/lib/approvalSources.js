// Configuração de fontes de aprovação usada pela central de Controle de Aprovações.
// Espelha a configuração do backend (base44/functions/manageApprovalCentral/entry.ts).
// Apenas rótulos/ícones — a lógica de status vive no backend.

export const AREAS = [
  { key: "principal", label: "Principal", icon: "LayoutDashboard" },
  { key: "operacoes", label: "Operações", icon: "ClipboardList" },
  { key: "academy", label: "Academy", icon: "GraduationCap" },
  { key: "biblioteca", label: "Biblioteca", icon: "Library" },
  { key: "administracao", label: "Administração", icon: "ShieldCheck" },
];

export const AREA_LABEL = AREAS.reduce((acc, a) => { acc[a.key] = a.label; return acc; }, {});

export const APPROVAL_SOURCES = [
  { key: "aircraft", label: "Aeronaves", icon: "Plane", area: "principal" },
  { key: "pilot", label: "Pilotos", icon: "Users", area: "operacoes" },
  { key: "pilot_license", label: "Licenças", icon: "Award", area: "operacoes" },
  { key: "pilot_habilitacao", label: "Habilitações", icon: "BadgeCheck", area: "operacoes" },
  { key: "qrh_validation", label: "QRH", icon: "Siren", area: "operacoes" },
  { key: "checklist_validation", label: "Checklists", icon: "ClipboardCheck", area: "operacoes" },
  { key: "training_doc", label: "Treinamentos", icon: "GraduationCap", area: "academy" },
  { key: "library_doc", label: "Biblioteca", icon: "Library", area: "biblioteca" },
  { key: "user_invite", label: "Convites", icon: "UserPlus", area: "administracao" },
  { key: "pilot_change", label: "Alterações de Piloto", icon: "UserCog", area: "administracao" },
  { key: "oat_change", label: "OAT", icon: "HeartPulse", area: "administracao" },
];

export const APPROVAL_SOURCE_LABEL = APPROVAL_SOURCES.reduce((acc, s) => { acc[s.key] = s.label; return acc; }, {});
export const SOURCE_BY_KEY = APPROVAL_SOURCES.reduce((acc, s) => { acc[s.key] = s; return acc; }, {});
export const SOURCES_BY_AREA = AREAS.reduce((acc, a) => {
  acc[a.key] = APPROVAL_SOURCES.filter((s) => s.area === a.key);
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

// Status de exibição (classificação do estado atual do registro).
export const DISPLAY_STATUS = {
  pending: { label: "Pendente", tone: "amber", icon: "Inbox" },
  approved: { label: "Aprovado", tone: "emerald", icon: "CheckCircle2" },
  rejected: { label: "Reprovado", tone: "rose", icon: "XCircle" },
  correction: { label: "Em correção", tone: "sky", icon: "AlertTriangle" },
  suspended: { label: "Suspenso", tone: "orange", icon: "PauseCircle" },
  other: { label: "Outro", tone: "slate", icon: "Circle" },
};

// Dados de exemplo para a primeira renderização (antes do backend disponível).
export const SAMPLE_ITEMS = [
  { id: "s1", source_key: "aircraft", source_entity: "Aircraft", area: "principal", title: "PR-ABC", subtitle: "AS350 B2 · Operador Demo · Arcanjo 16", status: "pending", display_status: "pending", created_date: "2026-11-09T12:00:00Z", summary: { Matricula: "PR-ABC", Modelo: "AS350 B2", Operador: "Operador Demo", Callsign: "Arcanjo 16" }, doc_uri: null, doc_name: null },
  { id: "s2", source_key: "library_doc", source_entity: "LibraryDocument", area: "biblioteca", title: "Manual de Voo AW119", subtitle: "Manuais · REV 03", status: "pending_review", display_status: "pending", created_date: "2026-11-10T09:30:00Z", summary: { Titulo: "Manual de Voo AW119", Categoria: "Manuais", Revisao: "03" }, doc_uri: "sample://manual.pdf", doc_name: "manual_aw119_rev03.pdf" },
  { id: "s3", source_key: "pilot_license", source_entity: "PilotLicense", area: "operacoes", title: "PPA — João Silva", subtitle: "João Silva · CMT 12345", status: "pending_review", display_status: "pending", created_date: "2026-11-10T14:10:00Z", summary: { Piloto: "João Silva", Tipo: "PPA", Numero: "CMT 12345" }, doc_uri: "sample://licenca.pdf", doc_name: "licenca_joao.pdf" },
  { id: "s4", source_key: "checklist_validation", source_entity: "ChecklistValidation", area: "operacoes", title: "Pré-Voo · H125 B3e", subtitle: "B3e", status: "pending", display_status: "pending", created_date: "2026-11-11T08:00:00Z", summary: { Fase: "Pré-Voo", Variante: "B3e" }, doc_uri: null, doc_name: null },
  { id: "s5", source_key: "training_doc", source_entity: "TrainingDocument", area: "academy", title: "Briefing de Emergência — Vídeo", subtitle: "Capítulo 4", status: "rejected", display_status: "suspended", created_date: "2026-11-05T10:00:00Z", summary: { Titulo: "Briefing de Emergência", Capitulo: "4" }, doc_uri: "sample://brief.mp4", doc_name: "briefing.mp4" },
  { id: "s6", source_key: "user_invite", source_entity: "UserInvite", area: "administracao", title: "novo.piloto@rsandoli.com", subtitle: "Novo Piloto · Piloto", status: "pending", display_status: "pending", created_date: "2026-11-11T07:00:00Z", summary: { Email: "novo.piloto@rsandoli.com", Nome: "Novo Piloto", Acesso: "Piloto" }, doc_uri: null, doc_name: null },
];

export const SAMPLE_HISTORY = [
  { id: "h1", source_entity: "pilot", record_title: "Maria Souza", module_label: "Pilotos", decision: "approved", justification: "Documentação completa.", reviewed_by_name: "Admin Geral", reviewed_at: "2026-11-08T16:00:00Z" },
  { id: "h2", source_entity: "library_doc", record_title: "Manual AW119 REV02", module_label: "Biblioteca", decision: "rejected", justification: "Revisão desatualizada.", reviewed_by_name: "Admin Geral", reviewed_at: "2026-11-06T11:20:00Z" },
  { id: "h3", source_entity: "training_doc", record_title: "Briefing de Emergência — Vídeo", module_label: "Treinamentos", decision: "suspended", justification: "Conteúdo em revisão de segurança.", reviewed_by_name: "Admin Geral", reviewed_at: "2026-11-05T10:30:00Z" },
  { id: "h4", source_entity: "pilot_license", record_title: "PPA — Carlos Lima", module_label: "Licenças", decision: "correction_requested", justification: "Data de validade ilegível.", reviewed_by_name: "Admin Geral", reviewed_at: "2026-11-04T09:00:00Z" },
];