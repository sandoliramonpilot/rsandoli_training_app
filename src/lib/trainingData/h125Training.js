// H125 TRAINING — Estrutura completa de módulos, tópicos e capítulos
// Conteúdo técnico sem fonte aprovada é marcado como PENDENTE.
// Não inventar procedimentos, limitações, valores operacionais, memory items,
// ações imediatas, mensagens CAS, lógicas do AFCS, características técnicas,
// critérios de interrupção de manobras ou sequências de checklist.

export const H125_TRAINING = {
  id: "h125_training",
  name: "H125 TRAINING",
  subtitle:
    "Formação teórica, treinamento recorrente e preparação técnica para pilotos do Airbus H125.",
  premium: true,
  modules: [
    {
      id: "genesys_efis_idu_680",
      title: "GENESYS EFIS IDU-680",
      icon: "Monitor",
      objective:
        "Fornecer treinamento progressivo sobre o Genesys EFIS IDU-680 instalado na configuração aplicável do H125.",
      levels: ["Básico", "Intermediário", "Avançado", "Instrutor"],
      chapters: [
        {
          id: "ge_ch1",
          title: "Capítulo 1 — Generalidades",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
        },
        {
          id: "ge_ch2",
          title: "Capítulo 2 — Arquitetura",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
        },
        {
          id: "ge_ch3",
          title: "Capítulo 3 — Integração",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
        },
        {
          id: "ge_ch4",
          title: "Capítulo 4 — Processamento",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
        },
        {
          id: "ge_ch5",
          title: "Capítulo 5 — Simbologia e Exibição",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
        },
        {
          id: "ge_ch6",
          title: "Capítulo 6 — Sistemas",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
        },
        {
          id: "ge_ch7",
          title: "Capítulo 7 — Falhas e Modos Reversíveis",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
        },
        {
          id: "ge_ch8",
          title: "Capítulo 8 — HeliPilot/AFCS",
          isHelipilotArea: true,
          objective:
            "Área exclusiva dentro do Genesys EFIS IDU-680 para o sistema HeliPilot/AFCS.",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
          modes: ["SAS", "HDG", "NAV", "IAS", "VS", "ALT", "GO AROUND"],
          modeFields: [
            "Finalidade",
            "Pré-requisitos",
            "Forma de seleção",
            "Indicação de modo armado",
            "Indicação de modo ativo",
            "Parâmetro controlado",
            "Comportamento esperado",
            "Transições",
            "Interações com outros modos",
            "Como monitorar",
            "Condições de cancelamento",
            "Limitações",
            "Condições degradadas",
            "Erros comuns",
            "Exemplo didático",
            "Referência documental",
          ],
        },
        {
          id: "ge_ch9",
          title: "Capítulo 9 — PFD",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
        },
        {
          id: "ge_ch10",
          title: "Capítulo 10 — MFD",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
        },
        {
          id: "ge_ch11",
          title: "Capítulo 11 — Navegação",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
        },
        {
          id: "ge_ch12",
          title: "Capítulo 12 — Funções do Menu e Configurações",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
        },
      ],
    },
    {
      id: "conhecimento_geral",
      title: "TÓPICO 1 — CONHECIMENTO GERAL DA AERONAVE",
      icon: "Plane",
      objective:
        "Apresentar o Airbus H125, suas características gerais, configurações e aplicações.",
      items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
    },
    {
      id: "particularidades_h125",
      title: "PARTICULARIDADES DO H125",
      icon: "Settings",
      objective:
        "Reunir conteúdos específicos da configuração H125 sem duplicar conteúdos gerais.",
      allowAdminChapters: true,
      chapters: [
        {
          id: "px_ch1",
          title: "Capítulo 1 — Acionamento",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
        },
        {
          id: "px_ch2",
          title: "Capítulo 2 — Check de Sistemas",
          items: ["CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA"],
        },
      ],
    },
  ],
};
