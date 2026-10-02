// Checklists operacionais AW119Kx — traduzidos do RFMS (Genesys EFIS), PT-BR
export const MISSION_TYPES = [
  { id: "instrucao", label: "Instrução" },
  { id: "treinamento", label: "Treinamento" },
  { id: "transporte", label: "Transporte" },
  { id: "aeromedico", label: "Aeromédico" },
  { id: "seguranca_publica", label: "Segurança Pública" },
  { id: "patrulhamento", label: "Patrulhamento" },
  { id: "sar", label: "SAR" },
  { id: "fiscalizacao", label: "Fiscalização" },
  { id: "outro", label: "Outro" },
];

export const CHECKLIST_PHASES = [
  {
    id: "pre_voo",
    name: "Pré-Voo",
    title: "PRÉ-VOO",
    sections: [
      {
        category: "Inspeção Externa",
        items: [
          "Pás do rotor principal — sem trincas, abrasão ou dano",
          "Cubo do rotor principal — parafusos e contraporcas seguros",
          "Rotor de cauda — pás e cubo íntegros",
          "Fuselagem — sem amassados, trincas ou corrosão",
          "Trem de pouso / patins — íntegro e seguro",
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
        category: "Sistema Hidráulico",
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
    id: "pre_acionamento",
    name: "Pré-Acionamento",
    title: "PRÉ-ACIONAMENTO (ENGINE PRE-START CHECK)",
    sections: [
      {
        category: "Preparação de Cabine e Comandos",
        items: [
          "Pedais e assentos — Ajustar",
          "Cinto de segurança — Afivelar e ajustar",
          "Pedais (se instalado P/N 109G6720F05) — Verificar apoios simétricos e pino de travamento (≈5mm visível, alavanca abaixada)",
          "Manche cíclico — Centralizado (ou contra o vento) e fricção ajustada",
          "Manete coletiva — Totalmente abaixada e fricção ajustada",
          "Acelerador do motor — OFF; verificar posições IDLE e FLT (seletor MAN/NOR em MAN, girar até MAX e retornar a FLT; retornar seletor a NOR; girar para IDLE e soltar até OFF). Nota: abaixo de -20°C a força necessária pode aumentar levemente",
        ],
      },
      {
        category: "Painéis, Chaves e Disjuntores",
        items: [
          "Chave EEC/MEC — EEC",
          "Disjuntores e circuit breakers dos painéis superior e dianteiro — ON (armados)",
          "Chave da fonte estática (STATIC) — NORM e travada",
          "Freio de rotor (se instalado) — Verificação de função, OFF",
          "Painéis de controle de áudio — Ajustados",
          "Chaves AHRS 1-2 — MAG",
          "Chaves SAS 1-2 — OFF",
          "Chave ATTD HOLD — ON",
          "Chave AUTO TRIM — ON",
          "Chave COUPL/DECOUPL — COUPL",
          "Painel de combustível — Todas as chaves OFF ou CLOSED",
          "Chave SERVO — NORM",
          "Chave AWG — NORM",
          "Chave TEST — Centralizada",
          "Chave F-TRIM — ON",
          "Chaves AHRS, ADU e GPS — NORM",
          "Chave ELT — ARM",
          "Chave BAT — ON",
          "Chave BUS — ON",
          "Tensão da bateria (relógio) — 24V mínimo",
          "Energia externa (se usada) — Conectar, 28V mínimo",
          "PFD/MFD piloto e copiloto (se instalado) — Confirmar displays energizados e EICAS BACKUP OFF",
        ],
      },
      {
        category: "Testes de Avisos e Displays",
        items: [
          "PFD/MFD (todos) Status Page — Verificar versão do software (ref. Limitações), validade/expiração do banco de dados; pressionar tecla para sair e entrar em modo de voo",
          "PFD/MFD (todos) — Verificar formato NORMAL (não ESSNTL); ajustar brilho (DIM)",
          "MFD — Verificar página FULL ENGINE e mensagens CAS",
          "MASTER CAUTION / MASTER WARNING — Reconhecer e resetar",
          "Iluminação de cabine — Conforme necessário",
          "Chave AWG — TEST (manter conforme necessário); verificar alerta sonoro \"TEST OK\" e soltar",
          "Chave TEST — LAMP (manter); verificar iluminação de todos os interruptores e anunciadores do painel. Manter TEST acionada. Todos os alertas sonoros armazenados serão reproduzidos sequencialmente",
          "Chave TEST — FCU/FIRE (manter); verificar aviso ENG FIRE, Master Warning e alerta sonoro \"ENGINE FIRE\" (repete se mantido >6s)",
          "Chave TEST — FCU/FIRE (manter); verificar cautela FUEL LOW, quantidades próximas de \"0\" kg, leitura nº1 amarela e nº2 com \"X\"; soltar e confirmar retorno ao normal",
        ],
      },
      {
        category: "Sistema EEC e Combustível",
        items: [
          "Chave ENG HTR — ON",
          "Chave de luzes A-COLL — ON",
          "Chave de luzes de posição (POS) — Conforme necessário",
          "Chave IGN — AUTO",
          "Chave EEC/MEC — Autoteste alternando MEC-EEC: verificar EEC FAIL, EEC DEGRADED e MEC OPN sequenciais com tons no headset; sucesso indicado por MEC OPN ao final; PLA POS reativa ao final (nota: com NR <30% o MEC OPN é exibido independente da posição da chave)",
          "Quantidade de combustível — Verificar",
          "Chave VALVE — OPEN; verificar luz OPEN no painel de combustível",
          "Chave PUMP (transferência) — XFER; cautela XFER PUMP apaga",
          "Chave PUMP 1 — ON (1 FUEL PUMP apaga, verificar pressão); OFF (1-2 FUEL PMP e FUEL PRESS exibidas)",
          "Chave PUMP 2 — ON (2 FUEL PUMP e FUEL PRESS apagam, verificar pressão)",
          "Chave PUMP 1 — ON; cautela 1 FUEL PUMP apaga",
          "Altímetro do PFD — Ajustar ao QNH local ou elevação de campo",
          "Altímetro — Ajustar ao QNH local e dimming conforme necessário",
        ],
      },
    ],
  },
  {
    id: "acionamento",
    name: "Acionamento",
    title: "ACIONAMENTO (STARTING PROCEDURE)",
    sections: [
      {
        category: "Preparação para Partida",
        items: [
          "PFDs — Verificar indicações válidas de atitude, proa, velocidade, altitude, VSI e OAT",
          "MFDs — Verificar formato FULL ENGINE selecionado",
          "Área do rotor — Livre",
          "Freio de rotor (se instalado) — Soltar",
          "Cíclico e pedais — Centralizados (evitar movimento abaixo de 85% NR, exceto para prevenir contato com batentes)",
          "Comando coletivo — Passo mínimo (flat pitch), acelerador do motor fechado",
        ],
      },
      {
        category: "Partida do Motor",
        items: [
          "Botão START (manete coletiva) — Pressionar e soltar; MFD exibe ENG START e IGNITER ON, aviso IGN junto ao ITT e START junto ao N1 (observar limitações do motor de partida)",
          "Acelerador do motor (N1 > 12% e ITT < 100°C) — IDLE; observar aumento de N1 e ITT. Cuidado: ITT transiente máximo 1090°C, não exceder 980°C por mais de 2s. Monitorar partida — sem ignição em 10s, cortar (OFF) e repetir START para interromper o motor de partida. Executar DRY MOTORING.",
          "Pressão de óleo do motor — Verificar (pode exceder 110 psi temporariamente em partida a frio)",
          "MFD — Verificar desativação automática do motor de partida (N1 ≈43%), avisos ENG START/IGNITER ON apagam; ao rotor girar, verificar aumento da pressão hidráulica",
          "MFD e PFD — Verificar mudança automática do ITT para formato Cruise (ocorre em N1=51% subindo / 50% descendo)",
          "Gerador de gás (N1) — Verificar estabilizado em 61±1% (se abaixo de 51%, aguardar 3 min de aquecimento; repetir se necessário; se ainda abaixo de 61±1%, cortar o motor — ação de manutenção)",
        ],
      },
      {
        category: "Verificações Pós-Partida",
        items: [
          "Óleo do motor e transmissão — Verificar pressões e temperaturas (pressão da transmissão pode estar sob o arco verde em IDLE, sem ação se temperatura estiver no arco verde)",
          "Chave BAT — Confirmar ON",
          "Energia externa — Desconectar (se usada), porta segura; EXT PWR ON apaga; BATT DISCH exibida",
          "Chave GEN — ON; DC GEN e BATT DISCH apagam",
          "Indicação elétrica — Tensão dentro dos limites (fonte GEN) e amperagem dentro dos limites",
          "Chaves INV 1 e 2 — ON; 1 INV OFF e 2 INV OFF apagam",
          "Chave AVNX MSTR — ON",
          "Chave AUX GEN — ON (nota: com óleo do motor <10°C manter IDLE até 10°C; se transmissão ainda a 0°C, girar suavemente para FLT)",
        ],
      },
    ],
  },
  {
    id: "pos_acionamento",
    name: "Pós-Acionamento",
    title: "PÓS-ACIONAMENTO (SYSTEMS CHECK)",
    sections: [
      {
        category: "Preparação de Sistemas",
        items: [
          "Engine throttle — Levar à posição FLT, 102% RPM. Observar PLA POS apagada.",
        ],
      },
      {
        category: "Óleo do Motor e Transmissão",
        items: ["Pressão e temperatura — Dentro dos limites"],
      },
      {
        category: "Sistema Hidráulico",
        items: [
          "Chave SERVO em NORM — pequenos movimentos de cíclico, coletiva e pedais; queda de pressão igual nos sistemas #1 e #2, não excedendo 70 psi",
          "Chave SERVO em 1 OFF — cautela 2 SERVO exibida; repetir verificação no sistema #1; queda não deve exceder 70 psi, sem aumento de força, discontinuidade ou acoplamento cíclico/coletivo",
          "Repetir com chave em 1 OFF para checar sistema #2, depois retornar a NORM (nota: boost dos pedais vem do sistema #1; ao testar o #2 é normal pedais ficarem sem boost)",
        ],
      },
      {
        category: "Sistema de Combustível",
        items: [
          "Chave XFER — OFF; cautela XFER PUMP exibida",
          "Chaves PUMP 1 e PUMP 2 — OFF; cautelas 1-2 FUEL PMP e FUEL PRESS exibidas; pressão de combustível zero",
          "Bomba de combustível acionada pelo motor — Verificar operação",
          "Chave PUMP 1 — ON; 1 FUEL PMP e FUEL PRESS apagam",
          "Chave PUMP 1 — OFF; 1-2 FUEL PMP e FUEL PRESS exibidas novamente",
          "Chave PUMP 2 — ON; 2 FUEL PMP e FUEL PRESS apagam; verificar pressão dentro dos limites",
          "Chave PUMP 1 — ON; 1 FUEL PMP apaga (nota: pode ocorrer ativação temporária de FUEL FILTER pela variação de pressão)",
          "Chave XFER — XFER; cautela XFER PUMP apaga",
        ],
      },
      {
        category: "Compensador Droop (EEC/MEC) — Primeiro Voo do Dia",
        items: [
          "Chave EEC/MEC — MEC; cautela MEC OPN exibida; verificar NR em 97% (ajustar via NR TRIM se necessário)",
          "Chave EEC/MEC — EEC; cautela MEC OPN apaga; verificar NR em 102% (nota: com EEC engatado, NR TRIM fica inoperante; abaixo de 30% NR, MEC OPN é exibido independente da posição)",
        ],
      },
      {
        category: "Sistema Elétrico CA (Inversores) e Gerador Auxiliar DC",
        items: [
          "MFD — Verificar tensão 115±5 VAC",
          "Chave INV 1 — OFF; cautelas 1 INV OFF e 1 SAS OFF exibidas (1 VG pode aparecer brevemente)",
          "Chave SAS 1 — SAS 1; cautela 1 SAS OFF apaga",
          "Chave INV 1 — ON; 1 INV OFF apaga, 1 SAS OFF exibida",
          "Chave SAS 1 — SAS 1; 1 SAS OFF apaga",
          "Chave INV 2 — OFF; cautelas 2 INV OFF e 2 SAS OFF exibidas (2 VG pode aparecer brevemente)",
          "Chave SAS 2 — SAS 2; 2 SAS OFF apaga",
          "Chave INV 2 — ON; 2 INV OFF apaga, 2 SAS OFF exibida",
          "Chave SAS 2 — SAS 2; 2 SAS OFF apaga",
          "Gerador Auxiliar DC — Pressionar e manter TEST; 0-3s: DC GEN e BATT DISCH exibidas, fonte BATT ≈24VDC",
          "Gerador Auxiliar DC — 3-6s: BATT DISCH apaga, fonte AUX GEN ≈26-28VDC",
          "Gerador Auxiliar DC — Soltar o botão: DC GEN apaga, fonte GEN ≈28VDC estabilizados",
        ],
      },
      {
        category: "Painel de Reconfiguração (RCP)",
        items: [
          "ADU Knob — NORM (SAME ADC apaga); 1 (SAME ADC exibida, verificar airspeed/altitude/VSI válidos); 2 (idem); retornar a NORM",
          "AHRS Knob — NORM (SAME AHRS apaga); 1 (SAME AHRS exibida, verificar atitude/proa válidos); 2 (idem); retornar a NORM",
          "GPS Knob — NORM (FMS2 piloto / FMS1 copiloto); 1 (FMS1 ambos, SAME GPS/SAME NAV exibidas); 2 (FMS2 ambos, SAME GPS/SAME NAV exibidas); retornar a NORM",
        ],
      },
      {
        category: "Sistema HeliPilot (SAS)",
        items: [
          "MFD/CAS — Verificar 1 VG e 2 VG apagadas (SAS 1 não engata com 1 VG presente; SAS 2 não engata com 2 VG presente)",
          "EFIS e Indicador Standby — Atitude/proa cruzados e coincidentes",
          "Chave SAS 1 — SAS 1; 1 SAS OFF apaga",
          "Chave SAS 2 — SAS 2; 2 SAS OFF apaga",
          "Chave ATTD HOLD — OFF; cautela ATT OFF exibida",
          "Cíclico — Deslocar 1 polegada em cada eixo; API's de PITCH e ROLL indicam corretamente",
          "Pedais — Deslocar 1 polegada; API de YAW indica corretamente",
          "Botão FTR (cíclico) — Pressionar e manter até PITCH, ROLL e YAW recentrarem",
          "Chave SAS 1 — OFF; 1 SAS OFF exibida",
          "Cíclico — Deslocar 1 polegada em cada eixo; API's de PITCH e ROLL indicam corretamente",
          "Botão FTR — Pressionar e manter até PITCH e ROLL recentrarem (nota: apenas SAS 1 tem atuador de yaw; é normal YAW permanecer centrado usando só SAS 2)",
          "Chave SAS 2 — OFF; 2 SAS OFF exibida; ATTD HOLD trips automaticamente para ATT OFF",
          "Chave SAS 1 — SAS 1; 1 SAS OFF apaga",
          "Chave SAS 2 — SAS 2; 2 SAS OFF apaga",
          "Chave COUPL/DECOUPL — DECOUPL (FD DECPLED exibida); retornar a COUPL",
          "Chave AUTOTRIM — OFF (AUTOTRIM OFF exibida); retornar a ON",
        ],
      },
      {
        category: "Flight Director (FD)",
        items: [
          "SBY — Pressionar e manter; verificar todos anunciadores FD iluminam; soltar",
          "FD STBY (botão cíclico) — Pressionar e manter; verificar anunciadores; soltar",
          "HDG — Pressionar HDG no PFD para sincronizar bug; com SAS 1/2 e ATTD HOLD ON, engatar modo HDG; confirmar bug magenta e label HDG no ADI",
          "Cuidado: mudança excessiva do bug de proa pode mover o cíclico e inclinar o disco do rotor; estar preparado para FD STBY ou DECOUPL",
          "Rolar HDG até 3° de cada lado; confirmar atuadores de roll nos API's; pressionar FD STBY ao iniciar movimento do cíclico",
          "VS — Com SAS 1/2 e ATTD HOLD ON, engatar modo VS; confirmar bug magenta e label VS no ADI",
          "Cuidado: mudança excessiva do bug de VS pode inclinar o disco para frente/atrás; preparar para FD STBY ou DECOUPL",
          "Rolar VSI para selecionar VS +500 ft; pressionar FD STBY ao iniciar movimento do cíclico",
          "Botão Go Around (GA) — Pressionar; verificar barras de comando de pitch/roll e símbolo de seta da coletiva (sem simbologia de coletiva); pressionar FD STBY para desengajar",
          "API's do HELIPILOT — Verificar centralizados",
        ],
      },
      {
        category: "EICAS Backup",
        items: [
          "Chave EICAS BACKUP piloto — ON (SAME EICAS apaga); verificar indicações válidas de motor no PFD e airframe no MFD; OFF (SAME EICAS exibida)",
          "Chave EICAS BACKUP copiloto (se instalado) — ON (SAME EICAS apaga); verificar indicações válidas no PFD/MFD copiloto; OFF (SAME EICAS exibida)",
        ],
      },
      {
        category: "Comunicação / Navegação",
        items: [
          "Painel de áudio piloto, chave NORM/BK-UP/EMER — EMER; verificar transmissão/recepção em COM 2 e áudio de NAV 2",
          "Painel de áudio copiloto, chave NORM/BK-UP/EMER — EMER; verificar transmissão/recepção em COM 1 e áudio de NAV 1; verificar ICS entre piloto e copiloto",
          "Painéis de áudio piloto e copiloto — NORM",
          "Indicador Standby — Verificar atitude, proa, altitude e velocidade válidas/corretas",
          "PFD piloto e copiloto — Selecionar visão sintética para verificar validade dos dados GPS",
          "Indicações de atitude/proa — Verificar alinhamento correto",
          "Velocidade, altitude e VSI — Verificar indicações válidas/corretas",
          "Indicações do motor — Verificar dados válidos",
          "MFD piloto e copiloto — Ajustar formatos superior/inferior conforme necessário; página FULL ENGINE com dados válidos",
          "MFD — Página RADIO — ATC em STBY; inserir FLT ID se necessário",
        ],
      },
      {
        category: "Pitot Heat",
        items: [
          "Chave PITOT 1 — ON (pico de corrente no amperímetro, 1 PITOT HEAT exibida); OFF (apaga)",
          "Chave PITOT 2 — ON (pico de corrente no amperímetro, 2 PITOT HEAT exibida); OFF (apaga)",
        ],
      },
    ],
  },
  {
    id: "decolagem",
    name: "Decolagem",
    title: "DECOLAGEM (BEFORE TAKE-OFF)",
    sections: [
      {
        category: "Prontidão para Decolagem",
        items: [
          "MFD — Carregar plano de voo; ajustar frequências de comunicação/navegação e código do transponder (nota: VOR pode ficar instável com separação <1,5MHz entre COMM e NAV; transponder muda automaticamente para ALT na decolagem)",
          "Portas (passageiros e tripulação) — Fechar e travar; cautela DOORS OPEN apaga",
          "Acelerador do motor — Posição FLT; cautela PLA POS apaga; NR em 102%",
          "SAS 1 e SAS 2 — ON",
          "PLT IN COMMAND — Selecionar conforme necessário",
          "PFD — Verificar instrumentos de voo; checagem cruzada EICAS/Standby Atitude; ajustar altímetro",
          "MFD — Página FULL ENGINE; verificar CAS e parâmetros dentro dos limites",
          "Luzes internas e externas — Conforme necessário",
          "Pitot heat — Conforme necessário (ligar ambos para voo em visibilidade reduzida por umidade/chuva, independente da temperatura)",
          "Aquecedor / Ar-condicionado — Conforme necessário",
        ],
      },
      {
        category: "Decolagem e Subida",
        items: [
          "Pairado (Hover) — Estabelecer pairado a 3 ft",
          "Comandos de voo — Verificar funcionamento livre e correto",
          "PFD — Verificar resposta correta dos instrumentos; observar torque (TQ)",
          "MFD — Página FULL ENGINE; verificar CAS e parâmetros dentro dos limites",
          "Verificação de Garantia de Potência do Motor — Conforme necessário (ref. RFM Seção 4)",
          "Decolagem — Inclinar o nariz ~10° a partir do datum de pairado; ajustar torque para permanecer abaixo de 10 ft AGL; a 30 KIAS aumentar torque ~15% e ajustar cíclico para atitude 0°; continuar aceleração até VY; em VY ajustar torque conforme necessário (não exceder limites de TQ e ITT)",
        ],
      },
    ],
  },
  {
    id: "em_voo",
    name: "Em Voo",
    title: "EM VOO (IN FLIGHT)",
    sections: [
      {
        category: "Procedimentos em Voo",
        items: [
          "Coletiva — Ajustar conforme necessário para manter parâmetros do motor dentro dos limites",
          "Velocidade — Manter dentro dos limites das placas VNE",
          "Luzes de pouso — OFF, se usadas; LANDING LT ON apaga",
          "Chaves PITOT 1 e PITOT 2 — Conforme necessário (ligar ambos em visibilidade reduzida por umidade/chuva, independente da temperatura)",
          "Altitude — Conforme necessário (consultar regras operacionais para oxigênio em alta altitude; acima de 7000ft Hp observar possível divisão NR/N2 acima de 103% N2 e reduzir pelo throttle; em caso de EEC/MEC para MEC, reduzir potência abaixo de 50% TQ antes de retornar a EEC)",
          "Indicadores de posição do atuador HELIPILOT (API) — Monitorar centralizados; recentralizar yaw manualmente via FTR (sem autotrim de yaw)",
          "Autotrim desligado — Monitorar e recentralizar pressionando FTR no punho do cíclico (nota: em temperatura muito baixa, força do cíclico longitudinal pode aumentar até 2kg)",
        ],
      },
    ],
  },
  {
    id: "corte_motor",
    name: "Corte de Motor",
    title: "CORTE DE MOTOR (SHUTDOWN)",
    sections: [
      {
        category: "Corte do Motor",
        items: [
          "Luzes de pouso — OFF",
          "Chaves de aquecimento PITOT — OFF",
          "Aquecedor / Ar-condicionado — OFF",
          "Manete coletiva — Verificar totalmente abaixada",
          "Cíclico e pedais — Centralizados e trimados (não aplicar coletiva nesta fase; abaixo de 85% NR evitar movimento do cíclico exceto para prevenir contato com batentes)",
          "Acelerador do motor — IDLE por pelo menos 30 segundos para estabilizar ITT; cautela PLA POS exibida",
          // PENDENTE DE CONTEÚDO – Procedimento após Acelerador do motor
          // (texto oficial ainda não fornecido; não exibir aos usuários operacionais)
          "Chaves PUMP 1 e PUMP 2 — OFF; cautela 1-2 FUEL PUMP exibida",
          "Chave PUMP (transferência) — OFF; cautela XFER PUMP exibida",
          "Chave ENG HTR — OFF",
          "Luzes de posição — OFF",
          "Chave AVNX MASTER — OFF",
          "Chaves INV 1 e INV 2 — OFF",
          "Chave IGN — OFF",
          "Chave AUX GEN — OFF",
        ],
      },
      {
        category: "Verificação Pós-Voo",
        items: [
          "Acelerador do motor — OFF; avisos ENG OUT e OIL PRESS exibidos; cautelas MEC OPN e DC GEN exibidas (verificar N1 desacelerando livremente, sem ruído anormal)",
          "Freio de rotor — Aplicar com NR abaixo de 40%",
          "Chave FUEL VALVE — CLOSED; verificar luz OPEN apagada no painel de combustível",
          "Luzes A-COLL — OFF",
          "Chave GEN — OFF",
          "Chave BAT — OFF",
          "Capas de pitot, admissão e exaustão — Instaladas (aguardar 5 min após desligar pitot heat para capas pitot-estático; aguardar 30 min após o corte para capas de exaustão)",
        ],
      },
    ],
  },
];

export const PHASE_LABELS = CHECKLIST_PHASES.reduce((acc, p) => {
  acc[p.id] = p.name;
  return acc;
}, {});

export const MISSION_LABELS = MISSION_TYPES.reduce((acc, m) => {
  acc[m.id] = m.label;
  return acc;
}, {});