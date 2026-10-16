// PROCEDIMENTOS NORMAIS — AW119Kx Koala
// Transcrição organizada dos PDFs 01_COCKPIT (29 p.) e 02_ACIONAMENTO (31 p.)
// do material de instrução técnica, organizada em 6 tópicos.
//
// Ressalvas: conteúdo de instrução didática — parâmetros operacionais não
// confirmados contra publicações oficiais (RFM/RFMS) permanecem com aviso.
// Não substitui o RFM, o checklist aprovado ou a documentação do operador.

export const DIDATIC_NOTICE =
  "Material didático de instrução. Não substitui o RFM, RFMS, QRH, checklist aprovado, manual do fabricante, documentação operacional do operador ou orientação de instrutor qualificado.";

export const RESSALVA_NAO_OFICIAL =
  "Conteúdo transcrito do material de instrução — pendente de confirmação contra publicação oficial aplicável à configuração da aeronave.";

export const PROC_NORMAIS = {
  id: "procedimentos_normais",
  name: "PROCEDIMENTOS NORMAIS",
  subtitle:
    "Transcrição organizada dos materiais de instrução: cockpit e displays Genesys IDU-680, procedimentos de acionamento do PT6B-37A, testes pós-acionamento e manobras normais.",
  premium: true,
  sources: [
    { label: "01_COCKPIT — Guia de Manobras e Procedimentos VFR (29 págs.)", url: "https://media.base44.com/files/public/6abbcee2e405be8f7f7ba4ef/7a41c63ed_01_COCKPIT.pdf" },
    { label: "02_ACIONAMENTO — Operações de Pré-Partida e Acionamento (31 págs.)", url: "https://media.base44.com/files/public/6abbcee2e405be8f7f7ba4ef/884c7d529_02_ACIONAMENTO.pdf" },
  ],
  modules: [
    // ==========================================================
    // TÓPICO 1 — COCKPIT
    // ==========================================================
    {
      id: "cockpit",
      title: "Cockpit",
      icon: "Plane",
      objective:
        "O escritório: layout, ergonomia da cabine, painéis, consoles e comandos de voo do AW119Kx.",
      chapters: [
        {
          id: "ck_layout",
          title: "O Escritório: Layout e Ergonomia da Cabine",
          source: "01_COCKPIT · p.3",
          blocks: [
            { type: "text", content: "A arquitetura de controle é dividida em quatro zonas de interação primária:" },
            { type: "list", items: [
              "Console Superior (Overhead): reúne controles elétricos essenciais e disjuntores posicionados estrategicamente acima da tripulação.",
              "Console do Painel de Instrumentos: o centro visual. Concentra as telas primárias de voo (Genesys) e parâmetros do motor.",
              "Console Inferior Dianteiro: focado em comandos de áudio/comunicação, sensores (AHRS) e ajustes de navegação.",
              "Console Inferior Traseiro: gerenciamento vital de combustível, controles do sistema automático de voo (Helipilot/AFCS) e testes.",
            ]},
          ],
        },
        {
          id: "ck_anatomia_painel",
          title: "Anatomia do Painel de Instrumentos",
          source: "01_COCKPIT · p.4",
          blocks: [
            { type: "list", items: [
              "PFD e MFD (dupla instalação Genesys IDU-680).",
              "MWL / MCL — Luzes Mestras: Alerta (vermelha) e Cautela (amarela).",
              "PBAs — Push Button Annunciators: acesso rápido e avisos de sistema periférico.",
              "STANDBY ESIS (EFD-750): instrumento de voo digital de backup independente.",
              "RELÓGIO CENTRAL: cálculos rápidos de navegação e tempo de voo.",
            ]},
          ],
        },
        {
          id: "ck_console_superior",
          title: "Console Superior: Distribuição Elétrica e Sistemas",
          source: "01_COCKPIT · p.5",
          blocks: [
            { type: "text", content: "Painel Superior — Disjuntores (Circuit Breakers), organizados fisicamente por barramentos para rápido reconhecimento tátil:" },
            { type: "list", items: [
              "Topo: Barramento AC (Corrente Alternada).",
              "Meio: Barramento DC Main (Corrente Contínua Principal).",
              "Base: Barramento de Emergência e Bateria.",
            ]},
            { type: "text", content: "Painel Inferior — Interruptores (Switches & Rheostats):" },
            { type: "list", items: [
              "Iluminação: controles internos (CKPT, OVHD) e externos (POS, A-COLL, STROBE).",
              "Controles Ambientais & Equipamentos: ar condicionado, limpadores e aquecedores.",
              "Matriz Elétrica (canto direito): gerenciamento crítico de Inversores (INV 1/2), Gerador (GEN), Bateria (BAT) e Barramentos (BUS).",
            ]},
          ],
        },
        {
          id: "ck_consoles_inferiores",
          title: "Consoles Inferiores: Navegação, AFCS e Combustível",
          source: "01_COCKPIT · p.6",
          blocks: [
            { type: "text", content: "Console Inferior Dianteiro (Front):" },
            { type: "list", items: [
              "ICS & Áudio: painéis de controle de intercomunicação.",
              "Navegação: painel AHRS e seletor de modo do Flight Director (FD).",
              "Segurança/Missão: interruptor ELT e controle do Guincho (Hoist).",
              "Conforto: ventilação de ar fresco.",
            ]},
            { type: "text", content: "Console Inferior Traseiro (Aft):" },
            { type: "list", items: [
              "Helipilot (AFCS): painel de controle do sistema automático de voo e indicadores de posição do atuador (API).",
              "Combustível: gerenciamento das bombas (PUMP 1, PUMP 2, XFER) e válvula de corte (Shut-Off).",
              "Sistema & Testes: painel de reconfiguração (RCP), gerador de alertas sonoros (AWG) e painel de testes (FCU/Fogo).",
            ]},
          ],
        },
        {
          id: "ck_softkeys",
          title: "Interface Híbrida: Softkeys e Console Superior",
          source: "01_COCKPIT · p.26",
          blocks: [
            { type: "list", items: [
              "[M] Botão Menu — a porta de entrada: pressione para remover a proa e abrir a janela de menu. Toques sucessivos navegam pelo Loop do Menu. Pode ser segurado como atalho de brilho.",
              "[S] Botão Select — ação e confirmação: usado como botão 'Enter' após um ajuste ou como comando direto de realinhamento.",
              "[v]/[^] Botões de Ajuste — decremento e incremento: usados para navegar em listas ou definir parâmetros (brilho, valores barométricos).",
            ]},
            { type: "text", content: "AUX GEN Cluster: BUS TIE (conecta o gerador auxiliar aos barramentos), RESET (rearma a AUX GCU após uma falha) e TEST (inicia autoteste — segurar por 2 seg)." },
            { type: "text", content: "ELEC Cluster: switches para INV 1/2, BUS, GEN RESET e BATT. Operação normal: INV 1 e 2 devem estar ON." },
          ],
        },
        {
          id: "ck_ciclico",
          title: "Interface de Voo: Comandos do Manche Cíclico",
          source: "01_COCKPIT · p.27",
          blocks: [
            { type: "text", content: "O controle direcional (arfagem e rolagem) possui operação convencional HOTAS (Hands On Throttle And Stick):" },
            { type: "list", items: [
              "FTR (Force Trim Release): libera momentaneamente os freios magnéticos do cíclico e dos pedais, permitindo reposicionamento sem esforço.",
              "MSTR RST: botão crítico que reseta alertas sonoros do AWG e apaga luzes master (MWL/MCL).",
              "Gatilho ICS/Rádio: 1º estágio para intercomunicador interno; 2º estágio para transmissão externa de rádio.",
              "BEEP TRIM (seletor): realiza ajustes finos direcionais na atitude quando o modo ATT do AFCS está engajado.",
              "Missão especial: botões de alijamento de carga (Cargo Rel) e corte do guincho (Hoist Cut).",
            ]},
          ],
        },
        {
          id: "ck_coletivo",
          title: "O Coletivo: Ergonomia e Switchology Diferenciada",
          source: "01_COCKPIT · p.28",
          blocks: [
            { type: "list", items: [
              "Seletor NR TRIM",
              "Twist Grip (potência)",
              "Switches de iluminação (Landing/Searchlight)",
              "START Switch (acionamento)",
              "Seletor EEC/MEC",
              "Seletor MAN/NOR",
            ]},
            { type: "text", content: "Design Modular: o coletivo do copiloto possui um anel de travamento e desconexão elétrica rápida, projetado para remoção imediata em operações single-pilot." },
          ],
        },
        {
          id: "ck_pedais",
          title: "Pedais Antitorque: Ajuste Ergonômico de Precisão",
          source: "01_COCKPIT · p.29",
          blocks: [
            { type: "list", items: [
              "Ajuste Longitudinal (Knob): gire o botão texturizado central em qualquer direção para deslizar todo o conjunto de pedais mecanicamente para frente ou para trás, adequando o alcance da perna.",
              "Ajuste de Altura do Pé: mova o pino de retenção do pedal para selecionar uma das três posições verticais. Puxe para frente para elevar; empurre para baixo para reduzir a altura do calcanhar.",
            ]},
          ],
        },
      ],
    },

    // ==========================================================
    // TÓPICO 2 — GRÁFICOS
    // ==========================================================
    {
      id: "graficos",
      title: "Gráficos",
      icon: "Monitor",
      objective:
        "Domínio operacional do EFIS Genesys: PFD, MFD, zonas táticas de leitura e gestão de telas.",
      chapters: [
        {
          id: "gr_efis",
          title: "Domínio Operacional do EFIS Genesys",
          source: "01_COCKPIT · p.7",
          blocks: [
            { type: "text", content: "A função exclusiva do EFIS é MOSTRAR a informação. Ele recebe dados brutos do helicóptero, aplica cores, faixas de limite e desenha o ambiente 3D." },
            { type: "list", items: [
              "PFD (Primary Flight Display): foco no voo e navegação. Apresenta o Primary Flight Indications (PFI) no topo e o Navigation Display (ND) na base.",
              "MFD (Multi-Function Display): foco nos sistemas. Apresenta o Engine Indication Crew Alerting System (EICAS), pressão/temperatura e CAS.",
            ]},
          ],
        },
        {
          id: "gr_zonas",
          title: "O Big Picture: Lendo por Zonas Táticas",
          source: "01_COCKPIT · p.8",
          blocks: [
            { type: "list", items: [
              "Zona de Navegação 3D: horizonte, SVS, flight path.",
              "Zona de Energia: airspeed, tendências.",
              "Zona de Altitude: altímetro, BARO.",
              "Zona Direcional: bússola, heading, track, slip.",
            ]},
            { type: "note", content: "Não decore 20 itens isolados. Condicione seus olhos a buscar grupos de informação simultânea." },
          ],
        },
        {
          id: "gr_mfd",
          title: "Gestão de Telas: A Versatilidade do MFD",
          source: "01_COCKPIT · p.9",
          blocks: [
            { type: "text", content: "A arquitetura do Central Display System (CDS) permite que o piloto reconfigure a visualização de acordo com a carga de trabalho:" },
            { type: "list", items: [
              "1. Half Engine & HSI",
              "2. Half Engine & MAP",
              "3. Full Engine — monitoramento de potência",
              "4. Essential — reversão de segurança",
            ]},
          ],
        },
        {
          id: "gr_full_half",
          title: "Gestão de Espaço no MFD: Full vs. Half Engine Format",
          source: "01_COCKPIT · p.10",
          blocks: [
            { type: "text", content: "FULL ENGINE FORMAT:" },
            { type: "list", items: [
              "Capacidade Visual: exibe o EICAS completo ocupando todo o painel.",
              "Localização de Dados: combina dados primários (N1, TOT, TRQ) e secundários (óleo, elétrica, combustível).",
              "Capacidade de Alertas (CAS): suporta até 17 linhas de alerta na janela lateral.",
            ]},
            { type: "text", content: "HALF ENGINE FORMAT:" },
            { type: "list", items: [
              "Capacidade Visual: libera a base da tela para navegação tática (HSI/MAP).",
              "Localização de Dados: dados primários migram automaticamente para o PFD; o MFD exibe apenas dados secundários essenciais.",
              "Capacidade de Alertas (CAS): formato reduzido suportando até 12 linhas.",
            ]},
          ],
        },
        {
          id: "gr_nav_map",
          title: "MFD em Detalhe: Sobreposição Tática (Nav & Map)",
          source: "01_COCKPIT · p.11",
          blocks: [
            { type: "list", items: [
              "Método Superior — HSI: a rosa dos ventos correlaciona direção (Heading/Track) com as marcações de destino (FMS2). Compactação essencial para rota.",
              "Método Inferior — Mapa Tático: visão topográfica (Nav Display). Ao fundir o mapa espacial na configuração Half Engine, o piloto reduz drasticamente o movimento ocular entre instrumentos independentes.",
            ]},
          ],
        },
      ],
    },

    // ==========================================================
    // TÓPICO 3 — EICAS / CAS
    // ==========================================================
    {
      id: "eicas_cas",
      title: "EICAS / CAS",
      icon: "AlertTriangle",
      objective:
        "Sistema de indicação de motor e alertas de tripulação: alertas críticos, FLTA, redundâncias e instrumentos standby.",
      chapters: [
        {
          id: "ec_alertas_criticos",
          title: "Alertas Críticos do Sistema: O Que Vejo, O Que Escuto",
          source: "01_COCKPIT · p.12",
          blocks: [
            { type: "text", content: "AIRSPEED — o que vejo: IAS ultrapassa a linha sólida vermelha; a caixa digital da velocidade torna-se vermelha sólida. O que escuto: aviso vocal contínuo e premente 'AIRSPEED, AIRSPEED'." },
            { type: "text", content: "MINIMUMS — o que vejo: descida abaixo da altitude alvo inserida no bug; a fita e a altitude passam a piscar em âmbar/amarelo. O que escuto: aviso vocal de alerta 'MINIMUMS, MINIMUMS'." },
          ],
        },
        {
          id: "ec_flta_cone",
          title: "O Cone Dinâmico: Entendendo a Lógica do FLTA",
          source: "01_COCKPIT · p.19",
          blocks: [
            { type: "text", content: "Forward Looking Terrain Awareness — o FLTA constrói um cone de varredura preditiva à frente da aeronave:" },
            { type: "list", items: [
              "Velocidade no Solo (GS): define a profundidade (Range). Varredura padrão de 36 segundos à frente (24s no Modo Low Altitude).",
              "Bank Angle (>10°): o cone expande e curva na direção do voo. Requer sustentação por 3,25s para evitar alarmes em turbulência.",
              "Velocidade Vertical: molda a base do cone (RTC). Em descidas maiores que -500 fpm, o envelope afunda para proteger contra impactos.",
            ]},
          ],
        },
        {
          id: "ec_flta_zonas",
          title: "FLTA: Evitação Preditiva de Terreno",
          source: "01_COCKPIT · p.20",
          blocks: [
            { type: "text", content: "ZONA 1 — CAUTION (Cuidado):" },
            { type: "list", items: [
              "Condição: obstáculo detectado nos limites iniciais.",
              "Painel: texto TERRAIN ou OBSTRUCTION em âmbar.",
              "Áudio: 'Caution Obstruction'.",
            ]},
            { type: "text", content: "ZONA 2 — WARNING (Aviso Imediato):" },
            { type: "list", items: [
              "Condição: ameaça iminente à trajetória de voo.",
              "Painel: texto vermelho piscante.",
              "Áudio: 'Warning Obstruction'.",
            ]},
          ],
        },
        {
          id: "ec_popup",
          title: "Comportamento Autônomo: O Modo Popup",
          source: "01_COCKPIT · p.21",
          blocks: [
            { type: "text", content: "Gatilho: ameaça entra no envelope FLTA no IDU #1. Ações automáticas do EFIS:" },
            { type: "list", items: [
              "1. Display de Navegação: a área inferior muda forçadamente para a tela de mapa.",
              "2. Orientação Forçada: aeronave centralizada na tela e fixada em modo Heading Up.",
              "3. Bloqueio de Funções: a função de rolagem (Panning) é desativada temporariamente.",
              "4. Auto-Zoom Dinâmico: se GS > 100 kts, escala de 5 NM; se GS ≤ 100 kts, escala de 2 NM.",
            ]},
            { type: "note", content: "Dica operacional: o botão RESET (L5) surge por 20 segundos. Com um toque, restaura a configuração anterior de tela após resolver a ameaça." },
          ],
        },
        {
          id: "ec_declutter",
          title: "Lógica de Declutter Automático: O Basic-T",
          source: "01_COCKPIT · p.22",
          blocks: [
            { type: "text", content: "Gatilhos: se Arfagem (Pitch) > ±30° OU se Inclinação (Bank) > 65°." },
            { type: "text", content: "Ação (lista de exclusão): o Genesys desliga agressivamente o SVS. Corta perspectiva 3D, obstáculos, Highway in the Sky e o Trend Noodle." },
            { type: "text", content: "Resultado (modo degradado): a tela reverte para o Basic-T (fundo azul/marrom simples)." },
            { type: "text", content: "O porquê: para combater a desorientação espacial severa. Em atitudes extremas, abstrações 3D tornam-se sedutoras e confusas; o sistema força o foco apenas em nivelar as asas. Permanece ativo até a aeronave retornar a 10° do horizonte." },
          ],
        },
        {
          id: "ec_esis",
          title: "ESIS: A Última Linha de Defesa",
          source: "01_COCKPIT · p.23",
          blocks: [
            { type: "text", content: "Arquitetura 100% segregada para sobrevivência operacional:" },
            { type: "list", items: [
              "Alimentação elétrica dedicada ou de emergência.",
              "Sistema Pitot-Static dedicado.",
              "Sensores de atitude, giroscópios e acelerômetros internos próprios.",
            ]},
            { type: "text", content: "Dados fornecidos na falha total: Atitude, Altitude, Velocidade, Razão Vertical e Proa (Heading)." },
          ],
        },
        {
          id: "ec_standby",
          title: "Redundância Crítica: Instrumentos Standby",
          source: "01_COCKPIT · p.24",
          blocks: [
            { type: "list", items: [
              "STANDBY ESIS (EFD-750): instrumento de voo de backup isolado. Opera independentemente de falhas no EFIS primário.",
              "RELÓGIO DIGITAL M803 & OAT: sondas isoladas e energia independente. Exibe Volts, OAT e cronômetros de voo vitalícios.",
            ]},
            { type: "note", content: "Mensagem tática: informação vital é garantida mesmo na ausência total do ecossistema primário." },
          ],
        },
        {
          id: "ec_backup_dau",
          title: "Redundância de Informação: EICAS Backup e Falhas DAU",
          source: "02_ACIONAMENTO · p.29",
          blocks: [
            { type: "text", content: "Indicação de falha: CAS amarelo MISCOMP-P + aparecimento de asterisco (*) ao lado do parâmetro digital." },
            { type: "steps", items: [
              "Abrir página completa EICAS no MFD do lado afetado para localizar a discrepância.",
              "Pressionar botão EICAS BACKUP no painel PBA para cruzar a leitura visual com o segundo canal DAU.",
              "Comparar valores apresentados. Manter regime de voo conservador.",
              "Avaliar a necessidade de pouso baseando-se na criticidade do parâmetro em divergência.",
            ]},
          ],
        },
      ],
    },

    // ==========================================================
    // TÓPICO 4 — ACIONAMENTO
    // ==========================================================
    {
      id: "acionamento",
      title: "Acionamento",
      icon: "Cog",
      objective:
        "Operações de pré-partida e acionamento: configuração da cabine, inicialização, testes críticos e sequência de partida do PT6B-37A.",
      chapters: [
        {
          id: "ac_checklist_cabine",
          title: "Checklist de Sistemas: Configuração da Cabine",
          source: "02_ACIONAMENTO · p.2",
          blocks: [
            { type: "table", headers: ["Comando", "Resposta Esperada"],
              rows: [
                ["BATT VOLTS", "Mínimo 24V (atenção <17V após start)"],
                ["EXTERNAL POWER", "Conectar (certificar 28V)"],
                ["INV 1 e 2", "OFF (não tem restrição ON)"],
                ["BAT – GEN BUS", "ON"],
                ["GEN e GEN AUX", "OFF"],
                ["AHRS / SAS / ATT HOLD / AUTO TRIM", "Verificar ligados (SAS 1 e 2 OFF)"],
              ]},
            { type: "note", content: "Regra de ouro: a energia garante os sensores. Nunca inicie testes se a bateria indicar menos de 24V ou se a alimentação externa oscilar." },
          ],
        },
        {
          id: "ac_inicializacao",
          title: "Lógica de Inicialização de Software",
          source: "02_ACIONAMENTO · p.3",
          blocks: [
            { type: "steps", items: [
              "Energização: telas Genesys Aero Systems exibem INITIALIZING.",
              "Sistemas de hardware iniciam: telas exibem TESTING.",
              "Sensores críticos normais? (GPS, ADC, AHRS) — SIM: exibe telas de voo imediatamente. NÃO: inicia cronômetro de 2 minutos (WAITING FOR SENSOR DATA).",
            ]},
            { type: "note", content: "Ação do piloto: pressionar qualquer botão ENC (1, 2 ou 3) interrompe a inicialização em solo. O ENC ④ controla apenas o brilho." },
          ],
        },
        {
          id: "ac_mfd_acionamento",
          title: "Configuração do MFD para Acionamento",
          source: "02_ACIONAMENTO · p.4",
          blocks: [
            { type: "list", items: [
              "PFD: inicia em PFI (topo) + MAP (base).",
              "MFD: inicia em HALF ENGINE. Precisa expansão!",
            ]},
            { type: "text", content: "Fluxo de ação obrigatório:" },
            { type: "steps", items: [
              "Pressionar R5 (ESSNTL).",
              "Pressionar o Codificador ①.",
              "Girar Codificador ① e selecionar FULL ENGINE.",
              "Confirmar CAS e parâmetros.",
            ]},
          ],
        },
        {
          id: "ac_baro",
          title: "Configuração Inicial: Calibração de Altímetro (BARO)",
          source: "02_ACIONAMENTO · p.5",
          blocks: [
            { type: "steps", items: [
              "Ativar: pressione o softkey BARO (R2).",
              "Ajustar: rotacione o Encoder ① até atingir o ajuste QNH correto.",
              "Confirmar: pressione o Encoder ① para fixar o valor, ou pressione EXIT (R1) para sair.",
            ]},
            { type: "note", content: "O ajuste barométrico é o parâmetro mais crítico antes da decolagem. Verifique sempre a consistência entre o PFD primário e os instrumentos de standby." },
          ],
        },
        {
          id: "ac_audio_radio",
          title: "Consciência de Comunicação: Página Áudio/Rádio (AR)",
          source: "02_ACIONAMENTO · p.6",
          blocks: [
            { type: "list", items: [
              "Painel centralizado: interface comum para status de até 14 dispositivos. Sempre aparece na área inferior (Bottom Area) quando configurado.",
              "Softkey IDENT: pop-up automático (aparece apenas se o transponder estiver operante).",
              "Integração HDG: o menu AR não sobrepõe funções vitais; o bug de proa permanece acessível.",
            ]},
          ],
        },
        {
          id: "ac_prestart_eletrica",
          title: "Matriz de Pré-Start: Elétrica e MFD (itens 14–20)",
          source: "02_ACIONAMENTO · p.7",
          blocks: [
            { type: "table", headers: ["Item", "Comando", "Ação"],
              rows: [
                ["14", "BAT – GEN BUS", "ON — mover para ligado"],
                ["15", "GEN e GEN AUX", "OFF — ambos desligados"],
                ["16", "PITOT 1 e 2", "OFF — ambos desligados"],
                ["17", "PFD – MFD", "VERIFICAR — conferir os PBA"],
                ["18", "Mensagens CAS", "VERIFICAR — verificar todas e anular os avisos MWL e MCL"],
                ["19", "Volts da bateria", "24 Volts — mínimo 24V. Após STARTER, atenção <17V"],
                ["20", "Alimentação externa", "CONECTAR — se necessário, certifique-se de 28 Volts"],
              ]},
          ],
        },
        {
          id: "ac_prestart_testes",
          title: "Matriz de Pré-Start: Chaves de Teste Críticas (itens 21–29)",
          source: "02_ACIONAMENTO · p.8",
          blocks: [
            { type: "table", headers: ["Item", "Comando", "Ação"],
              rows: [
                ["21", "AWG switch / TEST switch", "TESTE/ON — pressione TEST e segure = TEST OK. Pressione AWG e segure = alarmes sonoros (13)"],
                ["22", "FCU/Fogo TEST switch", "TESTE/ON — segure em FCU/FIRE = alerta sonoro ENG FIRE; FUEL LOW (indic. zero) / WARNING (vermelho) / CAUTION (amarelo). Solte e normalizam. Segure LAMP: as lâmpadas de avisos/alertas acendem"],
                ["23", "ENG HTR switch", "ON — mover para ligado"],
                ["24", "A-COLL lights switches", "ON — mover para ligado"],
                ["25", "IGN switch", "AUTO — mover para AUTO"],
                ["26", "EEC/MEC TEST switch", "TESTE/ON — alternar MEC e EEC = aviso sonoro EEC FAIL, EEC DEGRADED e MEC OPN. MEC OPN exibido no final e abaixo de 30% NR. PLA POS no CAS"],
                ["27", "Fuel Valve — shut-off", "ABERTA — posição aberta, guarda coloca, luz verde acesa"],
                ["28", "PUMP 1 e 2 / XFER PUMP", "TESTE/ON — teste pressão PUMP, todas ON. Apenas PUMP-1"],
                ["29", "ALTIMETER", "Ajustar — QNH do local"],
              ]},
          ],
        },
        {
          id: "ac_5_testes",
          title: "Procedimentos Obrigatórios: Os 5 Testes Críticos",
          source: "02_ACIONAMENTO · p.9–14",
          blocks: [
            { type: "text", content: "1. THROTTLE (Manete) — move de OFF → IDLE → FLT → MAX. Retorna a OFF. Confere MAN/NORMAL." },
            { type: "text", content: "2. AWG — segure botão TEST (TEST OK) → segure botão AWG. 13 alarmes sonoros." },
            { type: "text", content: "3. FCU/FIRE (crítico) — segure em FCU/FIRE. Avisos acendem e indicadores zeram na tela. ENG FIRE + FUEL LOW sonoro." },
            { type: "text", content: "4. EEC/MEC — alternar entre MEC e EEC. Mensagens aparecem: EEC FAIL / DEGRADED." },
            { type: "text", content: "5. PUMP — teste de pressão da PUMP 1 e 2. Ambas chaves em ON. Apenas PUMP-1 exibe pressão." },
            { type: "text", content: "Detalhe dos testes:" },
            { type: "list", items: [
              "Twist Grip: girar horário até IDLE, depois FLIGHT (FLT/NOR); mover trava para MAN e girar até o fim do curso livre (MAX/MAN); girar anti-horário fechando totalmente até IDLE, livrar a trava e fechar (OFF/NOR); retornar a trava superior para NOR. Atenção: o retorno para NOR é essencial para impedir aceleração excessiva involuntária do motor.",
              "AWG (modos): NORM — todas as mensagens habilitadas (estado padrão). REGRADE — desativa apenas a mensagem 'One hundred fifty feet'. TEST — toque curto: fone emite 'Aural warning ok'; manter > 5 segundos: executa sequência completa de mensagens sonoras.",
              "FCU (teste bem-sucedido vs. com falha): Áudio — alarme sonoro de dois tons (sucesso) vs. único alarme (falha). Avisos MCL/MWL — acendem e apagam automaticamente ao final (sucesso) vs. MCL permanece piscando (falha). Display CAS — limpa ENG FIRE e FUEL LOW (sucesso) vs. surge FUEL LOW (falha). Texto CAS — padrão branco/preto (sucesso) vs. muda para preto/amarelo com FUEL LOW FAIL ao final (falha).",
              "EEC/MEC: alternar o interruptor na sequência EEC → MEC → EEC. Mensagens: 1. EEC FAIL + tom sonoro; 2. EEC DEGRADED; 3. MEC OPN (aparece no final = teste de sucesso). Verificar se a mensagem PLA POS é reativada no final do teste.",
              "Bombas (4 fases): Fase 1 — baseline: ligar PUMP 1, PUMP 2 e XFER PUMP, verificar pressão na faixa verde. Fase 2 — teste bomba 2: desligar PUMP 1, observar pressão mantida pela PUMP 2 (> 3,5 psi). Fase 3 — teste bomba 1: ligar PUMP 2 e desligar PUMP 1, verificar pressão dentro dos limites. Fase 4 — restabelecimento: ligar PUMP 1 e confirmar que a pressão inicial combinada foi restabelecida no manômetro.",
            ]},
            { type: "note", content: "Nota do instrutor: a mensagem FUEL LOW isolada nunca aparece em voo devido ao teste — em voo surge FUEL LOW FAIL. Se FUEL LOW surgir em voo, é uma emergência real." },
          ],
        },
        {
          id: "ac_postura",
          title: "Postura e Posição de Controles Durante a Partida",
          source: "02_ACIONAMENTO · p.15",
          blocks: [
            { type: "list", items: [
              "COLETIVO — afinação mínima: totalmente em baixo, passo plano. Garante o menor arrasto aerodinâmico enquanto o motor ganha torque.",
              "CÍCLICO — estritamente centralizado: evite QUALQUER movimento na alavanca abaixo de 85% NR. Pequenos movimentos permitidos apenas para evitar o batimento físico do mast.",
              "PEDAIS — alinhados e pareados: sempre repousando pareados (neutros), bloqueando injeção não intencional de demanda no rotor de cauda.",
            ]},
            { type: "warning", content: "Nota de segurança obrigatória: a manete de estrangulamento (THROTTLE) deve ser checada e mecanicamente travada fisicamente em 'OFF' antes das mãos tocarem os botões de inicialização." },
          ],
        },
        {
          id: "ac_sequencia",
          title: "Sequência de Acionamento (Strict Sequence)",
          source: "02_ACIONAMENTO · p.16",
          blocks: [
            { type: "steps", items: [
              "Verificar ITT (<100°C). Se >100°C: Dry Motoring.",
              "STARTER (pressione e solte). Atenção: após acionar o STARTER, a voltagem não pode cair abaixo de 17V.",
              "MENSAGENS CAS: ENG START / IGNITER ON ativos.",
              "THROTTLE (IDLE): aos 12% N1, abrir manete.",
              "MONITORAR! Em 10s: luzes devem apagar, N1 subindo, ITT em elevação.",
              "ESTABILIZAÇÃO: N1 a 61 ± 1%. ITT e óleo normais.",
              "DESCONECTAR GPU.",
              "LIGAR AVNX GEN.",
              "LIGAR GEN SWITCH.",
              "ACELERAR: throttle para FLT (102% N2/NR).",
            ]},
          ],
        },
        {
          id: "ac_clima_frio",
          title: "Operação em Clima Frio: Comportamentos Esperados",
          source: "02_ACIONAMENTO · p.17",
          blocks: [
            { type: "list", items: [
              "N1 em marcha lenta baixo (entre 51% e 61%): aguardar 3 min de aquecimento em solo. Se continuar baixo: adicionar +3 minutos. Se não atingir 61% após o 2º ciclo, investigar (falha real).",
              "Óleo do motor (alta pressão): picos acima de 110 PSI são efeitos normais e transitórios da alta viscosidade. Retornará ao normal com o calor. Com óleo < 10°C, mantenha sempre a manete em IDLE.",
              "Óleo da transmissão (XMSN): se o óleo da transmissão estiver a 0°C enquanto o motor está pronto, avance a manete suavemente para FLT. Avisos de baixa pressão no painel são aceitáveis transitoriamente apenas se a indicação térmica (temperatura) estiver na faixa verde.",
            ]},
          ],
        },
        {
          id: "ac_n1_itt",
          title: "Parâmetros de N1 e ITT na Partida",
          source: "02_ACIONAMENTO · p.18",
          blocks: [
            { type: "text", content: "Marcadores de N1 na partida: 43,3% — 51,0% — 61,1%. Marcadores de ITT: 870°C — 980°C — 1090°C." },
            { type: "table", headers: ["Faixa de ITT", "Significado"],
              rows: [
                ["Até 870°C", "Operação normal"],
                ["870°C a 980°C", "Tempo máximo: 10 segundos"],
                ["980°C a 1090°C", "Limite transitório — tempo máximo: 2 segundos"],
                ["> 1090°C", "ABORTAR PARTIDA IMEDIATAMENTE"],
              ]},
            { type: "warning", content: "Regra crítica de segurança: ENG START / IGNITER ON apagados. Se o ITT e o N1 não subirem dentro de 10 segundos após a manete em IDLE: aborte imediatamente." },
            { type: "note", content: "Ressalva: os valores de ITT de partida (870/980/1090°C) coincidem com os limites do RFM (Pub. 502051481) já verificados na seção Limitações." },
          ],
        },
        {
          id: "ac_abort",
          title: "Interrupção Imediata da Partida",
          source: "02_ACIONAMENTO · p.19",
          blocks: [
            { type: "text", content: "Sequência de bloqueio do motor para interrupção imediata da partida: fechar a manete (throttle) para OFF e confirmar mensagens CAS de shutdown." },
            { type: "text", content: "Após o acionamento e estabilização na condição de voo, aplicar a fase de testes dos sistemas (ver tópico Checks pós-acionamento):" },
            { type: "steps", items: [
              "Sistema de combustível",
              "Sistema hidráulico",
              "Droop Compensator — EEC/MEC",
              "Sistema Helipilot — SAS",
              "Sistema elétrico — inversores",
              "RCP (painel de controle de reversão) *",
              "Flight Director *",
              "EICAS backup *",
              "Comm/Nav *",
              "Auxiliary Generator *",
              "Pitot Heat",
            ]},
            { type: "note", content: "* Procedimentos aplicados apenas para o modelo KXi." },
          ],
        },
      ],
    },

    // ==========================================================
    // TÓPICO 5 — CHECKS PÓS-ACIONAMENTO
    // ==========================================================
    {
      id: "checks_pos",
      title: "Checks pós-acionamento",
      icon: "Settings",
      objective:
        "Testes de sistemas após o acionamento e estabilização: filosofia, combustível, hidráulico, EEC/MEC, SAS, inversores, RCP, Flight Director, Comm/Nav e Pitot Heat.",
      chapters: [
        {
          id: "cp_filosofia",
          title: "A Filosofia do Teste de Sistemas",
          source: "02_ACIONAMENTO · p.20",
          blocks: [
            { type: "list", items: [
              "Ação FÍSICA: interação com botões e switches mecânicos.",
              "Confirmação VISUAL: leitura imediata dos painéis MFD/PFD e alertas CAS.",
              "Interpretação COGNITIVA: entendimento da redundância e garantia da autoridade de comando.",
            ]},
            { type: "note", content: "O objetivo da fase pós-acionamento não é apenas cumprir itens de checklist, mas garantir a integridade dos aviônicos, atestar redundâncias críticas e assegurar total autoridade sobre a aeronave antes da decolagem." },
          ],
        },
        {
          id: "cp_combustivel",
          title: "Sistema de Combustível: Validação de Bombas e Pressão",
          source: "02_ACIONAMENTO · p.21",
          blocks: [
            { type: "steps", items: [
              "Switch PUMP/XFER = OFF.",
              "A pressão de combustível cai a zero.",
              "Aguardar 5 segundos. Observe que não há alteração no funcionamento do motor.",
              "Retornar XFER e PUMP 1 para ON. A pressão normaliza.",
              "Em seguida, PUMP 2 ON.",
            ]},
            { type: "text", content: "Confirmação visual: painel FUEL (PSI, QTY), mensagens CAS esperadas para 1-2 FUEL PUMP, FUEL PRESS e XFER PUMP." },
          ],
        },
        {
          id: "cp_hidraulico",
          title: "Sistema Hidráulico: Resposta Tátil e Limites de Pressão",
          source: "02_ACIONAMENTO · p.22",
          blocks: [
            { type: "list", items: [
              "SERVO em NORM: pressionar FTR. Movimentar cíclico, pedais e coletivo. Regra de ouro: queda de pressão não pode exceder 70 psi.",
              "SERVO 2 OFF: pressionar FTR e repetir a varredura. Sem aumento de força ou descontinuidade de curso. Queda máxima de 70 psi.",
              "SERVO 1 OFF: cíclico e coletivo normais. Atenção: os pedais estarão rígidos/resistentes (isolados ao Servo 1). Ao retornar a chave para ON, é normal ouvir um som de atrito resultante do restabelecimento hidráulico.",
            ]},
          ],
        },
        {
          id: "cp_eec_mec",
          title: "Unidade de Controle: Teste EEC / MEC",
          source: "02_ACIONAMENTO · p.23",
          blocks: [
            { type: "steps", items: [
              "Posição MEC: mover chave EEC para MEC. Alerta CAS amarelo MEC OPN. Espera-se variação de potência mecânica. Verifique NR estabilizado em 97%. Ajuste com a chave NR TRIM no coletivo, se necessário.",
              "Posição EEC: retornar chave para EEC. Alerta MEC OPN apaga. Verifique NR estabilizado em 102%. A chave NR TRIM agora deve estar eletronicamente inoperante.",
            ]},
            { type: "warning", content: "Alerta de sistema: se a Rotação Nominal (NR) for < 30%, o aviso MEC OPN aparecerá no painel independentemente da posição física da chave." },
          ],
        },
        {
          id: "cp_sas",
          title: "Helipilot (SAS): Calibração de Comandos",
          source: "02_ACIONAMENTO · p.24",
          blocks: [
            { type: "text", content: "Acoplamento (ON): ligar SAS 1 e 2. Avisos CAS SAS 1 e 2 e 1 SAS OFF e 2 SAS OFF devem apagar. Com a chave ATTD HOLD em OFF, o sistema gera o alerta ATT OFF." },
            { type: "text", content: "Teste físico de movimento: deslocar o manche cíclico 1 polegada (eixos lateral/longitudinal). Confirmar o movimento simultâneo dos indicadores gráficos de Pitch e Roll no painel API. Mover pedais sutilmente e confirmar movimento da barra de Yaw." },
            { type: "text", content: "Desarme e auto-arme: desligar SAS 1. Mover cíclico. Desligar SAS 2. Observar que a chave ATTD HOLD se arma automaticamente para ON na falha, e o alerta ATT OFF é suprimido pelo sistema." },
          ],
        },
        {
          id: "cp_inversores",
          title: "Energia AC: Tolerância a Falhas nos Inversores",
          source: "02_ACIONAMENTO · p.25",
          blocks: [
            { type: "steps", items: [
              "Passo 1: verificar tensão base da aeronave — 115 ± 5 VAC.",
              "Passo 2: desligar fisicamente o INV-1. Avisos esperados no EICAS: INV-1 OFF e possivelmente SAS-1 OFF. Confirmação cognitiva: verificar se o INV-2 sozinho assume a carga, mantendo voltagem (115V) e amperagem dentro dos limites, sem instabilidade.",
              "Passo 3: retornar chaves INV-1 e SAS-1 para ON.",
              "Passo 4: repetir o teste diagnosticando simetricamente o comportamento do INV-2.",
            ]},
          ],
        },
        {
          id: "cp_rcp",
          title: "Painel de Controle de Reversão (RCP): Matriz de Teste",
          source: "02_ACIONAMENTO · p.26",
          blocks: [
            { type: "table", headers: ["Sistema (botão)", "Posição 1 ou 2", "Posição NORM"],
              rows: [
                ["ADU (Air Data)", "CAS amarelo: SAME ADC. PFD: checar Airspeed, Altitude e IVSIs (0±50 ft/min).", "Aviso apaga."],
                ["AHRS (Attitude/Heading)", "CAS amarelo: SAME AHRS. PFD: checar atitudes e rumos alternadamente.", "Aviso apaga."],
                ["GPS (Nav Source)", "PFD: mostra FMS 1 ou 2. CAS amarelo: SAME GPS e SAME NAV. FMS 1 no PFD Copiloto; FMS 2 no PFD Piloto.", "—"],
              ]},
          ],
        },
        {
          id: "cp_fd_lateral",
          title: "Flight Director: Modos Básicos e Lateral (HDG)",
          source: "02_ACIONAMENTO · p.27",
          blocks: [
            { type: "steps", items: [
              "Standby / iluminação: segurar botão SBY e FD STBY (no cíclico). Verificar todos iluminados. Testar DECOUPL e confirmar alerta CAS DECPLED FD.",
              "Sincronização: sincronizar o Bug de referência com o rumo atual.",
              "Ativação HDG: com SAS 1/2 e ATTD HOLD ON, ativar HDG. Bug muda para Magenta e rótulo HDG surge sobre o ADI.",
              "Teste físico: girar Bug HDG máx 3° para cada lado. Confirmar no painel API que os atuadores de rotação acompanham fisicamente a instrução.",
            ]},
          ],
        },
        {
          id: "cp_fd_vertical",
          title: "Flight Director: Modos Verticais (VS / GA) e Intervenção",
          source: "02_ACIONAMENTO · p.28",
          blocks: [
            { type: "text", content: "Modo VS (Vertical Speed): ativar chave AUTOTRIM em ON; ativar VS no painel; selecionar VS +500 pés; o indicador muda para cor Magenta." },
            { type: "text", content: "Modo GA (Go Around): pressionar GA; confirmar indicações de PITCH e ROLL nas barras de comando; mover coletivo e confirmar setas; desativar no FD STBY." },
            { type: "warning", content: "Movimentos repentinos do cíclico: mudanças excessivas no HDG ou VS causam aumento na amplitude do cíclico, inclinando o rotor bruscamente. O piloto deve estar fisicamente preparado para segurar o comando, pressionar FD STBY no punho ou selecionar AUTOTRIM OFF / DECOUPL no painel." },
          ],
        },
        {
          id: "cp_comm_nav",
          title: "Verificação Comm/Nav e Dados de Voo",
          source: "02_ACIONAMENTO · p.30",
          blocks: [
            { type: "text", content: "Lado esquerdo (Piloto): switch EMER selecionada; verificar transmissão/recepção no COM 2; verificar áudio do NAV 2." },
            { type: "text", content: "Lado direito (Copiloto): switch EMER selecionada; verificar transmissão/recepção no COM 1; verificar áudio do NAV 1." },
            { type: "text", content: "Validação de displays (PFD & Standby):" },
            { type: "list", items: [
              "Visão Sintética: confirmar GPS válido.",
              "Standby: atitude, rumo, altitude e velocidade válidos.",
              "PFD: alinhamento correto e parâmetros de motor sem anomalias visuais.",
            ]},
          ],
        },
        {
          id: "cp_dc_pitot",
          title: "Energia DC e Pitot Heat: Teste Dinâmico (Timeline)",
          source: "02_ACIONAMENTO · p.31",
          blocks: [
            { type: "table", headers: ["Fase", "O que acontece"],
              rows: [
                ["0–3 segundos (ação músculo)", "Segurar botão TEST. Alertas DC GEN e BATT DISCH ativos. Leitura no painel: 24VDC (fonte: Bateria)."],
                ["3–6 segundos (transição)", "BATT DISCH apaga. Fonte lógica muda para AUX GEN. Leitura: 26–28 VDC."],
                ["Finalização (término)", "Soltar botão TEST. DC GEN apaga. Fonte lógica indica GEN. Leitura: ~28VDC estabilizado."],
              ]},
            { type: "text", content: "Teste conectado — tubo de pitot: ligar PITOT 1 e 2 no painel AC/DC; verificar visualmente o pico de corrente no medidor do gerador; confirmar surgimento dos alertas 1 PITOT HTR e 2 PITOT HTR (nota: indica falha do sistema se continuarem acesos após as chaves serem desligadas). Em seguida, desligar ambos." },
          ],
        },
      ],
    },

    // ==========================================================
    // TÓPICO 6 — MANOBRAS NORMAIS
    // ==========================================================
    {
      id: "manobras",
      title: "Manobras normais",
      icon: "Navigation",
      objective:
        "Transição tática, voo pairado, leitura de deriva e visão sintética: execução das manobras normais com o IDU-680.",
      chapters: [
        {
          id: "mn_30_nos",
          title: "Transição Tática e a Regra dos 30 Nós",
          source: "01_COCKPIT · p.13",
          blocks: [
            { type: "list", items: [
              "Estrela Magenta: indica a direção mais curta para a curva.",
              "Worm (indicador de curva): marcação de curva padrão ou meia curva padrão.",
            ]},
            { type: "text", content: "Regra de ouro do voo pairado — o limite de 30 nós:" },
            { type: "note", content: "O Track Pointer (ponteiro de trajeto) NÃO é exibido quando a velocidade de solo (ground speed) cai para menos de 30 nós. Compreender essa omissão do software é fundamental para a transição de consciência situacional para o voo pairado." },
          ],
        },
        {
          id: "mn_visao_deus",
          title: "A Visão de Deus: Transição para o Foco Tático",
          source: "01_COCKPIT · p.14",
          blocks: [
            { type: "text", content: "O problema — foco interno: abaixo de 30 nós, as referências visuais tradicionais e as indicações pitot/estáticas degradam severamente. O PFD básico foca na atitude interna, mas o risco de desorientação espacial dispara em whiteout/brownout." },
            { type: "text", content: "A solução — IDU-680 Hover Page: o MFD constrói uma consciência situacional completa em 360 graus. Ele consolida deriva (drift), aceleração e altitude AGL em uma única área de varredura visual. Uma autêntica 'visão de Deus' para controle milimétrico do ambiente externo." },
          ],
        },
        {
          id: "mn_hover_page",
          title: "Arquitetura da Página de Hover",
          source: "01_COCKPIT · p.15",
          blocks: [
            { type: "list", items: [
              "Orientação Absoluta: a página está sempre configurada em 'Heading-up' (proa para cima).",
              "Referência do Helicóptero (Ownship): fixado apontando para cima.",
              "Painel Direito (AGL): termômetro de precisão para controle vertical.",
              "Rosa dos Ventos: alinhada com o Norte Magnético ou Verdadeiro.",
            ]},
            { type: "note", content: "Nota do instrutor: o layout foi projetado especificamente para minimizar o movimento ocular durante manobras de alta carga de trabalho. Faça o scan no centro." },
          ],
        },
        {
          id: "mn_pairado",
          title: "Execução do Pairado e a Lógica de Deriva",
          source: "01_COCKPIT · p.16",
          blocks: [
            { type: "list", items: [
              "12 horas: voo estrito à frente.",
              "3 ou 9 horas: deriva lateral pura (risco crítico de toque dinâmico no solo).",
              "6 horas: voo a ré (atenção crítica à cauda).",
            ]},
            { type: "text", content: "Step 1 — Antecipação (o diamante): voe o diamante magenta. Ele prevê a tendência de inércia. Pare o diamante no centro, e a aeronave irá parar na sequência." },
            { type: "text", content: "Step 2 — Ancoragem (ponto branco): alinhe a âncora de 0 nós (ponto branco) com a caixa vazada do waypoint." },
            { type: "text", content: "Step 3 — Leitura de deriva (ponto cinza): caixa de segurança do software — restrição do sistema: o movimento do ponto cinza é estrangulado a um máximo de 5 nós por segundo. Isso atua como um filtro contra turbulências, impedindo que o piloto persiga o ponto erraticamente." },
          ],
        },
        {
          id: "mn_ponto_cinza",
          title: "Dinâmica de Voo e a Leitura do Ponto Cinza",
          source: "01_COCKPIT · p.17",
          blocks: [
            { type: "list", items: [
              "Ponto às 12 horas: voo estrito à frente. Sem deriva lateral indesejada.",
              "Ponto às 3 horas: deriva lateral pura. Risco crítico de toque dinâmico de esqui ou roda no solo.",
              "Ponto às 9 horas: voo a ré (rearward flight). Exige atenção absoluta à cauda e obstáculos traseiros.",
            ]},
          ],
        },
        {
          id: "mn_svs",
          title: "Renderização de Destino em Visão Sintética (SVS)",
          source: "01_COCKPIT · p.18",
          blocks: [
            { type: "text", content: "Pistas de pouso (Runways): desenhadas em 3D considerando a elevação real do terreno. O sistema oculta ativamente superfícies que estariam bloqueadas por relevo (como montanhas à frente) e renderiza precisamente as thresholds deslocadas na zona de pouso." },
            { type: "text", content: "Helipontos (Helipads): representados no MFD como helipads virtuais de 150' x 150'. As marcações claras e dimensionadas oferecem alvos cruciais para confirmar aproximações verticais seguras em ambientes noturnos ou de baixa visibilidade (IIMC), desprovidos de referência externa." },
          ],
        },
      ],
    },
  ],
};