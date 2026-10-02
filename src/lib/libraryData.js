// Categorias da Biblioteca Técnica — REVISÃO 01
export const LIBRARY_CATEGORIES = [
  { id: "flight_manual", name: "Flight Manual", icon: "BookOpen", color: "from-sky-500 to-blue-600" },
  { id: "rfm", name: "RFM", icon: "FileText", color: "from-emerald-500 to-teal-600" },
  { id: "rfms", name: "RFMS", icon: "FileText", color: "from-teal-500 to-cyan-600" },
  { id: "trgc", name: "TRGC", icon: "ClipboardList", color: "from-amber-500 to-orange-600" },
  { id: "genesys", name: "Genesys", icon: "Monitor", color: "from-blue-500 to-indigo-600" },
  { id: "garmin", name: "Garmin", icon: "Monitor", color: "from-indigo-500 to-violet-600" },
  { id: "fcom", name: "FCOM", icon: "FileText", color: "from-rose-500 to-red-600" },
  { id: "sop", name: "SOP", icon: "ListChecks", color: "from-violet-500 to-purple-600" },
  { id: "boletins_operacionais", name: "Boletins Operacionais", icon: "Megaphone", color: "from-amber-500 to-yellow-600" },
  { id: "cartas_procedimentos", name: "Cartas e Procedimentos Aeronáuticos", icon: "Map", color: "from-cyan-500 to-sky-600" },
  { id: "diversos", name: "Diversos", icon: "FolderOpen", color: "from-slate-500 to-slate-600" },
];

export const CATEGORY_LABELS = Object.fromEntries(LIBRARY_CATEGORIES.map((c) => [c.id, c.name]));

// Status dos documentos
export const DOC_STATUS = [
  { id: "active", label: "Vigente" },
  { id: "superseded", label: "Substituído" },
  { id: "archived", label: "Arquivado" },
  { id: "review", label: "Em revisão" },
];

export const DOC_STATUS_LABELS = Object.fromEntries(DOC_STATUS.map((s) => [s.id, s.label]));