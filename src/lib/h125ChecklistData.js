// Checklists operacionais H125 (AS350 B2 Écureuil / Arriel 2D) — PT-BR
// Mesmas fases do AW119, descrições específicas da aeronave H125.
export const H125_CHECKLIST_PHASES = [
  {
    id: "pre_voo",
    name: "Pré-Voo",
    title: "PRÉ-VOO (AS350 B2)",
    sections: [
      {
        category: "Inspeção Externa",
        items: [
          "Pás do rotor principal — sem trincas, erosão ou dano nas bordas de ataque",
          "Cubo do rotor principal (Starflex) — inspeção dos elastômeros, parafusos e contraporcas seguros",
          "Rotor de cauda — pás e cubo íntegros; eixo e mancais sem folga excessiva",
          "Fuselagem — sem amassados, trincas ou corrosão; inspeção das carenagens",
          "Trem de pouso (esquis/patins) — íntegro, amortecedores sem vazamento",
          "Antenas e portas estáticas (pitot-static) — livres e desobstruídas",
          "Capôs e carenagens do motor — fechados e travados",
          "Dreno de combustível — amostra verificada (sem água/contaminantes)",
          "Entrada de ar do motor — livre de obstruções e FOD",
          "Tomada de pressão dinâmica (pitot) — desobstruída",
        ],
      },
      {
        category: "Inspeção Interna",
        items: [
          "Cintos e assentos — funcionais e seguros",
          "Controles de voo — movimento livre e completo em todos os eixos",
          "Pedais — curso completo e suave",
          "Coletivo e cíclico — sem folga excessiva, fricção ajustada",
          "Extintor de incêndio a bordo e dentro da validade",
          "Kit de primeiros socorros a bordo",
          "Cargas e bagagem fixadas e dentro dos limites de CG",
          "Maçanetas e portas — funcionamento verificado",
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
        category: "Combustível (Jet A-1)",
        items: [
          "Quantidade de combustível suficiente para missão + reserva (mínimo 30 min)",
          "Tampa do tanque fechada e travada",
          "Válvula seletora de combustível na posição correta",
          "Indicadores de combustível (VEMD) funcionais e concordantes",
          "Verificação visual de vazamentos nas conexões",
        ],
      },
      {
        category: "Óleo e Fluidos",
        items: [
          "Nível de óleo do motor (Arriel 2D) dentro do limite — verificação pelo visor ou bocal",
          "Nível de óleo da transmissão principal dentro do limite",
          "Nível de óleo do rotor de cauda dentro do limite",
          "Nível de fluido hidráulico dentro do limite",
          "Inspeção visual de vazamentos de fluido sob a aeronave",
        ],
      },
      {
        category: "Sistema Hidráulico",
        items: [
          "Nível de fluido hidráulico dentro do limite (sistema principal e emergencial)",
          "Válvulas e atuadores hidráulicos — inspeção visual sem vazamentos",
          "Acumulador hidráulico — pressão dentro do limite (se aplicável)",
        ],
      },
      {
        category: "Aviônicos (VEMD/Garmin)",
        items: [
          "Instrumentos do painel — legíveis e funcionais",
          "VEMD (Vehicle and Engine Multifunction Display) — ligado e sem mensagens de falha",
          "Rádio / transponder / GPS Garmin — ligados e testados",
          "Altímetro ajustado ao QNH local",
          "Bateria — carga e conexões seguras; tensão adequada",
        ],
      },
    ],
  },
  {
    id: "pre_acionamento",
    name: "Pré-Acionamento",
    title: "PRÉ-ACIONAMENTO (AS350 B2 — PRE-START CHECK)",
    sections: [
      {
        category: "Preparação de Cabine e Comandos",
        items: [
          "Pedais e assentos — ajustar conforme o piloto",
          "Cinto de segurança — afivelar e ajustar",
          "Cíclico — centralizado (ou contra o vento) e fricção ajustada",
          "Coletivo — totalmente abaixado e fricção ajustada",
          "Manete de combustível (fuel throttle) — recolhida / fechada",
          "Roda livre (freewheel) — verificar engatada",
        ],
      },
      {
        category: "Painéis, Chaves e Disjuntores",
        items: [
          "Disjuntores e circuit breakers — todos armados (ON)",
          "Chave HYD (hidráulico) — ON",
          "Chave GEN (gerador) — conforme procedimento (OFF antes da partida)",
          "Chave BAT (bateria) — ON",
          "Chave de ignição (IGN) — conforme procedimento",
          "Chave FUEL PUMP (bomba de combustível) — ON (verificar pressão)",
          "Painel de combustível — válvula aberta",
          "Chave ELT — ARM",
          "VEMD — verificar inicialização e página de motor",
          "Iluminação de painel — conforme necessário",
        ],
      },
      {
        category: "Testes de Avisos e Displays",
        items: [
          "MASTER WARNING / MASTER CAUTION — testar e resetar",
          "Lâmpadas de aviso (test push) — verificar todas iluminadas",
          "Alertas sonoros (stall, low rotor RPM, etc.) — testar",
          "VEMD — verificar mensagens CAS e parâmetros de motor em repouso",
          "Indicadores analógicos (NR, TOT, Ng, torque) — em repouso/zero",
        ],
      },
      {
        category: "Sistema de Combustível e Pré-Partida",
        items: [
          "Bomba de combustível elétrica — ON; verificar pressão de combustível no VEMD",
          "Válvula seletora — tanque principal selecionado",
          "Quantidade de combustível — confirmar no VEMD",
          "Área do rotor — livre de pessoas e obstáculos",
          "Briefing de partida — realizar (sinal de partida, rotação do rotor)",
          "Temperatura do motor (TOT) — verificar dentro do limite para partida",
        ],
      },
    ],
  },
  {
    id: "acionamento",
    name: "Acionamento",
    title: "ACIONAMENTO (AS350 B2 — STARTING PROCEDURE)",
    sections: [
      {
        category: "Preparação para Partida",
        items: [
          "VEMD — verificar indicações válidas de atitude, proa, velocidade, altitude",
          "Página de motor (FULL ENGINE) — selecionada no VEMD",
          "Área do rotor — livre",
          "Freio de rotor (se instalado) — soltar",
          "Cíclico e pedais — centralizados",
          "Coletivo — passo mínimo (flat pitch), manete fechada",
        ],
      },
      {
        category: "Partida do Motor (Arriel 2D)",
        items: [
          "Botão START — pressionar; observar rotação do motor de partida e aumento de Ng",
          "Ignição — verificar ativa; TOT em aumento monitorado",
          "Manete de combustível — avançar para IDLE quando Ng ≥ 10-12% e TOT dentro do limite",
          "TOT — não exceder o limite máximo de partida (geralmente 840°C transiente)",
          "Pressão de óleo do motor — verificar aumento conforme Ng sobe",
          "Motor de partida — confirmar desacoplamento automático (Ng ≈ 40-50%)",
          "Ng em IDLE — estabilizar (aprox. 55-60%); TOT estabilizado sem tendência ascendente",
          "Pressão de óleo e temperatura — dentro dos limites (verde)",
        ],
      },
      {
        category: "Verificações Pós-Partida",
        items: [
          "Gerador (GEN) — ON; verificar tensão 28V e carga nominal",
          "Bomba de combustível elétrica — OFF (verificar pressão mantida pela bomba do motor)",
          "Sistema hidráulico — verificar pressão dentro do limite (verde)",
          "VEMD — verificar todos os parâmetros de motor no arco verde",
          "Mensagens CAS — nenhuma cautela ativa (ou apenas as esperadas em solo)",
          "Aviônicos — ligar conforme necessário (GPS, rádios, transponder STBY)",
        ],
      },
    ],
  },
  {
    id: "pos_acionamento",
    name: "Pós-Acionamento",
    title: "PÓS-ACIONAMENTO (AS350 B2 — SYSTEMS CHECK)",
    sections: [
      {
        category: "Preparação de Sistemas",
        items: [
          "Manete de combustível — posição FLT (100% NR); verificar NR em 100-101%",
          "Óleo do motor e transmissão — pressões e temperaturas dentro dos limites",
        ],
      },
      {
        category: "Sistema Hidráulico",
        items: [
          "Chave HYD — ON; movimentos suaves de cíclico, coletivo e pedais; verificar pressão hidráulica estável",
          "Chave HYD — OFF (teste do sistema sem assistência); verificar aumento de força nos comandos sem travamento",
          "Chave HYD — ON; confirmar retorno da assistência hidráulica",
        ],
      },
      {
        category: "Sistema de Combustível",
        items: [
          "Bomba de combustível elétrica — OFF; verificar pressão mantida pela bomba do motor",
          "Válvula seletora — tanque principal; verificar indicação de quantidade",
          "Verificar fluxo de combustível no VEMD (sem anomalias)",
        ],
      },
      {
        category: "Controles de Voo e Compensador",
        items: [
          "Cíclico — deslocar suavemente em todos os eixos; verificar resposta livre e proporcional",
          "Coletivo — curso completo suave; verificar indicador de passo",
          "Pedais — curso completo; verificar resposta livre",
          "Compensador (trim) — testar em todos os eixos (pitch, roll, yaw)",
          "Stability Augmentation System (SAS, se instalado) — engatar e verificar",
        ],
      },
      {
        category: "Aviônicos e Navegação",
        items: [
          "VEMD — verificar todas as páginas e mensagens CAS",
          "GPS Garmin — inicializado, posição correta, banco de dados vigente",
          "Rádios (COM/NAV) — sintonizar frequências de uso e testar",
          "Transponder — STBY; ajustar código conforme autorização",
          "Altímetro — ajustar ao QNH local; verificar indicador de altitude",
          "Indicador de atitude (AHRS/gyro) — ereto e estável",
          "Pitot heat — testar e retornar conforme necessário (OFF em solo)",
        ],
      },
      {
        category: "Comunicação / Navegação",
        items: [
          "Intercomunicador (ICS) — testar entre tripulantes",
          "Rádio COM — testar transmissão e recepção",
          "Indicador Standby — verificar atitude, proa, altitude e velocidade válidas",
          "Visão sintética (se disponível) — verificar dados GPS",
        ],
      },
    ],
  },
  {
    id: "decolagem",
    name: "Decolagem",
    title: "DECOLAGEM (AS350 B2 — BEFORE TAKE-OFF)",
    sections: [
      {
        category: "Prontidão para Decolagem",
        items: [
          "VEMD/GPS — carregar plano de voo (se aplicável); ajustar frequências e transponder",
          "Portas — fechar e travar; verificar indicadores de porta travada",
          "Manete de combustível — posição FLT; NR em 100-101%",
          "SAS (se instalado) — engatar",
          "PFD/Instrumentos — verificar instrumentos de voo; checagem cruzada",
          "VEMD — página FULL ENGINE; verificar CAS e parâmetros no arco verde",
          "Luzes internas e externas — conforme necessário (anticollision, navegação)",
          "Pitot heat — conforme necessário (ligar em visibilidade reduzida por umidade)",
          "Aquecedor / Ar-condicionado — conforme necessário",
        ],
      },
      {
        category: "Decolagem e Subida",
        items: [
          "Pairado (Hover) — estabelecer pairado a 3-5 ft",
          "Comandos de voo — verificar funcionamento livre e correto",
          "PFD/VEMD — verificar resposta dos instrumentos; observar torque (TQ) e TOT",
          "Verificação de potência do motor — conforme necessário (ref. RFM Seção 4)",
          "Decolagem — inclinar o nariz suavemente; ajustar torque conforme necessário; acelerar até velocidade de subida (Vy)",
          "Monitorar limites de TQ, TOT e Ng durante a subida",
        ],
      },
    ],
  },
  {
    id: "em_voo",
    name: "Em Voo",
    title: "EM VOO (AS350 B2 — IN FLIGHT)",
    sections: [
      {
        category: "Procedimentos em Voo",
        items: [
          "Coletiva — ajustar conforme necessário para manter parâmetros do motor dentro dos limites",
          "Velocidade — manter dentro dos limites (VNE conforme placas e altitude)",
          "Luzes de pouso — OFF se não em uso",
          "Pitot heat — conforme necessário (ligar em visibilidade reduzida por umidade/chuva)",
          "Altitude — conforme necessário; observar regras de oxigênio em alta altitude",
          "NR — monitorar; manter dentro do arco verde (97-101%)",
          "TOT e Ng — monitorar para não exceder limites em subida sustentada",
          "SAS (se instalado) — monitorar engatado; recentralizar comandos conforme necessário",
        ],
      },
    ],
  },
  {
    id: "corte_motor",
    name: "Corte de Motor",
    title: "CORTE DE MOTOR (AS350 B2 — SHUTDOWN)",
    sections: [
      {
        category: "Corte do Motor",
        items: [
          "Luzes de pouso — OFF",
          "Pitot heat — OFF",
          "Aquecedor / Ar-condicionado — OFF",
          "Coletivo — verificar totalmente abaixado",
          "Cíclico e pedais — centralizados",
          "Manete de combustível — IDLE por pelo menos 30 segundos para estabilizar TOT",
          "Manete de combustível — CLOSED (OFF); verificar Ng decrescendo e TOT diminuindo",
          "Rotor — aguardar desaceleração até NR abaixo de ~5%",
          "Freio de rotor (se instalado) — aplicar quando NR baixo",
        ],
      },
      {
        category: "Verificação Pós-Voo",
        items: [
          "Bomba de combustível elétrica — OFF",
          "Válvula seletora de combustível — CLOSED",
          "Gerador (GEN) — OFF",
          "Aviônicos — OFF",
          "Chave BAT — OFF",
          "Luzes externas (anticollision, navegação) — OFF",
          "Capas de pitot, admissão e exaustão — instalar (aguardar resfriamento do motor)",
          "Inspeção visual final — vazamentos, danos, FOD",
        ],
      },
    ],
  },
];

export const H125_PHASE_LABELS = H125_CHECKLIST_PHASES.reduce((acc, p) => {
  acc[p.id] = p.name;
  return acc;
}, {});