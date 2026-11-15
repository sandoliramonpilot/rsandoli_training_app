// Categorias da Biblioteca — REVISÃO 03
// Estrutura em três grupos aplicável a ambos os módulos (AW119 e H125):
//   1. Documentação Técnica
//   2. Materiais Didáticos
//   3. Legislação

export const LIBRARY_GROUPS = [
  {
    id: "manuais",
    name: "Documentação Técnica",
    icon: "BookOpen",
    color: "from-sky-500 to-blue-600",
    description: "Manuais e publicações técnicas.",
    categories: [
      { id: "flight_manual", name: "Flight Manual", icon: "BookOpen" },
      { id: "rfm", name: "RFM", icon: "FileText" },
      { id: "rfms", name: "RFMS", icon: "FileText" },
      { id: "fcom", name: "FCOM", icon: "FileText" },
      { id: "trgc", name: "TRGC", icon: "ClipboardList" },
      { id: "genesys", name: "Genesys EFIS IDU-680", icon: "Monitor" },
      { id: "garmin", name: "Garmin G1000", icon: "Monitor" },
      { id: "boletins_operacionais", name: "Boletins Operacionais", icon: "Megaphone" },
      { id: "informacoes_fabricante", name: "Informações do fabricante", icon: "Building2" },
      { id: "diversos", name: "Diversos", icon: "FolderOpen" },
    ],
  },
  {
    id: "materiais_estudo",
    name: "Materiais Didáticos",
    icon: "GraduationCap",
    color: "from-amber-500 to-orange-600",
    description: "Material teórico para consulta.",
    categories: [
      { id: "relatorios_cenipa", name: "Relatórios Finais de Investigação de Acidente Aéreo/CENIPA", icon: "FileWarning" },
      { id: "apostilas", name: "Apostilas", icon: "BookMarked" },
      { id: "livros", name: "Livros", icon: "Library" },
      { id: "artigos_cientificos", name: "Artigos científicos", icon: "FileSearch" },
      { id: "resumos", name: "Resumos", icon: "FileText" },
      { id: "ebooks", name: "E-Books", icon: "Tablet" },
      { id: "checklists_estudo", name: "Checklists de Estudo", icon: "ListChecks" },
      { id: "estudos_caso", name: "Estudos de casos", icon: "Lightbulb" },
    ],
  },
  {
    id: "legislacao_normas",
    name: "Legislação",
    icon: "Scale",
    color: "from-emerald-500 to-teal-600",
    description: "Legislação, regulamentos e normas legais.",
    categories: [
      { id: "anac", name: "Publicações ANAC", icon: "Landmark" },
      { id: "icao", name: "Publicações ICAO", icon: "Globe" },
      { id: "faa", name: "Publicações FAA", icon: "Globe" },
      { id: "sop", name: "SOP", icon: "ListChecks" },
      { id: "cartas_procedimentos", name: "Cartas e Procedimentos Aeronáuticos", icon: "Map" },
      { id: "normas_federais", name: "Normas e Regulamentos Federais", icon: "Landmark" },
      { id: "normas_estaduais", name: "Normas e Regulamentos Estaduais", icon: "Building2" },
      { id: "normas_decea", name: "Normas e Regulamentos DECEA", icon: "Radio" },
      { id: "outras_normas", name: "Outras Normas e Regulamentos", icon: "FileText" },
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
// Todo o grupo "Legislação" é compartilhado.
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
