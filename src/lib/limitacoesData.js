// LIMITAÇÕES E PARÂMETROS — AW119Kx Koala
// Conteúdo organizado a partir do PDF "Limitações e Parâmetros" do
// Departamento de Instrução Técnica, com valores confrontados contra
// documentação oficial (RFM — Rotorcraft Flight Manual, Publication Code 502051481).
//
// Status de cada parâmetro:
//   "confirmed"  → valor verificado contra o RFM oficial
//   "corrected"  → erro de OCR corrigido com base no RFM (ex.: "870%" → "870°C")
//   "pending"    → valor não verificado oficialmente; pendente de validação técnica
//
// Não inventar valores substitutos. Onde há discrepância não verificável,
// o valor original do PDF é mantido e marcado como "pending".

export const DIDATIC_NOTICE =
  "Material didático de treinamento. Não substitui o RFM, RFMS, QRH, checklist aprovado, manual do fabricante, documentação operacional do operador ou orientação de instrutor qualificado.";

export const PENDING_VALIDATION =
  "Valor não verificado contra documentação oficial. Pendente de validação técnica.";

export const SOURCE_RFM = "RFM — Rotorcraft Flight Manual (Pub. 502051481)";
export const SOURCE_PDF = "PDF Limitações e Parâmetros — Dept. Instrução Técnica";

// Status visual dos parâmetros
export const PARAM_STATUS = {
  confirmed: { label: "Verificado", color: "emerald", icon: "Check" },
  corrected: { label: "Corrigido", color: "sky", icon: "CheckCheck" },
  pending: { label: "Pendente", color: "amber", icon: "AlertTriangle" },
};

// Classificação visual dos limites
export const LIMIT_KIND = {
  normal: { label: "Normal", color: "emerald", dot: "bg-emerald-400" },
  caution: { label: "Atenção", color: "amber", dot: "bg-amber-400" },
  limit: { label: "Limite", color: "rose", dot: "bg-rose-400" },
  transient: { label: "Transitório", color: "sky", dot: "bg-sky-400" },
  info: { label: "Referência", color: "slate", dot: "bg-slate-400" },
};

