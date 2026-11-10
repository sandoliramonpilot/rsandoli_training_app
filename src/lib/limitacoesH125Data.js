// LIMITAÇÕES E PARÂMETROS — AS350 B2 (VEMD) e AS350 B3e (FADEC Arriel 2D)
// Material transcrito dos PDFs "Limitações" fornecidos (AS350 B2 e AS350 B3),
// organizado para consulta rápida operacional.
//
// Status de cada parâmetro:
//   "pending"  → valor transcrito do PDF; pendente de validação técnica contra
//                 o RFM oficial aplicável à configuração.
//
// Não substitui o RFM, QRH ou manual do fabricante. Onde há discrepância não
// verificável, o valor do PDF é mantido e marcado como "pending".

export const PENDING_VALIDATION_H125 =
  "Material transcrito da fonte fornecida, pendente de validação técnica aeronáutica. Não substitui o RFM oficial, que deve permanecer a bordo.";

export const SOURCE_PDF_H125_B2 =
  "PDF Limitações AS350 B2 — Checklist de Bolso (Cmte Deccache)";
export const SOURCE_PDF_H125_B3 =
  "PDF Limitações AS350 B3 — Checklist de Bolso (Cmte Deccache)";

export const PDF_URL_H125_B2 =
  "https://base44.app/api/apps/6abbcee2e405be8f7f7ba4ef/files/mp/public/6abbcee2e405be8f7f7ba4ef/bcc9fa8e8_5cd5da027_LIMITACOES_AS350B2.pdf";
export const PDF_URL_H125_B3 =
  "https://base44.app/api/apps/6abbcee2e405be8f7f7ba4ef/files/mp/public/6abbcee2e405be8f7f7ba4ef/1bcd7587e_c00996832_LIMITACOES_AS350B3.pdf";

