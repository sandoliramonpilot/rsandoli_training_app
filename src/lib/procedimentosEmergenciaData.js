// PROCEDIMENTOS DE EMERGÊNCIA — Conteúdo extraído do PDF 3d1bd447b_03_EMERGENCY.pdf
// Material didático de treinamento. NÃO substitui RFM, RFMS, QRH, Pilot Guide,
// checklists aprovados ou publicações oficiais vigentes.
// Conteúdo técnico sem fonte aprovada é marcado como PENDENTE de validação.

export const DIDATIC_NOTICE =
  "Material didático de treinamento. Não substitui o RFM, RFMS, QRH, checklist aprovado, manual do fabricante, documentação operacional do operador ou orientação de instrutor qualificado.";

export const PENDING_CONTENT =
  "CONTEÚDO PENDENTE DE DOCUMENTAÇÃO E APROVAÇÃO TÉCNICA";

export const SOURCE_PDF_URL =
  "https://media.base44.com/files/public/6abbcee2e405be8f7f7ba4ef/3d1bd447b_03_EMERGENCY.pdf";

export const PROC_EMERGENCIA = {
  id: "proc_emergencia",
  name: "PROCEDIMENTOS DE EMERGÊNCIA",
  subtitle:
    "Procedimentos anormais e de emergência do AW119Kx — material didático extraído da apresentação técnica oficial.",
  premium: true,
  modules: [
    {
      id: "fire",
      title: "FIRE",
      icon: "Flame",
      objective:
        "Procedimentos de emergência para incêndio de motor em solo e em voo.",
      content:
        "O sistema de aviso de incêndio consiste em sinal sonoro e aviso de voz 'ENGINE FIRE' com indicação CAS 'ENG FIRE'.\n\nFOGO NO SOLO (Ground): Desligamento imediato — Manete (OFF) → Válvula de Combustível (CLOSED) → Bombas 1, 2 e Xfer (OFF). Elétrica: GEN (OFF) → BAT (OFF). Evacuação imediata.\n\nFOGO EM VOO (In Flight): Sobrevivência — Entre em Autorrotação (Coletivo todo embaixo → NR 90-110%). Descida: 70 KIAS (Razão Mínima de Descida) a 100 KIAS (Distância Máxima de Planeio). Isolamento — Execute o corte de motor e combustível durante a descida. Desligue GEN. Toque e Fuga — Após o pouso, BAT (OFF). Evacue a aeronave.",
      keyPoints: [
        "Identificação sonora e visual (CAS ENG FIRE)",
        "Fogo no solo: corte imediato de combustível e elétrica",
        "Fogo em voo: autorrotação imediata",
        "Pouso e evacuação rápida",
      ],
      imageDescriptions: [
        "Diagrama de fluxo para fogo no solo e em voo",
        "Ilustração do painel Master Warning",
      ],
      indications: [
        "Sinal sonoro",
        "Aviso de voz ENGINE FIRE",
        "CAS: ENG FIRE",
        "NR 90-110%",
        "70 KIAS (Razão Mínima de Descida)",
        "100 KIAS (Distância Máxima de Planeio)",
      ],
    },
    {
      id: "panes_eletricas",
      title: "PANES ELÉTRICAS",
      icon: "Zap",
      objective:
        "Procedimentos para falhas de sistema elétrico no glass cockpit.",
      content:
        "A anatomia de uma pane elétrica exige observação do CAS, orientação do sistema e ação (Load Shedding). Em voo IFR ou noturno, a perda elétrica degrada a consciência situacional.\n\nDiagnóstico rápido do fator 'DC GEN':\n• Cenário 1 (BATT DISCH com DC GEN) — gerador principal falhou ou desarmou; tentar reset (Switch ON).\n• Cenário 2 (BATT DISCH sem DC GEN) — bateria descarregando por outra anomalia; isolar gerador (Switch OFF) e transferir para AUX GEN.\n\nEm caso de falha de 'EMER DC BUS', ocorre uma cascata de falhas: perda de indicação NR, combustível, ajuste de força, iluminação e falha de freios magnéticos. 'The Fuel Trap': combustível no tanque direito abaixo de 120kg torna-se inutilizável. Ação: tentar reset do disjuntor EMER BUS uma vez; se falhar, aplicar limites e pousar.",
      keyPoints: [
        "Reconhecimento de alertas âmbar e vermelhos",
        "Execução de Load Shedding conforme sequência",
        "Diagnóstico entre falha de gerador ou anomalia na bateria",
        "Uso do gerador auxiliar (AUX GEN) se necessário",
      ],
      imageDescriptions: [
        "Fluxograma de diagnóstico DC GEN",
        "Diagrama de Load Shedding sequence",
        "Quadro de avisos para falha no EMER DC BUS",
      ],
      indications: [
        "BATT DISCH",
        "INV 2 OFF",
        "DC GEN",
        "SAS 2",
        "FUEL PUMP 2",
        "GEN CONTR",
        "XFER PUMP",
        "FUEL LOW",
        "1 INV OFF",
        "1 SAS OFF",
        "1 VG",
      ],
    },
    {
      id: "sistema_combustivel",
      title: "SISTEMA DE COMBUSTÍVEL",
      icon: "Fuel",
      objective:
        "Gerenciamento de combustível e falhas de pressão.",
      content:
        "A pressão é lida por transdutor físico na válvula de corte e transmitida ao Genesys EICAS.\n\nLimites de pressão: 25-30 PSI (Warning), 8-25 PSI (Normal), 0-7 PSI (Caution).\n\nO alerta FUEL LOW pode disparar com 90kg por razões dinâmicas (atitude de nariz elevado) ou mecânicas (falha em Ejector Unit ou Boost Pumps). Abaixo de 10kg, o voo lateral ou pairado com vento cruzado deve ser evitado por risco de 'unporting' (descobertura) da bomba.",
      keyPoints: [
        "Monitoramento da pressão de combustível (faixa 8-25 PSI)",
        "Diagnóstico de falso alerta de 90kg",
        "Evitar voo lateral abaixo de 10kg de combustível",
        "Lógica de alimentação da direita para a esquerda",
      ],
      imageDescriptions: [
        "Interface de indicação de combustível no EICAS",
        "Diagrama de diagnóstico para FUEL LOW",
      ],
      indications: [
        "FUEL LOW",
        "FUEL PRESS",
        "F LOW FAIL",
        "25-30 PSI (Warning)",
        "8-25 PSI (Normal)",
        "0-7 PSI (Caution)",
      ],
    },
    {
      id: "fail_sistema_efis",
      title: "FAIL SISTEMA EFIS",
      icon: "Monitor",
      objective:
        "Procedimentos de falha em telas de voo (EFIS).",
      content:
        "Procedimento crítico:\n1. Voar a aeronave — transição imediata para ESIS.\n2. Navegação e potência baseada em indicações puras de atitude, altitude e velocidade.\n3. Diagnóstico e checklist.\n\nA reversão manual no RCP (Reconfiguration Panel) restaura a tela apagada utilizando o processador do lado oposto. Falha de AHRS degrada a automação (AFCS desengaja), exigindo voo manual com referências visuais externas.",
      keyPoints: [
        "Transferência imediata do scan para o ESIS",
        "Uso do Painel RCP para reversão de telas",
        "Voo manual em caso de AHRS fail",
        "Uso de referências externas na perda de automação",
      ],
      imageDescriptions: [
        "Painel de Reconfiguração (RCP)",
        "Esquema de reversão ADU/AHRS",
      ],
      indications: [
        "ADC 1/2 FAIL",
        "AHRS FAIL",
        "DG",
        "LOI / LON",
      ],
    },
    {
      id: "mau_funcionamento",
      title: "MAU FUNCIONAMENTO",
      icon: "AlertTriangle",
      objective:
        "Procedimentos para mau funcionamento durante acionamento, falhas do SAS e do sistema hidráulico.",
      chapters: [
        {
          id: "mf_durante_acionamento",
          title: "DURANTE ACIONAMENTO",
          content:
            "Monitorar limites críticos: 10s ignição, 30s estagnação, 17V bateria. Abortar se ITT > 870°C (2 seg), falha de pressão de óleo ou ruídos anormais. Procedimento de limpeza (Dry Motoring Run) obrigatório após aborto com ITT > 100°C.",
          keyPoints: [
            "Aborto de partida por ITT, pressão de óleo ou elétrica",
            "Dry Motoring Run para resfriar turbina",
            "Monitoramento de limites críticos (10s/30s/17V)",
          ],
          imageDescriptions: [
            "Matriz de decisão de partida do motor",
            "Fluxograma de limpeza a seco (Dry Motoring Run)",
            "Matriz de diagnóstico dinâmico do motor",
          ],
          indications: [
            "ENG OIL PRESS",
            "ITT > 870°C",
            "N1 < 51% (30 seg)",
          ],
        },
        {
          id: "mf_sas",
          title: "SAS",
          content:
            "Em caso de falha do SAS (Stability Augmentation System), limitar V < 75 KIAS e ROC (Rate of Climb) < 750 ft/min. O SAS fornece estabilidade e amortecimento de atitude; sua perda degrada a suavidade de voo mas não impede a operação manual.",
          keyPoints: [
            "Restrição de envelope: V < 75 KIAS",
            "Limitação de razão de subida: < 750 ft/min",
            "Voo manual com atenção redobrada à estabilidade",
          ],
          imageDescriptions: [
            "Indicação de falha SAS no EFIS",
          ],
          indications: [
            "SAS FAIL",
            "1 SAS OFF / 2 SAS OFF",
          ],
        },
        {
          id: "mf_sistema_hidraulico",
          title: "SISTEMA HIDRÁULICO",
          content:
            "Perda de pressão < 1200 PSI aciona alerta 1 ou 2 SERVO. Envelope restrito: V < 90 KIAS, Bank < 25°. O sistema hidráulico fornece assistência aos controles de voo; sua falha exige voo manual dentro do envelope restrito.",
          keyPoints: [
            "Restrição de envelope em falha hidráulica",
            "V < 90 KIAS, Bank < 25°",
            "Manter voo estável após falha hidráulica",
          ],
          imageDescriptions: [
            "Diagrama do sistema hidráulico e alertas SERVO",
          ],
          indications: [
            "1 SERVO / 2 SERVO",
            "HYD PSI < 1200",
          ],
        },
      ],
    },
    {
      id: "panes_rotor_cauda",
      title: "PANES ROTOR DE CAUDA",
      icon: "Wind",
      objective:
        "Diagnóstico de travamento e perda de eficiência do rotor de cauda.",
      content:
        "Diagnóstico rápido: reduzir velocidade para 60 KIAS, voo reto e nivelado.\n\n'LUCKY LEFT': pedal esquerdo ou próximo ao neutro — condição mais favorável.\n'ROTTEN RIGHT': pedal direito travado — condição crítica.\n\nAlerta máximo: evitar manobras com vento de través pela direita, pois isso destrói a autoridade direcional restante. Tratar links quebrados como 'ROTTEN RIGHT'.",
      keyPoints: [
        "Identificação de travamento de pedal (Esquerdo vs Direito)",
        "Pouso com 60 KIAS",
        "Evitar manobras agressivas e vento de direita",
        "Tratar links quebrados como 'Rotten Right'",
      ],
      imageDescriptions: [
        "Diagrama de diagnóstico de travamento de pedal",
        "Ilustração de restrições de manobra",
      ],
      indications: [
        "LUCKY LEFT",
        "ROTTEN RIGHT",
      ],
    },
    {
      id: "controle_automatico_motor",
      title: "CONTROLE AUTOMÁTICO DO MOTOR (ECC/MEC)",
      icon: "Cog",
      objective:
        "Modos de controle de potência — EEC, MEC e MAN.",
      content:
        "Falhas no EEC/MEC podem resultar em oscilação de N1/ITT ou perda de N2/NR.\n\nEEC Fails resulta em reversão automática para operação Mecânica (MEC). Sintoma: o NR pode variar.\n\nAção: ajustar cíclico/coletivo; usar trim de NR no coletivo. Alvo: definir NR 97% no MPOG. Se incontrolável, manter N1 > 51% e pousar.",
      keyPoints: [
        "Reconhecimento de modos EEC, MEC e MAN",
        "Ajuste manual de NR em caso de falha do EEC",
        "Proteção contra overtorque via guarda deslizante MAN/NOR",
        "Controle manual de torque em modo MEC",
      ],
      imageDescriptions: [
        "Comparativo entre modos de governança de potência",
        "Diagrama de controle de combustível (EEC/MEC/MAN)",
      ],
      indications: [
        "EEC FAIL",
        "MEC OPN",
        "EEC DEGRADED",
        "PLA POS",
      ],
    },
    {
      id: "falhas_motor",
      title: "FALHAS DO MOTOR",
      icon: "Siren",
      objective:
        "Falhas operacionais críticas do motor — pressão de óleo e contaminação.",
      content:
        "Inclui falhas de pressão de óleo e contaminação (CHIPS).\n\nAlertas de CHIPS (ENG AGB CHIPS / ENG RGB CHIPS) exigem redução imediata de potência e pouso.\n\nLógica de pressão de óleo: faixa amarela (40-80 PSI) pede atitude nivelada; faixa vermelha (< 40 PSI) é aviso crítico.\n\n'HIGH SIDE' (ROTOR HIGH): subir coletivo e cíclico à frente para frear o NR.",
      keyPoints: [
        "Redução imediata de potência em caso de partículas metálicas (CHIPS)",
        "Monitoramento estrito de pressão de óleo",
        "Reação imediata a sobrerrotação (ROTOR HIGH)",
        "Uso do sistema Chip Burner antes de pouso (se permitido)",
      ],
      imageDescriptions: [
        "Matriz de alerta de falha de óleo",
        "Fluxograma operacional CHIPS (Chip Burner)",
      ],
      indications: [
        "ENG AGB CHIPS",
        "ENG RGB CHIPS",
        "ENG OIL PRESS (Yellow/Red)",
        "ROTOR HIGH",
        "ROTOR LOW",
      ],
    },
    {
      id: "autorrotacao",
      title: "AUTORROTAÇÃO",
      icon: "Gauge",
      objective:
        "Procedimentos e técnicas de voo em autorrotação.",
      content:
        "Abaixar coletivo imediatamente (NR 98-102%). Cíclico para trás aumenta NR; para frente diminui NR.\n\nPlaneio máximo: 100 KIAS / 90% NR.\nPlaneio reduzido: 60 KIAS / 105% NR.\n\nFlare a 150 pés, iniciando alinhamento dos esquis e mantendo atitude de 5° de cabrada no toque.",
      keyPoints: [
        "Estabilização imediata da NR após falha",
        "Uso do cíclico para gestão fina da NR",
        "Flare a 150 pés",
        "Manter esquis alinhados e pitch ≤ 5° no toque",
      ],
      imageDescriptions: [
        "Perfil de autorrotação (Glide Path)",
        "Diagrama de dinâmica de rotor de baixa inércia",
      ],
      indications: [
        "NR 98-102% (Faixa aceitável)",
        "100 KIAS (Planeio máximo)",
        "60 KIAS (Planeio reduzido)",
        "150 ft (Gate de Flare)",
      ],
    },
  ],
};