// Perfis de acesso (níveis) e módulos do aplicativo — base para controle de acesso
export const ACCESS_LEVELS = [
  { id: "admin_geral", name: "Administrador Geral", rank: 5 },
  { id: "administrador", name: "Administrador", rank: 4 },
  { id: "gestor_supervisor", name: "Gestor / Supervisor", rank: 3 },
  { id: "operacional", name: "Usuário Operacional", rank: 2 },
  { id: "consulta", name: "Usuário de Consulta", rank: 1 },
];

export const ACCOUNT_STATUSES = [
  { id: "convite_pendente", name: "Convite pendente" },
  { id: "ativa", name: "Ativa" },
  { id: "bloqueada", name: "Bloqueada" },
  { id: "suspensa", name: "Suspensa" },
  { id: "desativada", name: "Desativada" },
];

// Módulos para controle de permissão (quando existentes no app)
export const PERMISSION_MODULES = [
  { id: "dashboard", name: "Dashboard", path: "/" },
  { id: "diario_bordo", name: "Diário de Bordo", path: "/flight-log" },
  { id: "aeronaves", name: "Aeronaves", path: "/aircraft" },
  { id: "checklists", name: "Checklists", path: "/checklist" },
  { id: "qrh", name: "QRH", path: "/qrh" },
  { id: "qrh_efis", name: "QRH-EFIS", path: "/qrh-efis" },
  { id: "biblioteca", name: "Biblioteca", path: "/biblioteca" },
  { id: "pilotos", name: "Pilotos", path: "/pilotos" },
  { id: "treinamentos", name: "Treinamentos", path: "/treinamentos" },
  { id: "aw119_training", name: "AW119 Training", path: "/aw119-training" },
  { id: "treinamentos_gerais", name: "Treinamentos Gerais", path: "/treinamentos-gerais" },
  { id: "limitacoes", name: "Limitações", path: "/limitacoes" },
  { id: "procedimentos_normais", name: "Procedimentos Normais", path: "/procedimentos-normais" },
  { id: "procedimentos_emergencia", name: "Procedimentos de Emergência", path: "/procedimentos-emergencia" },
  { id: "simulados", name: "Simulados", path: "/simulados" },
  { id: "questoes", name: "Questões de prova", path: "/questoes" },
  { id: "recursos_visuais", name: "Recursos Visuais", path: "/recursos-visuais" },
  { id: "briefing_emergencia", name: "Briefing de Emergência", path: "/briefing-emergencia" },
  { id: "treinamento_recorrente", name: "Treinamento Recorrente", path: "/treinamento-recorrente" },
  { id: "gestao", name: "Gestão", path: "/gestao" },
  { id: "escalas", name: "Escalas", path: "/escalas" },
  { id: "usuarios", name: "Usuários e Acessos", path: "/usuarios" },
  { id: "auditoria", name: "Auditoria", path: "/usuarios/auditoria" },
];

export const PERMISSION_ACTIONS = [
  { id: "visualizar", name: "Visualizar" },
  { id: "criar", name: "Criar" },
  { id: "editar", name: "Editar" },
  { id: "excluir", name: "Excluir" },
  { id: "aprovar", name: "Aprovar" },
  { id: "finalizar", name: "Finalizar" },
  { id: "exportar", name: "Exportar" },
  { id: "download", name: "Download" },
  { id: "administrar", name: "Administrar" },
  { id: "proprios", name: "Registros próprios" },
  { id: "unidade", name: "Registros da unidade" },
  { id: "todos", name: "Todos os registros" },
];