export const H125_LIMITACOES_VARIANTS = {
  B2: {
    id: "B2",
    label: "AS350 B2 (VEMD)",
    subtitle:
      "Limitações operacionais do AS350 B2 — motor Arriel 1D1 com VEMD.",
    sourcePdf: PDF_URL_H125_B2,
    sourceLabel: SOURCE_PDF_H125_B2,
    modules: [
      {
        id: "pesos_cg",
        title: "Pesos e Centro de Gravidade",
        icon: "Plane",
        objective: "Limites de peso e envelope de centro de gravidade.",
        chapters: [
          {
            id: "b2_pesos",
            title: "Pesos",
            objective: "Limites de peso para decolagem e compartimentos.",
            parameters: [
              { name: "Máx. decolagem com carga interna", value: "2.250 kg", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Bagageiro direito", value: "100 kg", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Bagageiro esquerdo", value: "120 kg", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Bagageiro traseiro", value: "80 kg", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Piso traseiro da cabine", value: "310 kg", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Piso dianteiro esquerdo", value: "150 kg", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
            ],
          },
          {
            id: "b2_cg",
            title: "Centro de Gravidade",
            objective: "Plano de referência e limites longitudinal e lateral.",
            parameters: [
              { name: "Plano de referência", value: "3,4 m à frente do RP", kind: "info", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Longitudinal", value: "3,17 a 3,50 m", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Lateral — direito", value: "0,14 m", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Lateral — esquerdo", value: "0,18 m", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
            ],
          },
        ],
      },
      {
        id: "velocidades",
        title: "Velocidades",
        icon: "Gauge",
        objective: "VNE e velocidades operacionais, incluindo configuração de portas.",
        chapters: [
          {
            id: "b2_vne",
            title: "VNE e Velocidades Operacionais",
            objective: "Limites de velocidade indicada.",
            parameters: [
              { name: "VNE com potência", value: "155 kt", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2, condition: "−3 kt / 1.000 ft acima do nível do mar" },
              { name: "VNE sem potência", value: "125 kt", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Máxima em autorrotação", value: "125 kt", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Máxima com carga externa", value: "80 kt", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Limpador do para-brisa", value: "100 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
            ],
          },
          {
            id: "b2_portas",
            title: "Limites por Configuração de Portas",
            objective: "VNE conforme configuração de portas instaladas/removidas/abertas.",
            parameters: [
              { name: "Portas Standard em ambos os lados", value: "110 kt (ou VNE*)", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2, remarks: "Portas instaladas ou removidas." },
              { name: "Porta deslizante esq. + Standard dir. — abertura", value: "110 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Porta deslizante esq. + Standard dir. — fechamento", value: "80 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Porta deslizante dir. + Standard esq. — abertura", value: "60 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Porta deslizante dir. + Standard esq. — fechamento", value: "60 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Ambas portas deslizantes — abertura", value: "60 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Ambas portas deslizantes — fechamento", value: "60 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
            ],
            notes: [
              "Configurações com porta aberta em voo podem ser VOO PROIBIDO conforme o diagrama do fabricante. Verificar o RFM para cada combinação específica de portas (esquerda/direita, instalada/removida/aberta).",
              "VNE* indica o menor valor entre o VNE da configuração e o VNE para a altitude de voo.",
            ],
          },
        ],
      },
      {
        id: "envelope",
        title: "Envelope Aprovado",
        icon: "Settings",
        objective: "Limites de altitude, temperatura e operação sob neve.",
        chapters: [
          {
            id: "b2_envelope",
            title: "Envelope de Operação",
            objective: "Teto, temperatura e condições de neve.",
            parameters: [
              { name: "Teto / Altitude-Pressão", value: "20.000 ft", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Temperatura", value: "−40 °C a ISA +35 °C", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2, remarks: "Limitado a 50 °C." },
            ],
            table: {
              headers: ["Condição", "Visibilidade", "Operação"],
              rows: [
                ["Voo sob neve", "> 1.500 m", "Permitido"],
                ["Voo sob neve", "< 800 m", "Proibido"],
                ["Voo sob neve", "800 a 1.500 m", "Limitado a 10 min"],
              ],
            },
          },
        ],
      },
      {
        id: "rotor",
        title: "Rotor (NR) e Freio",
        icon: "Cog",
        objective: "Limitações de rotação do rotor principal e freio do rotor.",
        chapters: [
          {
            id: "b2_nr",
            title: "NR (RPM do Rotor Principal)",
            objective: "Faixas de operação e alarmes de NR.",
            parameters: [
              { name: "No solo, passo mínimo", value: "380 ± 5", kind: "info", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Operação normal", value: "375 a 394", kind: "normal", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Voo sem potência — mínimo", value: "320", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Voo sem potência — máximo", value: "430", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
            ],
            notes: [
              "Alarme sonoro: contínuo quando NR < 360; intermitente quando NR > 410.",
            ],
          },
          {
            id: "b2_freio_rotor",
            title: "Freio do Rotor",
            objective: "Limites de aplicação do freio do rotor.",
            parameters: [
              { name: "Mínimo para frenagem", value: "140", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Máximo para frenagem", value: "170", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Intervalo entre duas aplicações", value: "5 min", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Tempo para a parada", value: "25 seg", kind: "info", status: "pending", source: SOURCE_PDF_H125_B2 },
            ],
          },
        ],
      },
      {
        id: "motor",
        title: "Motor",
        icon: "Cog",
        objective: "Limitações de potência (FLI), torque, Nf, NG e T4.",
        chapters: [
          {
            id: "b2_fli",
            title: "FLI / PMC (Potência)",
            objective: "Limites de potência indicada (FLI).",
            parameters: [
              { name: "PMC", value: "9,6", kind: "normal", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Faixa de potência de decolagem", value: "9,6 a 10", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Potência máxima de decolagem", value: "10", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Potência máxima transitória", value: "10,4", kind: "transient", status: "pending", source: SOURCE_PDF_H125_B2, condition: "5 seg" },
            ],
          },
          {
            id: "b2_torque",
            title: "Torque",
            objective: "Limites de torque do motor.",
            parameters: [
              { name: "Máximo contínuo", value: "94%", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Regime de decolagem", value: "94% a 100%", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Máximo transitório", value: "107%", kind: "transient", status: "pending", source: SOURCE_PDF_H125_B2, condition: "5 seg" },
            ],
          },
          {
            id: "b2_nf",
            title: "Nf (RPM da Turbina Livre)",
            objective: "Limites de rotação da turbina livre (Nf).",
            parameters: [
              { name: "Mínima", value: "330", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Faixa transitória", value: "330 a 375", kind: "transient", status: "pending", source: SOURCE_PDF_H125_B2, condition: "≤ 5 seg" },
              { name: "Faixa normal", value: "375 a 417", kind: "normal", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Máxima contínua", value: "417", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Faixa transitória (acima do máximo)", value: "417 a 463", kind: "transient", status: "pending", source: SOURCE_PDF_H125_B2, condition: "≤ 5 seg" },
            ],
          },
          {
            id: "b2_ng",
            title: "NG (Gerador de Gases)",
            objective: "Limites de rotação do gerador de gases (NG).",
            parameters: [
              { name: "Mínimo estabilizado", value: "67%", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Máximo contínuo", value: "98% / ΔNg −4%", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Regime de decolagem", value: "ΔNg −4% a 0%", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2, condition: "≤ 5 min" },
              { name: "Máximo transitório", value: "103,1% / ΔNg +1%", kind: "transient", status: "pending", source: SOURCE_PDF_H125_B2, condition: "≤ 5 seg" },
              { name: "Máximo de decolagem", value: "101,9% / ΔNg 0%", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
            ],
          },
          {
            id: "b2_t4",
            title: "T4 (Temperatura Interturbina)",
            objective: "Limites de temperatura interturbina (T4).",
            parameters: [
              { name: "Máximo contínuo — partida", value: "795 °C", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Máximo transitório — partida", value: "865 °C", kind: "transient", status: "pending", source: SOURCE_PDF_H125_B2, condition: "≤ 5 seg" },
              { name: "Máximo contínuo — voo", value: "795 °C", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Regime de decolagem", value: "795 °C a 845 °C", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Máximo de decolagem", value: "845 °C", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Máximo transitório (voo)", value: "870 °C", kind: "transient", status: "pending", source: SOURCE_PDF_H125_B2, condition: "5 seg" },
            ],
          },
        ],
      },
      {
        id: "sistemas",
        title: "Sistemas",
        icon: "Settings",
        objective: "Óleo do motor, combustível e sistema elétrico.",
        chapters: [
          {
            id: "b2_oleo_temp",
            title: "Temperatura do Óleo do Motor",
            objective: "Limites de temperatura do óleo do motor.",
            parameters: [
              { name: "Faixa de atenção", value: "−10 °C a 0 °C", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Mínima antes de aplicar potência", value: "0 °C", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Máxima", value: "115 °C", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
            ],
          },
          {
            id: "b2_oleo_pressao",
            title: "Pressão do Óleo do Motor",
            objective: "Limites de pressão do óleo do motor conforme NG.",
            parameters: [
              { name: "Mínima", value: "1,3 bar", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2, condition: "NG entre 70% e 85%" },
              { name: "Faixa normal", value: "1,8 a 5 bar", kind: "normal", status: "pending", source: SOURCE_PDF_H125_B2, condition: "NG > 85%" },
              { name: "Faixa de atenção (baixa)", value: "1,3 a 1,8 bar", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Faixa de atenção (alta)", value: "> 5 bar", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
            ],
          },
          {
            id: "b2_combustivel",
            title: "Bombas de Combustível",
            objective: "Limites de pressão das bombas de combustível.",
            parameters: [
              { name: "Faixa de atenção", value: "0 a 0,4 bar", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
            ],
          },
          {
            id: "b2_eletrico",
            title: "Sistema Elétrico",
            objective: "Limites de tensão, corrente e autonomia da bateria.",
            parameters: [
              { name: "Tensão máxima", value: "31,5 V", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Corrente máxima", value: "+150 A", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Arranque do gerador", value: "28,5 V", kind: "info", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Bateria", value: "24 V", kind: "info", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Fonte externa", value: "28,5 V", kind: "info", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Capacidade da bateria sem gerador", value: "50 min (dia) / 20 min (noite)", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B2 },
            ],
          },
          {
            id: "b2_starter",
            title: "Starter Gerador",
            objective: "Ciclos de acionamento do starter gerador.",
            parameters: [
              { name: "Tentativa 1", value: "30 seg ligado / 60 seg desligado", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Tentativa 2", value: "30 seg ligado / 60 seg desligado", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Após 2 tentativas", value: "30 seg ligado / 30 min desligado", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
            ],
          },
        ],
      },
      {
        id: "declividade",
        title: "Declividade para Pouso",
        icon: "Plane",
        objective: "Limites de inclinação para pouso em superfícies irregulares.",
        chapters: [
          {
            id: "b2_declividade",
            title: "Limites de Inclinação",
            objective: "Inclinação máxima para pouso.",
            parameters: [
              { name: "Nariz para cima", value: "10°", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Nariz para baixo", value: "6°", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
              { name: "Lateral", value: "8°", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B2 },
            ],
          },
        ],
      },
    ],
  },
  B3: {
    id: "B3",
    label: "AS350 B3e (FADEC Arriel 2D)",
    subtitle:
      "Limitações operacionais do AS350 B3e — motor Arriel 2D com FADEC.",
    sourcePdf: PDF_URL_H125_B3,
    sourceLabel: SOURCE_PDF_H125_B3,
    modules: [
      {
        id: "pesos_cg",
        title: "Pesos e Centro de Gravidade",
        icon: "Plane",
        objective: "Limites de peso e envelope de centro de gravidade.",
        chapters: [
          {
            id: "b3_pesos",
            title: "Pesos",
            objective: "Limites de peso para decolagem e compartimentos.",
            parameters: [
              { name: "Máx. decolagem com carga interna", value: "2.250 kg", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Mín. decolagem com carga interna", value: "1.310 kg", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Bagageiro direito", value: "100 kg", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Bagageiro esquerdo", value: "120 kg", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Bagageiro traseiro", value: "80 kg", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Piso traseiro da cabine", value: "310 kg", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Piso dianteiro esquerdo", value: "150 kg", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
            ],
          },
          {
            id: "b3_cg",
            title: "Centro de Gravidade",
            objective: "Plano de referência e limites longitudinal e lateral.",
            parameters: [
              { name: "Plano de referência", value: "3,4 m à frente do RP", kind: "info", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Longitudinal", value: "3,17 a 3,498 m", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Lateral — direito", value: "0,14 m", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Lateral — esquerdo", value: "0,18 m", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
            ],
          },
        ],
      },
      {
        id: "velocidades",
        title: "Velocidades",
        icon: "Gauge",
        objective: "VNE e velocidades operacionais, incluindo configuração de portas.",
        chapters: [
          {
            id: "b3_vne",
            title: "VNE e Velocidades Operacionais",
            objective: "Limites de velocidade indicada.",
            parameters: [
              { name: "VNE com potência", value: "155 kt", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3, condition: "−3 kt / 1.000 ft acima do nível do mar" },
              { name: "VNE sem potência", value: "125 kt", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Máxima em autorrotação", value: "125 kt", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Máxima com carga externa", value: "80 kt", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Limpador do para-brisa", value: "100 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Máxima para pouso corrido", value: "40 kt", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
            ],
          },
          {
            id: "b3_portas",
            title: "Limites por Configuração de Portas",
            objective: "VNE conforme configuração de portas instaladas/removidas/abertas.",
            parameters: [
              { name: "Portas Standard em ambos os lados", value: "110 kt (ou VNE*)", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3, remarks: "Portas instaladas ou removidas." },
              { name: "Porta deslizante esq. + Standard dir. — abertura", value: "110 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Porta deslizante esq. + Standard dir. — fechamento", value: "80 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Porta deslizante dir. + Standard esq. — abertura", value: "60 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Porta deslizante dir. + Standard esq. — fechamento", value: "60 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Ambas portas deslizantes — abertura", value: "60 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Ambas portas deslizantes — fechamento", value: "60 kt", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
            ],
            notes: [
              "Configurações com porta aberta em voo podem ser VOO PROIBIDO conforme o diagrama do fabricante. Verificar o RFM para cada combinação específica de portas (esquerda/direita, instalada/removida/aberta).",
              "VNE* indica o menor valor entre o VNE da configuração e o VNE para a altitude de voo.",
            ],
          },
        ],
      },
      {
        id: "envelope",
        title: "Envelope Aprovado",
        icon: "Settings",
        objective: "Limites de altitude, temperatura e operação sob neve.",
        chapters: [
          {
            id: "b3_envelope",
            title: "Envelope de Operação",
            objective: "Teto, temperatura e condições de neve.",
            parameters: [
              { name: "Teto / Altitude-Pressão", value: "23.000 ft", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Temperatura", value: "−40 °C a ISA +35 °C", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3, remarks: "Limitado a 50 °C." },
            ],
            table: {
              headers: ["Condição", "Visibilidade", "Operação"],
              rows: [
                ["Voo sob neve", "> 1.500 m", "Permitido"],
                ["Voo sob neve", "< 800 m", "Proibido"],
                ["Voo sob neve", "800 a 1.500 m", "Limitado a 10 min"],
              ],
            },
          },
        ],
      },
      {
        id: "rotor",
        title: "Rotor (NR) e Freio",
        icon: "Cog",
        objective: "Limitações de rotação do rotor principal e freio do rotor.",
        chapters: [
          {
            id: "b3_nr",
            title: "NR (RPM do Rotor Principal)",
            objective: "Faixas de operação e alarmes de NR.",
            parameters: [
              { name: "Faixas de atenção", value: "320 a 375 / 405 a 430", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Operação normal", value: "375 a 405", kind: "normal", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Voo sem potência — mínimo", value: "320", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Voo sem potência — máximo", value: "430", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
            ],
            notes: [
              "Alarme sonoro: contínuo quando NR ≥ 360; intermitente quando NR ≥ 410.",
            ],
          },
          {
            id: "b3_freio_rotor",
            title: "Freio do Rotor",
            objective: "Limites de aplicação do freio do rotor.",
            parameters: [
              { name: "Mínimo para frenagem", value: "140", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Máximo para frenagem", value: "170", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Intervalo entre duas aplicações", value: "5 min", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Tempo para a parada", value: "25 seg", kind: "info", status: "pending", source: SOURCE_PDF_H125_B3 },
            ],
          },
        ],
      },
      {
        id: "motor",
        title: "Motor",
        icon: "Cog",
        objective: "Limitações de potência (FLI), torque, N2, N1 e TOT.",
        chapters: [
          {
            id: "b3_fli",
            title: "FLI / PMC (Potência)",
            objective: "Limites de potência indicada (FLI).",
            parameters: [
              { name: "PMC", value: "9,6", kind: "normal", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Faixa de potência de decolagem", value: "9,6 a 10", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Potência máxima de decolagem", value: "10", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Potência máxima transitória", value: "10,4", kind: "transient", status: "pending", source: SOURCE_PDF_H125_B3, condition: "5 seg" },
            ],
          },
          {
            id: "b3_torque",
            title: "Torque",
            objective: "Limites de torque do motor.",
            parameters: [
              { name: "Máximo contínuo", value: "92,7%", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Regime de decolagem", value: "92,7% a 100%", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Máximo transitório", value: "104%", kind: "transient", status: "pending", source: SOURCE_PDF_H125_B3, condition: "5 seg" },
            ],
            notes: [
              "O uso de torque na faixa de decolagem não tem limite de tempo.",
            ],
          },
          {
            id: "b3_n2",
            title: "N2 (Turbina Livre)",
            objective: "Limites de rotação da turbina livre (N2).",
            parameters: [
              { name: "Mínima / Máxima contínua", value: "367 / 413", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Faixa normal", value: "367 a 413", kind: "normal", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Máxima transitória", value: "440", kind: "transient", status: "pending", source: SOURCE_PDF_H125_B3, condition: "20 seg" },
            ],
          },
          {
            id: "b3_n1",
            title: "N1 (Gerador de Gases)",
            objective: "Limites de rotação do gerador de gases (N1) no FADEC.",
            parameters: [
              { name: "Mínimo estabilizado", value: "67%", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Máximo contínuo", value: "ΔN1 −4%", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Regime de decolagem", value: "ΔN1 −4% a 0%", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Máximo transitório", value: "ΔN1 +1%", kind: "transient", status: "pending", source: SOURCE_PDF_H125_B3, condition: "≤ 20 seg" },
              { name: "Máximo de decolagem", value: "ΔN1 0%", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
            ],
          },
          {
            id: "b3_tot",
            title: "TOT (Temperatura Interturbina)",
            objective: "Limites de temperatura interturbina (TOT).",
            parameters: [
              { name: "Máximo contínuo — partida", value: "750 °C", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Máximo transitório — partida", value: "840 °C", kind: "transient", status: "pending", source: SOURCE_PDF_H125_B3, condition: "≤ 10 seg" },
              { name: "Máximo contínuo — voo", value: "905 °C", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Regime de decolagem", value: "905 °C a 949 °C", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Máximo de decolagem", value: "949 °C", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "TOT máxima transitória (voo)", value: "981 °C", kind: "transient", status: "pending", source: SOURCE_PDF_H125_B3, condition: "20 seg" },
            ],
          },
        ],
      },
      {
        id: "sistemas",
        title: "Sistemas",
        icon: "Settings",
        objective: "Óleo do motor, combustível e sistema elétrico.",
        chapters: [
          {
            id: "b3_oleo_temp",
            title: "Temperatura do Óleo do Motor",
            objective: "Limites de temperatura do óleo do motor.",
            parameters: [
              { name: "Mínima antes de aplicar potência", value: "0 °C", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Máxima", value: "117 °C", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
            ],
            notes: [
              "Os limites indicados de pressão de óleo são apresentados por faixas amarelas e vermelhas no VEMD e dependem da N1.",
            ],
          },
          {
            id: "b3_combustivel",
            title: "Combustível",
            objective: "Capacidade e alertas de combustível.",
            parameters: [
              { name: "Capacidade do tanque", value: "540 L", kind: "info", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Faixa amarela", value: "15 min de voo", kind: "caution", status: "pending", source: SOURCE_PDF_H125_B3 },
            ],
          },
          {
            id: "b3_eletrico",
            title: "Sistema Elétrico",
            objective: "Limites de tensão e corrente.",
            parameters: [
              { name: "Voltagem máxima", value: "31,5 V", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Corrente máxima", value: "+150 A", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
            ],
          },
        ],
      },
      {
        id: "declividade",
        title: "Declividade para Pouso",
        icon: "Plane",
        objective: "Limites de inclinação para pouso em superfícies irregulares.",
        chapters: [
          {
            id: "b3_declividade",
            title: "Limites de Inclinação",
            objective: "Inclinação máxima para pouso.",
            parameters: [
              { name: "Nariz para cima", value: "10°", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Nariz para baixo", value: "6°", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
              { name: "Lateral", value: "8°", kind: "limit", status: "pending", source: SOURCE_PDF_H125_B3 },
            ],
          },
        ],
      },
    ],
  },
};