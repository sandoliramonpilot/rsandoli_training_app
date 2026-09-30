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
    subtitle: "POP — Testes e Diagnóstico de Sistemas (AW119KXi / EFIS IDU-680)",
    sections: [
      {
        category: "Filosofia Geral dos Testes de Sistemas",
        items: [
          "Ação Física — interagir com botões, switches e manetes mecânicas conforme cada sistema",
          "Confirmação Visual — leitura imediata nos painéis MFD/PFD e verificação de alertas no CAS (Crew Alerting System)",
          "Interpretação Cognitiva — validar redundância crítica, integridade dos aviônicos e autoridade de comando antes da descolagem",
        ],
      },
      {
        category: "1. Sistema de Combustível",
        items: [
          "Switch PUMP/XTER colocado em OFF",
          "Verificação visual — pressão de combustível cai a zero; aguardar 5 segundos sem alteração no motor",
          "Restabelecimento — retornar XFER e PUMP 1 para ON (normaliza pressão) e em seguida PUMP 2 para ON",
          "Alertas CAS esperados — 1-2 FUEL PUMP, FUEL PRESS, XTER PUMP",
        ],
      },
      {
        category: "2. Sistema Hidráulico",
        items: [
          "Servo em NORM — pressionar botão FTR e movimentar cíclico, pedais e coletivo",
          "Regra de Ouro — queda de pressão não superior a 70 psi",
          "Servo 1 OFF — cíclico e coletivo normais; pedais rígidos/resistentes (isolados do Servo 1)",
          "Alertas esperados no Servo 1 OFF — 1 HYD PRESS e SERVO 1 OFF",
          "Servo 2 OFF — pressionar FTR e repetir varredura sem aumento de força ou descontinuidade de curso",
          "Retorno — ao retornar a chave para ON, notar som de atrito normal do restabelecimento hidráulico",
        ],
      },
      {
        category: "3. Droop Compensator (EEC / MEC)",
        items: [
          "Posição MEC — mover chave EEC para MEC",
          "Verificar alerta amarelo MEC OPN e estabilização do NR em 97%",
          "Ajustar NR via NR TRIM no coletivo se necessário",
          "Posição EEC — retornar chave para EEC",
          "Confirmar — alerta MEC OPN apaga, NR estabiliza em 102%, e a chave NR TRIM fica eletricamente inoperante",
          "Nota de Segurança — se NR abaixo de 30%, o aviso MEC OPN acende independentemente da posição física da chave",
        ],
      },
      {
        category: "4. Sistema Helipilot (SAS)",
        items: [
          "Acoplamento — ligar SAS 1 e SAS 2 (avisos 1 SAS OFF e 2 SAS OFF apagam)",
          "Com ATTD HOLD em OFF — gerar alerta ATT OFF",
          "Teste Físico — deslocar o manche cíclico 1 polegada (eixos lateral/longitudinal) e confirmar movimento simultâneo no painel API",
          "Mover pedais sutilmente para confirmar barra de Yaw",
          "Desarme e Auto-Arme — desligar SAS 1 e SAS 2",
          "Observar — a chave ATTD HOLD arma automaticamente para ON na falha e o alerta ATT OFF é suprimido",
        ],
      },
      {
        category: "5. Sistema Elétrico (Inversores CA e Gerador Auxiliar DC)",
        items: [
          "Inversores CA — verificar tensão base de 115 ± 5 VAC",
          "Desligar fisicamente o INV-1 — verificar avisos INV-1 OFF e SAS-1 OFF",
          "Confirmar que o INV-2 assume a carga sem instabilidade",
          "Repetir o procedimento para o INV-2",
          "Gerador Auxiliar DC (0 a 3s) — pressionar e segurar botão TEST; alertas DC GEN e BATT DISCH ativos (leitura ~24 VDC da bateria)",
          "Gerador Auxiliar DC (3 a 6s) — BATT DISCH apaga; transição para fonte lógica AUX GEN (leitura 26 a 28 VDC)",
          "Gerador Auxiliar DC (Fim) — soltar botão TEST; DC GEN apaga, indicando fonte lógica GEN (~28 VDC estabilizados)",
        ],
      },
      {
        category: "6. Painel de Controle de Reversão (RCP) — Modelo KXi",
        items: [
          "ADU (Air Data) — selecionar Posição 1 ou 2",
          "Verificar CAS amarelo SAME ADC e checar PFD (Airspeed, Altitude, IVSI a 0 ± 50 pés/min)",
          "Retornar ADU para NORM",
          "AHRS (Attitude/Heading) — selecionar Posição 1 ou 2",
          "Verificar CAS amarelo SAME AHRS e checar atitudes e rumos nos PFDs",
          "Retornar AHRS para NORM",
          "GPS (Nav Source) — selecionar Posição 1 ou 2",
          "Verificar FMS no PFD e alertas CAS SAME GPS e SAME NAV",
        ],
      },
      {
        category: "7. Flight Director (FD)",
        items: [
          "Modos Básicos/Lateral — segurar botão SBY e FD STBY no punho do cíclico",
          "Ativar HDG com SAS 1/2 e ATT HOLD ligados (bug muda para magenta)",
          "Testar giro do Bug de rumo a ±3° para confirmar resposta física dos atuadores",
          "Modos Verticais — ativar AUTOTRIM em ON",
          "Selecionar VS (+500 pés) e testar GA (Go Around)",
          "Aviso — movimentos bruscos no cíclico podem ocorrer; o piloto deve estar pronto para usar FD STBY ou DECOUPL",
        ],
      },
      {
        category: "8. EICAS Backup e Falhas DAU",
        items: [
          "Identificação — CAS amarelo MISCOMP-P acompanhado de asterisco (*) no parâmetro digital",
          "Procedimento — abrir página completa do EICAS no MFD afetado",
          "Pressionar o botão EICAS BACKUP no painel PBA para cruzar a leitura com o segundo canal da DAU",
          "Avaliar a necessidade de pouso com base na discrepância",
        ],
      },
      {
        category: "9. Verificação Comm/Nav e Dados de Voo",
        items: [
          "Lado Piloto (Esquerdo) — com switch EMER selecionado, verificar transmissão/recepção no COM 2 e áudio do NAV 2",
          "Lado Copiloto (Direito) — com switch EMER selecionado, verificar transmissão/recepção no COM 1 e áudio do NAV 1",
          "Displays — validar visão sintética com GPS válido",
          "Checar alinhamento do PFD e painel Standby (EFD-750)",
        ],
      },
      {
        category: "10. Pitot Heat (Teste Dinâmico)",
        items: [
          "Ligar chaves PITOT 1 e PITOT 2 no painel AC/DC",
          "Verificar pico de corrente no medidor do gerador",
          "Confirmar surgimento dos alertas 1 PITOT HTR e 2 PITOT HTR",
          "Desligar ambos os interruptores e certificar-se de que os alertas se apagam corretamente",
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