// ============================================================
// ESTRUTURA DE MÓDULOS E CAPÍTULOS
// ============================================================
export const LIMITACOES = {
  id: "limitacoes",
  name: "LIMITAÇÕES E PARÂMETROS",
  subtitle:
    "Limitações operacionais e parâmetros técnicos do AW119Kx Koala — motor PT6B-37A, sistemas e aviônicos IDU-680.",
  premium: true,
  sourcePdf:
    "https://media.base44.com/files/public/6abbcee2e405be8f7f7ba4ef/7d080b38f_LIMITACOES_PARAMETROS.pdf",
  modules: [
    // ========================================================
    // MÓDULO 1 — ESTRUTURAIS E OPERACIONAIS
    // ========================================================
    {
      id: "estruturais_operacionais",
      title: "Estruturais e Operacionais",
      icon: "Plane",
      objective:
        "Limitações estruturais, de acionamento e de comandos do motor.",
      chapters: [
        {
          id: "lim_pouso_inclinado",
          title: "Limitações de Pouso Inclinado",
          objective:
            "Limites de inclinação da aeronave para pouso em superfícies irregulares.",
          parameters: [
            { name: "Nose UP (cabrado)", value: "12°", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Lateral", value: "10°", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Nose Down (picado)", value: "2°", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Nose Down (cauda desobstruída)", value: "5°", kind: "limit", status: "pending", source: SOURCE_PDF },
          ],
          notes: [
            "O limite mais restritivo para nose down deve-se à inclinação de 5° para frente do rotor principal, afetando margem operacional e estabilidade.",
          ],
        },
        {
          id: "lim_starter",
          title: "Limitações do Starter de Partida do Motor",
          objective:
            "Tempos máximos de acionamento e intervalos de resfriamento do starter.",
          parameters: [
            {
              name: "Na bateria — ciclo 1",
              value: "40 s ligado / 60 s desligado",
              kind: "limit",
              status: "pending",
              source: SOURCE_PDF,
              remarks: "Primeira tentativa: 40 s ligado, 60 s desligado.",
            },
            {
              name: "Na bateria — ciclo 2",
              value: "40 s ligado / 60 s desligado",
              kind: "limit",
              status: "pending",
              source: SOURCE_PDF,
              remarks: "Segunda tentativa: 40 s ligado, 60 s desligado.",
            },
            {
              name: "Na bateria — após 2 ciclos",
              value: "40 s ligado / 30 min desligado",
              kind: "limit",
              status: "pending",
              source: SOURCE_PDF,
              remarks: "Após duas tentativas, aguardar 30 minutos antes de nova partida.",
            },
            {
              name: "Energia externa — ciclo 1",
              value: "25 s ligado / 30 s desligado",
              kind: "limit",
              status: "pending",
              source: SOURCE_PDF,
            },
            {
              name: "Energia externa — ciclo 2",
              value: "25 s ligado / 30 s desligado",
              kind: "limit",
              status: "pending",
              source: SOURCE_PDF,
            },
            {
              name: "Energia externa — após 2 ciclos",
              value: "25 s ligado / 30 min desligado",
              kind: "limit",
              status: "pending",
              source: SOURCE_PDF,
              remarks: "Após duas tentativas com GPU, aguardar 30 minutos.",
            },
          ],
        },
        {
          id: "lim_twist_grip",
          title: "Ângulo da Alavanca de Potência (Twist Grip / PLA)",
          objective:
            "Posições do twist grip (PLA) medidas em graus pelo RVDT, correspondentes à alavanca de potência da FCU.",
          parameters: [
            {
              name: "FECHADA",
              value: "−5° a +5°",
              kind: "info",
              status: "pending",
              source: SOURCE_PDF,
              remarks: "Alavanca de energia da FCU na posição desligada.",
            },
            {
              name: "IDLE",
              value: "15°",
              kind: "normal",
              status: "pending",
              source: SOURCE_PDF,
              remarks: "Marcha lenta. Inicia o fluxo de combustível e permite funcionamento a 61% ± 1%.",
            },
            {
              name: "FLT",
              value: "60°",
              kind: "normal",
              status: "pending",
              source: SOURCE_PDF,
              remarks: "Posição de voo para modos automáticos. Permite governança do modo EEC (piloto pode selecionar MEC com ajuste NR TRIM).",
            },
            {
              name: "MAX",
              value: "+110° (variável de +5° a +110°)",
              kind: "limit",
              status: "pending",
              source: SOURCE_PDF,
              remarks: "Variável do desligado ao máximo (proteção deslizante no modo MAN).",
            },
          ],
          notes: [
            "PLA é o ângulo real da alavanca de potência do motor conectada à FCU, medido em graus de rotação pelo RVDT.",
          ],
        },
      ],
    },

    // ========================================================
    // MÓDULO 2 — VELOCIDADE
    // ========================================================
    {
      id: "velocidade",
      title: "Velocidade",
      icon: "Gauge",
      objective:
        "Limites de velocidade (VNE e velocidades operacionais) e indicação no IDU-680.",
      chapters: [
        {
          id: "lim_airspeed",
          title: "Airspeed Display — Indicação de Velocidade",
          objective:
            "Limites de velocidade e apresentação no EFIS IDU-680.",
          parameters: [
            { name: "VNE (com potência)", value: "152 kt", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "VNE (sem potência)", value: "125 kt", kind: "limit", status: "pending", source: SOURCE_PDF, remarks: "S/Potên = 125 kt." },
            { name: "VNE autorrotação", value: "Mín 60 kt / Máx 100 kt", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "VNE TQ 100–108,5% (decolagem)", value: "75 kt", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "VNE portas abertas", value: "85 kt", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "VNE abertura/fechamento de portas", value: "70 kt", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Velocidade pane rotor de cauda", value: "60 kt", kind: "caution", status: "pending", source: SOURCE_PDF },
            { name: "Velocidade ideal de aproximação", value: "75 kt", kind: "normal", status: "pending", source: SOURCE_PDF },
            { name: "Velocidade de maior alcance", value: "100 kt", kind: "normal", status: "pending", source: SOURCE_PDF },
            { name: "Velocidade pane hidráulico", value: "60–90 kt", kind: "caution", status: "pending", source: SOURCE_PDF },
            { name: "Velocidade de melhor razão de subida (R/S)", value: "65 kt", kind: "normal", status: "pending", source: SOURCE_PDF },
            { name: "Velocidade máxima de vento pairado", value: "20 kt", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Velocidade de menor razão de descida (R/D)", value: "80 kt", kind: "normal", status: "pending", source: SOURCE_PDF },
            { name: "Velocidade máxima de pouso corrido", value: "50 kt", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "VNEI (máxima IFR)", value: "Entre 145 kt e VNE", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "VMINI (mínima IFR)", value: "60 kt", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "VMINI APP (mínima de aproximação IFR)", value: "60 kt", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "VMAX APP (máxima de aproximação IFR)", value: "130 kt", kind: "limit", status: "pending", source: SOURCE_PDF },
          ],
          notes: [
            "A fita vertical de IAS se desloca para cima quando a velocidade aumenta e para baixo quando diminui.",
            "A leitura digital da IAS é mostrada em dígitos verdes em janela fixa no centro da fita. Quando a velocidade excede o VNE, a leitura fica vermelha e o aviso sonoro AIRSPEED é reproduzido.",
            "O vetor de tendência de velocidade (speed trend vector) é exibido como um verme magenta e mostra a IAS estimada para 5 segundos à frente.",
            "O indicador de VNE é uma linha horizontal vermelha sólida na fita, representando o VNE atual em condições AEO (All Engines Operating).",
          ],
        },
      ],
    },

    // ========================================================
    // MÓDULO 3 — MOTOR E TRANSMISSÃO
    // ========================================================
    {
      id: "motor_transmissao",
      title: "Motor e Transmissão",
      icon: "Cog",
      objective:
        "Limitações de motor (PT6B-37A) e transmissão: Nr, N2, torque, ITT e N1.",
      chapters: [
        {
          id: "lim_nr_com_pot",
          title: "Nr (RPM) com Potência",
          objective: "Limites de rotação do rotor principal com motor em potência.",
          parameters: [
            { name: "Faixa de frenagem — freio do rotor", value: "< 40%", kind: "info", status: "pending", source: SOURCE_PDF, condition: "5 minutos" },
            { name: "Mín / Máx autorrotação", value: "90% / 110%", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Faixa de atenção", value: "95% / 101%", kind: "caution", status: "pending", source: SOURCE_PDF },
            { name: "Mínima / Máxima", value: "95% / 103%", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Faixa de operação normal", value: "101% / 103%", kind: "normal", status: "pending", source: SOURCE_PDF },
          ],
        },
        {
          id: "lim_nr_sem_pot",
          title: "Nr (RPM) sem Potência",
          objective: "Limites de rotação do rotor principal sem potência (autorrotação).",
          parameters: [
            { name: "Mínima / Máxima", value: "90% / 107%", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Operação contínua", value: "90% a 110%", kind: "normal", status: "pending", source: SOURCE_PDF },
            { name: "Faixa de atenção", value: "89%", kind: "caution", status: "pending", source: SOURCE_PDF },
            { name: "Transitória", value: "80%", kind: "transient", status: "pending", source: SOURCE_PDF, condition: "10 segundos" },
          ],
        },
        {
          id: "lim_n2",
          title: "N2 (Power Turbine)",
          objective: "Limites de rotação da turbina de potência (N2).",
          parameters: [
            { name: "Mínima", value: "95%", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Faixa de atenção", value: "95% a 101%", kind: "caution", status: "pending", source: SOURCE_PDF },
            { name: "Faixa normal de operação", value: "101% a 103%", kind: "normal", status: "pending", source: SOURCE_PDF },
            { name: "Máxima contínua", value: "103%", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Faixa transiente", value: "108%", kind: "transient", status: "pending", source: SOURCE_PDF, condition: "10 segundos" },
          ],
        },
        {
          id: "lim_torque",
          title: "Torque",
          objective: "Limites de torque do motor PT6B-37A.",
          parameters: [
            { name: "Máximo contínuo", value: "100%", kind: "limit", status: "confirmed", source: SOURCE_RFM },
            { name: "Regime de decolagem", value: "100% a 108,5%", kind: "caution", status: "confirmed", source: SOURCE_RFM, condition: "Acima de 75 kt" },
            { name: "Máximo de decolagem", value: "108,5%", kind: "limit", status: "confirmed", source: SOURCE_RFM, condition: "5 minutos" },
            { name: "Máxima transiente", value: "115%", kind: "transient", status: "confirmed", source: SOURCE_RFM, condition: "6 segundos" },
          ],
          notes: [
            "Valores verificados contra o RFM (Pub. 502051481). O regime de decolagem (100–108,5%) é limitado a 5 minutos.",
          ],
        },
        {
          id: "lim_itt",
          title: "ITT — Temperatura Interturbina",
          objective:
            "Limites de temperatura interturbinas (ITT) para partida e operação normal.",
          parameters: [
            {
              name: "Máxima ilimitada (partida)",
              value: "870°C",
              kind: "limit",
              status: "corrected",
              source: SOURCE_RFM,
              remarks: "Valor original do PDF constava 870% (erro de OCR). Corrigido para 870°C conforme RFM.",
            },
            {
              name: "Transitório na partida — faixa 1",
              value: "870°C a 980°C",
              kind: "transient",
              status: "corrected",
              source: SOURCE_RFM,
              condition: "10 segundos",
              remarks: "Valores originais do PDF constavam 870%–980% (erro de OCR). Corrigidos conforme RFM.",
            },
            {
              name: "Transitório na partida — faixa 2",
              value: "980°C a 1090°C",
              kind: "transient",
              status: "corrected",
              source: SOURCE_RFM,
              condition: "2 segundos",
              remarks: "Valores originais do PDF constavam 980%–1090% (erro de OCR). Corrigidos conforme RFM.",
            },
            {
              name: "Máxima operação contínua",
              value: "755°C",
              kind: "limit",
              status: "corrected",
              source: SOURCE_PDF,
              remarks: "Valor original do PDF constava 755º (sem unidade clara). Interpretado como °C. Pendente de confirmação no RFM.",
            },
            {
              name: "Faixa de decolagem",
              value: "755°C a 810°C",
              kind: "caution",
              status: "corrected",
              source: SOURCE_PDF,
              condition: "5 minutos",
              remarks: "Valor original do PDF constava 755º–810º. Interpretado como °C. Pendente de confirmação no RFM.",
            },
            {
              name: "Limite transitório máximo (partida)",
              value: "Até 1090°C",
              kind: "limit",
              status: "confirmed",
              source: SOURCE_RFM,
              condition: "Não exceder 2 s acima de 980°C nem 10 s acima de 870°C",
            },
          ],
          notes: [
            "A ITT possui limites transitórios lineares que dependem do tempo acima dos valores de excedência. A relação é linear: permitido até 1090°C se não exceder 2 segundos acima de 980°C, e se não exceder 10 segundos acima de 870°C.",
            "Valores de partida (870°C, 980°C, 1090°C) verificados contra o RFM (Pub. 502051481). Valores de operação normal (755°C, 810°C) mantidos do PDF didático, pendentes de confirmação no RFM.",
            "Exibição: o formato de PARTIDA apresenta as limitações para a sequência de início do motor; o formato de CRUZEIRO apresenta as limitações com N1 > 51%.",
          ],
        },
        {
          id: "lim_n1",
          title: "N1 (Gerador de Gases)",
          objective: "Limites de rotação do gerador de gases (N1).",
          parameters: [
            { name: "Mínimo para estabilizar", value: "51%", kind: "caution", status: "confirmed", source: SOURCE_RFM },
            { name: "Faixa de atenção / autorrotação", value: "51% a 60%", kind: "caution", status: "confirmed", source: SOURCE_RFM, remarks: "Faixa de atenção; autorrotação somente." },
            { name: "Operação contínua", value: "60% a 100,1%", kind: "normal", status: "confirmed", source: SOURCE_RFM },
            { name: "Faixa de potência de decolagem", value: "100,1% a 103,2%", kind: "caution", status: "corrected", source: SOURCE_RFM, condition: "5 minutos", remarks: "PDF constava 100,1 a 102,2 (provável erro de OCR). RFM confirma 100,1 a 103,2." },
            { name: "Máxima de decolagem", value: "103,2%", kind: "limit", status: "corrected", source: SOURCE_RFM, condition: "5 minutos", remarks: "Corrigido com base no RFM." },
            { name: "Máxima transiente", value: "103,8%", kind: "transient", status: "confirmed", source: SOURCE_RFM, condition: "30 segundos" },
          ],
          notes: [
            "Valores verificados contra o RFM (Pub. 502051481). A faixa de decolagem foi corrigida de 102,2 para 103,2 conforme o RFM oficial.",
          ],
        },
      ],
    },

    // ========================================================
    // MÓDULO 4 — SISTEMAS
    // ========================================================
    {
      id: "sistemas",
      title: "Sistemas",
      icon: "Settings",
      objective:
        "Limitações de óleo do motor, transmissão, sistema elétrico, hidráulico e combustível.",
      chapters: [
        {
          id: "lim_oleo_motor",
          title: "Óleo do Motor",
          objective: "Limites de pressão e temperatura de óleo do motor PT6B-37A.",
          parameters: [
            { name: "Pressão — mínima", value: "40 psi", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Pressão — faixa de atenção", value: "40–80 psi", kind: "caution", status: "pending", source: SOURCE_PDF, condition: "N1 < 72%" },
            { name: "Pressão — operação contínua", value: "80–110 psi", kind: "normal", status: "pending", source: SOURCE_PDF },
            { name: "Pressão — máxima", value: "110 psi", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Temperatura — operação contínua", value: "10 a 115°C", kind: "normal", status: "pending", source: SOURCE_PDF },
            { name: "Temperatura — máxima", value: "115°C", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Temperatura — transitória", value: "127°C", kind: "transient", status: "pending", source: SOURCE_PDF, condition: "5 minutos, N1 = 61 ± 1%" },
          ],
        },
        {
          id: "lim_oleo_ctp",
          title: "Óleo da CTP (Transmissão Principal)",
          objective: "Limites de pressão e temperatura de óleo da transmissão principal.",
          parameters: [
            { name: "Pressão — mínima", value: "30 psi", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Pressão — operação contínua", value: "30–55 psi", kind: "normal", status: "pending", source: SOURCE_PDF },
            { name: "Pressão — faixa de atenção", value: "55–70 psi", kind: "caution", status: "pending", source: SOURCE_PDF },
            { name: "Pressão — máxima", value: "70 psi", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Temperatura — operação contínua", value: "0 a 115°C", kind: "normal", status: "pending", source: SOURCE_PDF },
            { name: "Temperatura — máxima", value: "115°C", kind: "limit", status: "pending", source: SOURCE_PDF },
          ],
        },
        {
          id: "lim_eletrico",
          title: "Sistema Elétrico DC",
          objective:
            "Limitações do sistema elétrico de corrente contínua (28 V).",
          parameters: [
            { name: "Tensão do sistema", value: "28 V", kind: "info", status: "pending", source: SOURCE_PDF },
            { name: "Carga mínima da bateria", value: "24 V", kind: "caution", status: "pending", source: SOURCE_PDF, remarks: "Carga mínima da bateria principal." },
            { name: "Gerador principal — operação contínua", value: "0–200 A", kind: "normal", status: "pending", source: SOURCE_PDF },
            { name: "Gerador principal — máxima", value: "200 A", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Gerador principal — transitória", value: "300 A", kind: "transient", status: "pending", source: SOURCE_PDF, condition: "5 segundos" },
            { name: "Gerador auxiliar (AUX GEN)", value: "150 A", kind: "limit", status: "pending", source: SOURCE_PDF, remarks: "Localizado abaixo do compartimento do motor, acionado pelo eixo do resfriador de óleo." },
            { name: "Bateria principal", value: "24 VDC / 28 Ah", kind: "info", status: "pending", source: SOURCE_PDF, remarks: "Ni-Cd, instalada no nariz da aeronave." },
          ],
          notes: [
            "O sistema DC opera em 28 V e é composto por: gerador de partida (starter-generator) montado na caixa de acessórios do motor; gerador auxiliar (AUX GEN); bateria principal Ni-Cd 24 VDC 28 Ah; e alimentação externa (GPU).",
            "Verificar a configuração da GPU antes da partida. Evitar fornecimento inadvertido de amperagem excessiva.",
          ],
        },
        {
          id: "lim_hidraulico",
          title: "Hidráulico / Servos",
          objective: "Limites de pressão do sistema hidráulico dos servos.",
          parameters: [
            { name: "Mínimo", value: "1200 psi", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Faixa de atenção", value: "1200–1400 psi", kind: "caution", status: "pending", source: SOURCE_PDF },
            { name: "Operação contínua", value: "1400–1550 psi", kind: "normal", status: "pending", source: SOURCE_PDF },
            { name: "Máxima", value: "1550 psi", kind: "limit", status: "pending", source: SOURCE_PDF },
            { name: "Máx. queda — teste hidráulico", value: "70 psi", kind: "caution", status: "pending", source: SOURCE_PDF },
          ],
        },
        {
          id: "lim_combustivel_pressao",
          title: "Pressão das Bombas de Combustível",
          objective: "Limites de pressão das bombas de combustível.",
          parameters: [
            { name: "Faixa de atenção", value: "0 a 7 psi", kind: "caution", status: "pending", source: SOURCE_PDF },
            { name: "Operação contínua", value: "7 a 25 psi", kind: "normal", status: "pending", source: SOURCE_PDF },
          ],
          notes: [
            "Caso a pressão na linha caia abaixo de 7 psi, ou menos de 3,5 ± 0,5 psi em cada bomba, a mensagem de aviso FUEL PRESS ou FUEL PUMP 1 / FUEL PUMP 2 será exibida.",
          ],
        },
        {
          id: "lim_combustivel_consumo",
          title: "Consumo e Capacidade de Combustível",
          objective:
            "Consumo médio e capacidade dos tanques de combustível.",
          parameters: [
            { name: "Consumo médio por hora", value: "180 kg / 230 L", kind: "info", status: "pending", source: SOURCE_PDF },
            { name: "Consumo médio por voo (flight)", value: "3 kg / 3,75 L", kind: "info", status: "pending", source: SOURCE_PDF },
            { name: "Consumo médio em idle", value: "1 kg / 1,5 L", kind: "info", status: "pending", source: SOURCE_PDF },
          ],
          notes: [
            "Conversão: 1 kg = 1,25 L | 1 L = 0,800 kg",
          ],
          table: {
            headers: ["Tanque", "Quilos", "Litros", "Total Acum. (kg/L)", "Autonomia"],
            rows: [
              ["Principal", "244", "305", "244 / 305", "1h20min"],
              ["Inferior Dir.", "120", "150", "364 / 455", "+39min"],
              ["Inferior Esq.", "120", "150", "484 / 605", "2h38min"],
              ["Auxiliar Dir.", "84", "105", "568 / 710", "3h05min"],
              ["Auxiliar Esq.", "128", "160", "696 / 874", "3h48min"],
            ],
          },
        },
      ],
    },
  ],
};