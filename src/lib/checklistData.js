// Checklist operacionais do RSANDOLI PILOT — 5 fases de voo
export const CHECKLIST_PHASES = [
  {
    id: "pre_flight",
    name: "Pré-Voo",
    short: "Pré-Voo",
    sections: [
      {
        category: "Inspeção Externa",
        items: [
          "Pás do rotor principal — sem trincas, abrasão ou dano",
          "Cubo do rotor principal — parafusos e contraporcas seguros",
          "Rotor de cauda — pás e cubo íntegros",
          "Fuselagem — sem amassados, trincas ou corrosão",
          "Tren de pouso / patins — íntegro e seguro",
          "Antenas e pitot — livres e desobstruídos",
          "Capôs e carenagens — fechados e travados",
          "Dreno de combustível — amostra verificada (sem água/contaminantes)",
        ],
      },
      {
        category: "Inspeção Interna",
        items: [
          "Cintos e assentos — funcionais e seguros",
          "Controles de voo — movimento livre e completo",
          "Pedais — curso completo e suave",
          "Coletivo e cíclico — sem folga excessiva",
          "Extintor de incêndio a bordo e carregado",
          "Kit de primeiros socorros a bordo",
          "Cargas e bagagem fixadas e dentro do CG",
        ],
      },
      {
        category: "Verificações de Segurança",
        items: [
          "Certificado de matrícula e airworthiness a bordo",
          "Licença de piloto e certificado médico válidos",
          "Diário de bordo atualizado",
          "Plano de voo arquivado (se aplicável)",
          "Briefing de passageiros realizado",
        ],
      },
      {
        category: "Combustível",
        items: [
          "Quantidade de combustível suficiente para missão + reserva",
          "Tampa do tanque fechada e travada",
          "Válvulas de combustível na posição correta",
          "Indicadores de combustível funcionais",
        ],
      },
      {
        category: "Óleo",
        items: [
          "Nível de óleo do motor dentro do limite",
          "Nível de óleo da transmissão / redutor dentro do limite",
          "Nível de óleo do rotor de cauda dentro do limite",
          "Inspeção visual de vazamentos de fluido",
        ],
      },
      {
        category: "Hidráulico",
        items: [
          "Nível de fluido hidráulico dentro do limite",
          "Válvulas de corte hidráulico na posição normal",
          "Inspeção visual de vazamentos no sistema hidráulico",
        ],
      },
      {
        category: "Aviônicos",
        items: [
          "Instrumentos do painel — legíveis e funcionais",
          "Rádio / transponder / GPS — ligados e testados",
          "Altímetro ajustado ao QNH local",
          "Bateria — carga e conexões seguras",
        ],
      },
    ],
  },
  {
    id: "startup",
    name: "Acionamento",
    short: "Acionamento",
    sections: [
      {
        category: "Battery ON",
        items: [
          "Battery switch — ON",
          "Verificar tensão da bateria dentro do limite",
          "Caixa de avisos (CAS) — sem mensagens de falha",
        ],
      },
      {
        category: "Avionics",
        items: [
          "Avionics switch — ON",
          "PFD / MFD — inicialização normal",
          "GPS — aquisição de satélites",
          "Rádio — frequência ativa ajustada",
        ],
      },
      {
        category: "Fuel Pump",
        items: [
          "Fuel Pump — ON (se aplicável)",
          "Pressão de combustível dentro do limite",
          "Válvula de corte de combustível — aberta",
        ],
      },
      {
        category: "Engine Start",
        items: [
          "Throttle — posição de partida",
          "Área ao redor livre de pessoas e obstáculos",
          "Engine Start — N1 em ascensão",
          "ITT dentro do limite de partida",
          "Estabilização de marcha lenta (idle) normal",
        ],
      },
      {
        category: "Generator Check",
        items: [
          "Generator — ON",
          "Tensão do gerador dentro do limite",
          "Carga do gerador estável",
          "Bateria — carga normal",
        ],
      },
      {
        category: "Instrument Check",
        items: [
          "Instrumentos do motor — dentro dos limites (N1, ITT, Torque, Np)",
          "Pressão de óleo do motor — normal",
          "Temperatura de óleo do motor — normal",
          "Pressão hidráulica — normal",
          "Sistemas de alerta — testados (CAS)",
        ],
      },
    ],
  },
  {
    id: "post_startup",
    name: "Pós-Acionamento",
    short: "Pós-Ac.",
    sections: [
      {
        category: "Verificações de Sistemas",
        items: [
          "Sistema hidráulico — pressão e operação normais",
          "Sistema elétrico — gerador e bateria estáveis",
          "Sistema de combustível — fluxo e pressão normais",
          "AFCS — engage e disengage testados",
        ],
      },
      {
        category: "Testes de Instrumentos",
        items: [
          "PFD — atitude, velocidade e altitude indicados corretamente",
          "HSI — orientação correta",
          "VSI — indicação de subida/descida coerente",
          "Rádio — comunicação e navegação testadas",
          "Transponder — código ajustado e modo ativo",
        ],
      },
      {
        category: "Teste de Alertas",
        items: [
          "Teste de avisos sonoros e visuais — OK",
          "CAS Messages — sem mensagens ativas",
          "Sistema de fogo — teste OK",
          "Sistema de alerta de baixo NR — teste OK",
        ],
      },
    ],
  },
  {
    id: "before_takeoff",
    name: "Before Takeoff",
    short: "Bef. Takeoff",
    sections: [
      {
        category: "Flight Instruments",
        items: [
          "Altímetro ajustado ao QNH",
          "HSI alinhado com a pista",
          "Velocímetro — indicando zero",
          "Bússola — conferência com HSI",
        ],
      },
      {
        category: "Engine Parameters",
        items: [
          "N1, ITT, Torque, Np — dentro dos limites",
          "Pressão e temperatura de óleo — normais",
          "Combustível — quantidade suficiente",
        ],
      },
      {
        category: "Radios",
        items: [
          "Frequência de torre ajustada",
          "Frequência de emergência 121.5 disponível",
          "Comunicação bidirecional confirmada",
        ],
      },
      {
        category: "Transponder",
        items: [
          "Transponder — modo ALT ativo",
          "Código de transponder ajustado (conforme instrução)",
        ],
      },
      {
        category: "AFCS",
        items: [
          "AFCS — modo de pilotagem automática testado",
          "SAS — estabilização ativa",
          "Modos de voo (HDG, NAV, ALT) — selecionados conforme plano",
        ],
      },
    ],
  },
  {
    id: "shutdown",
    name: "Corte de Motor",
    short: "Corte",
    sections: [
      {
        category: "Idle",
        items: [
          "Throttle — reduzir para idle",
          "Estabilizar marcha lenta por 1 minuto (resfriamento)",
          "Parâmetros do motor — dentro dos limites",
        ],
      },
      {
        category: "Avionics OFF",
        items: [
          "GPS — salvar rota / desligar",
          "Rádio — desligar",
          "Avionics switch — OFF",
        ],
      },
      {
        category: "Battery OFF",
        items: [
          "Verificar sem mensagens de falha pendentes",
          "Battery switch — OFF",
        ],
      },
      {
        category: "Rotor Stop Check",
        items: [
          "NR — redução até parada completa do rotor",
          "Rotor principal — parada suave sem vibração anormal",
          "Inspeção visual do rotor e fuselagem",
          "Documentos e diário de bordo preenchidos",
        ],
      },
    ],
  },
];

export const PHASE_LABELS = {
  pre_flight: "Pré-Voo",
  startup: "Acionamento",
  post_startup: "Pós-Acionamento",
  before_takeoff: "Before Takeoff",
  shutdown: "Corte de Motor",
  post_flight: "Pós-Voo",
};