// Permissões padrão por nível (módulo -> ações permitidas). Admin Geral = todos.
export const DEFAULT_PERMISSIONS_BY_LEVEL = {
  admin_geral: "*", // acesso total
  administrador: {
    dashboard: ["visualizar"],
    diario_bordo: ["visualizar", "criar", "editar", "exportar", "todos"],
    aeronaves: ["visualizar", "criar", "editar", "todos"],
    checklists: ["visualizar", "criar", "editar", "finalizar", "todos"],
    qrh: ["visualizar"],
    qrh_efis: ["visualizar"],
    biblioteca: ["visualizar", "criar", "editar", "download", "todos"],
    pilotos: ["visualizar", "criar", "editar", "todos"],
    treinamentos: ["visualizar", "editar"],
    aw119_training: ["visualizar", "editar"],
    treinamentos_gerais: ["visualizar", "editar"],
    limitacoes: ["visualizar"],
    procedimentos_normais: ["visualizar"],
    procedimentos_emergencia: ["visualizar"],
    simulados: ["visualizar", "criar", "todos"],
    questoes: ["visualizar", "criar", "editar"],
    recursos_visuais: ["visualizar"],
    briefing_emergencia: ["visualizar"],
    treinamento_recorrente: ["visualizar"],
    gestao: ["visualizar"],
    escalas: ["visualizar", "criar", "editar", "excluir", "todos"],
    usuarios: ["visualizar", "criar", "editar"],
    auditoria: ["visualizar"],
  },
  gestor_supervisor: {
    dashboard: ["visualizar"],
    diario_bordo: ["visualizar", "criar", "editar", "unidade"],
    aeronaves: ["visualizar", "criar", "editar"],
    checklists: ["visualizar", "aprovar", "unidade"],
    qrh: ["visualizar"],
    qrh_efis: ["visualizar"],
    biblioteca: ["visualizar", "download"],
    pilotos: ["visualizar", "criar", "editar", "unidade"],
    treinamentos: ["visualizar", "editar"],
    aw119_training: ["visualizar"],
    treinamentos_gerais: ["visualizar"],
    limitacoes: ["visualizar"],
    procedimentos_normais: ["visualizar"],
    procedimentos_emergencia: ["visualizar"],
    simulados: ["visualizar"],
    questoes: ["visualizar"],
    recursos_visuais: ["visualizar"],
    briefing_emergencia: ["visualizar"],
    treinamento_recorrente: ["visualizar"],
    gestao: ["visualizar"],
    escalas: ["visualizar", "criar", "editar"],
    usuarios: [],
    auditoria: [],
  },
  operacional: {
    dashboard: ["visualizar"],
    diario_bordo: ["visualizar", "criar", "proprios"],
    aeronaves: ["visualizar"],
    checklists: ["visualizar", "criar", "editar", "finalizar", "proprios"],
    qrh: ["visualizar"],
    qrh_efis: ["visualizar"],
    biblioteca: ["visualizar", "download"],
    pilotos: ["visualizar"],
    treinamentos: ["visualizar"],
    aw119_training: ["visualizar"],
    treinamentos_gerais: ["visualizar"],
    limitacoes: ["visualizar"],
    procedimentos_normais: ["visualizar"],
    procedimentos_emergencia: ["visualizar"],
    simulados: ["visualizar", "criar"],
    questoes: ["visualizar"],
    recursos_visuais: ["visualizar"],
    briefing_emergencia: ["visualizar"],
    treinamento_recorrente: ["visualizar"],
    gestao: [],
    escalas: ["visualizar"],
    usuarios: [],
    auditoria: [],
  },
  consulta: {
    dashboard: ["visualizar"],
    diario_bordo: ["visualizar"],
    aeronaves: ["visualizar"],
    checklists: ["visualizar"],
    qrh: ["visualizar"],
    qrh_efis: ["visualizar"],
    biblioteca: ["visualizar"],
    pilotos: ["visualizar"],
    treinamentos: ["visualizar"],
    aw119_training: ["visualizar"],
    treinamentos_gerais: ["visualizar"],
    limitacoes: ["visualizar"],
    procedimentos_normais: ["visualizar"],
    procedimentos_emergencia: ["visualizar"],
    simulados: ["visualizar"],
    questoes: ["visualizar"],
    recursos_visuais: ["visualizar"],
    briefing_emergencia: ["visualizar"],
    treinamento_recorrente: ["visualizar"],
    gestao: [],
    escalas: ["visualizar"],
    usuarios: [],
    auditoria: [],
  },
};

export const ACCESS_LEVEL_LABELS = ACCESS_LEVELS.reduce((acc, l) => { acc[l.id] = l.name; return acc; }, {});
export const ACCOUNT_STATUS_LABELS = ACCOUNT_STATUSES.reduce((acc, s) => { acc[s.id] = s.name; return acc; }, {});

/** Nível de acesso do usuário (lido do campo customizado access_level ou derivado de role). */
export function getAccessLevel(user) {
  if (!user) return null;
  const al = user.access_level;
  if (al && ACCESS_LEVELS.some((l) => l.id === al)) return al;
  return user.role === "admin" ? "administrador" : "operacional";
}

/** Status da conta (padrão: ativa). */
export function getAccountStatus(user) {
  return user?.account_status || "ativa";
}

/** Verifica se o usuário tem permissão de fazer a ação no módulo. */
export function can(user, moduleId, action) {
  const level = getAccessLevel(user);
  if (!level) return false;
  if (level === "admin_geral") return true;
  const custom = user?.custom_permissions;
  let perms = null;
  if (custom && typeof custom === "string") {
    try {
      const parsed = JSON.parse(custom);
      perms = parsed[moduleId] ?? DEFAULT_PERMISSIONS_BY_LEVEL[level]?.[moduleId];
    } catch {
      perms = DEFAULT_PERMISSIONS_BY_LEVEL[level]?.[moduleId];
    }
  } else {
    perms = DEFAULT_PERMISSIONS_BY_LEVEL[level]?.[moduleId];
  }
  if (!perms || !Array.isArray(perms)) return false;
  if (action === "visualizar" && perms.includes("visualizar")) return true;
  return perms.includes(action);
}

/** Se o usuário pode gerenciar outros usuários (admin_geral ou administrador). */
export function canManageUsers(user) {
  const level = getAccessLevel(user);
  return level === "admin_geral" || level === "administrador";
}

/** Se o usuário pode acessar a auditoria. */
export function canViewAudit(user) {
  return getAccessLevel(user) === "admin_geral";
}

/** Se a conta permite login (ativa ou convite_pendente). */
export function canLogin(user) {
  const s = getAccountStatus(user);
  return s === "ativa" || s === "convite_pendente";
}

/** Primeiro caminho de módulo autorizado para o usuário (para redirecionar após login). */
export function firstAuthorizedPath(user) {
  for (const mod of PERMISSION_MODULES) {
    if (can(user, mod.id, "visualizar")) return mod.path;
  }
  return "/";
}