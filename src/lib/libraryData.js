// Categorias da Biblioteca Técnica — REVISÃO 02
// Estrutura em três grupos aplicável a ambos os módulos (AW119 e H125):
//   1. Manuais
//   2. Materiais de Estudo
//   3. Legislação e Normas Aplicáveis

export const LIBRARY_GROUPS = [
  {
    id: "manuais",
    name: "Manuais",
    icon: "BookOpen",
    color: "from-sky-500 to-blue-600",
    description: "Manuais oficiais da aeronave e sistemas.",
    categories: [
      { id: "flight_manual", name: "Flight Manual", icon: "BookOpen" },
      { id: "rfm", name: "RFM", icon: "FileText" },
      { id: "rfms", name: "RFMS", icon: "FileText" },
      { id: "fcom", name: "FCOM", icon: "FileText" },
    ],
  },
  {
    id: "materiais_estudo",
    name: "Materiais de Estudo",
    icon: "GraduationCap",
    color: "from-amber-500 to-orange-600",
    description: "Material didático, procedimentos e publicações operacionais.",
    categories: [
      { id: "trgc", name: "TRGC", icon: "ClipboardList" },
      { id: "genesys", name: "Genesys", icon: "Monitor" },
      { id: "garmin", name: "Garmin", icon: "Monitor" },
      { id: "sop", name: "SOP", icon: "ListChecks" },
      { id: "boletins_operacionais", name: "Boletins Operacionais", icon: "Megaphone" },
      { id: "cartas_procedimentos", name: "Cartas e Procedimentos Aeronáuticos", icon: "Map" },
      { id: "diversos", name: "Diversos", icon: "FolderOpen" },
    ],
  },
  {
    id: "legislacao_normas",
    name: "Legislação e Normas Aplicáveis",
    icon: "Scale",
    color: "from-emerald-500 to-teal-600",
    description: "Publicações regulatórias e normas aplicáveis.",
    categories: [
      { id: "anac", name: "Publicações ANAC", icon: "Landmark" },
      { id: "icao", name: "Publicações ICAO", icon: "Globe" },
      { id: "faa", name: "Publicações FAA", icon: "Globe" },
    ],
  },
];

// Lista plana derivada (compatibilidade com consumidores existentes).
export const LIBRARY_CATEGORIES = LIBRARY_GROUPS.flatMap((g) => g.categories);

export const CATEGORY_LABELS = Object.fromEntries(LIBRARY_CATEGORIES.map((c) => [c.id, c.name]));

// Mapa categoria -> grupo (para exibição e filtragem por grupo).
export const CATEGORY_GROUP = Object.fromEntries(
  LIBRARY_GROUPS.flatMap((g) => g.categories.map((c) => [c.id, g.id]))
);

export const GROUP_LABELS = Object.fromEntries(LIBRARY_GROUPS.map((g) => [g.id, g.name]));

// Categorias cujo conteúdo é compartilhado entre todas as aeronaves.
// Hoje, todo o grupo "Legislação e Normas Aplicáveis" é compartilhado.
export const SHARED_GROUP_ID = "legislacao_normas";
export const SHARED_CATEGORY_IDS = LIBRARY_GROUPS.find((g) => g.id === SHARED_GROUP_ID)?.categories.map((c) => c.id) || [];
export const isSharedCategory = (catId) => SHARED_CATEGORY_IDS.includes(catId);

// Status dos documentos
export const DOC_STATUS = [
  { id: "active", label: "Vigente" },
  { id: "superseded", label: "Substituído" },
  { id: "archived", label: "Arquivado" },
  { id: "review", label: "Em revisão" },
];

export const DOC_STATUS_LABELS = Object.fromEntries(DOC_STATUS.map((s) => [s.id, s.label]));