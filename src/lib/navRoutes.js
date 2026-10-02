// Rotas de navegação por módulo (para montar o menu conforme permissões)
export const NAV_MODULE_ROUTES = [
  { label: "Painel", path: "/", moduleId: "dashboard" },
  { label: "Diário de Bordo", path: "/flight-log", moduleId: "diario_bordo" },
  { label: "Aeronaves", path: "/aircraft", moduleId: "aeronaves" },
  { label: "Checklists", path: "/checklist", moduleId: "checklists" },
  { label: "QRH", path: "/qrh", moduleId: "qrh" },
  { label: "Pilotos", path: "/pilotos", moduleId: "pilotos" },
  { label: "Treinamento", path: "/treinamentos", moduleId: "treinamentos" },
  { label: "Questões", path: "/questoes", moduleId: "questoes" },
  { label: "Simulados", path: "/simulados", moduleId: "simulados" },
  { label: "Biblioteca", path: "/biblioteca", moduleId: "biblioteca" },
];