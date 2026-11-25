export const AW119_AVIONICS_SECTIONS = [
  {
    id: "genesys_idu680",
    name: "Genesys EFIS IDU-680",
    shortName: "IDU-680",
    description: "Sistema EFIS Genesys IDU-680 — Software 8.0K (Rotorcraft)",
    sourceDoc: "64-000098-080K Rev A, dez/2019",
    icon: "Monitor",
    color: "from-sky-500 to-blue-600",
    chapters: [
      {
        id: "idu680_01",
        order: 1,
        title: "Introdução ao IDU-680",
        description:
          "Filosofia pilot-centered, botões L1-L8 e R1-R8, encoders, controle de brilho, modo manutenção em solo",
      },
      {
        id: "idu680_02",
        order: 2,
        title: "Visão Geral do Sistema",
        description:
          "Arquitetura, redundância de IDUs, inicialização, modos Normal e Essential, monitores de fonte de dados, convenções de cor",
      },
      {
        id: "idu680_03",
        order: 3,
        title: "Simbologia das Telas",
        description:
          "PFD, MFD, fitas de velocidade e altitude, HSI, CDI, VDI, FPM, hover vector, skyway, mapa móvel, NAV LOG, página Hover",
      },
      {
        id: "idu680_04",
        order: 4,
        title: "Modos Reversionários",
        description:
          "Oito modos de falha (0 a 7), tabelas de status PFD/ND, falha de GPS, ADC, AHRS, OAT e heading",
      },
      {
        id: "idu680_05",
        order: 5,
        title: "Funções de Menu e Procedimentos",
        description:
          "Menus FPL, ACTV, INFO, OBS, HDG, ASEL, NRST, Direct, Time, BUGS, DCLTR, BARO, FAULTS, SET FUEL, PAGE",
      },
      {
        id: "idu680_06",
        order: 6,
        title: "Tutorial de Início Rápido",
        description:
          "Power-up, ajuste de baro, criação de waypoint, ativação de plano de voo, modo Essential, XFILL SYNC",
      },
      {
        id: "idu680_07",
        order: 7,
        title: "Procedimentos IFR",
        description:
          "Plano ativo, skyway, sequenciamento de waypoints, fly-over e fly-by, Direct-To, aproximações LNAV, LNAV/VNAV, LP, LPV, RNP, arcos DME, padrões de espera",
      },
      {
        id: "idu680_08",
        order: 8,
        title: "TAWS — Terrain Awareness Warning System",
        description:
          "HTAWS, FLTA, GPWS Modos 1 a 5, envelope de busca, inibições automáticas e manuais, alertas no PFD",
      },
      {
        id: "idu680_09",
        order: 9,
        title: "Apêndice e Operação Avançada",
        description:
          "Traffic, Remote Bugs Panel, WX-500, Datalink, Weather Radar, Video, Round Dials, SAR Patterns, ECBU",
      },
    ],
  },
  {
    id: "garmin_g1000",
    name: "Garmin G-1000",
    shortName: "G-1000",
    description: "Garmin G1000H Integrated Flight Deck — AW119Kx",
    sourceDoc: "190-01514-00 Rev A, março/2013",
    icon: "Monitor",
    color: "from-emerald-500 to-teal-600",
    chapters: [
      {
        id: "g1000_01",
        order: 1,
        title: "Visão Geral do Sistema",
        description:
          "LRUs (GDU 1040H, GIA 63H, GDC 74H, GEA 71H, GRS 77H, GMU 44, GTX 33H), controles do bezel, cartões SD, power-up, operação normal e reversionária, softkeys, backlighting",
      },
      {
        id: "g1000_02",
        order: 2,
        title: "Instrumentos de Voo",
        description:
          "Indicador de velocidade, atitude, altímetro, VSI, HSI, CDI, bearing pointers, alertas de altitude, MDA/DH, radar altímetro, operações anormais",
      },
      {
        id: "g1000_03",
        order: 3,
        title: "Sistema de Indicação de Motor (EIS)",
        description:
          "Página EIS no PFD e no MFD, parâmetros de motor, combustível, elétrico, hidráulico, óleo de motor e transmissão",
      },
      {
        id: "g1000_04",
        order: 4,
        title: "COM/NAV/Transponder",
        description:
          "Operação COM, NAV, sintonia manual e automática, espaçamento de frequência, GTX 33H Mode S, código VFR, IDENT, operação anormal",
      },
      {
        id: "g1000_05",
        order: 5,
        title: "Gerenciamento de Voo",
        description:
          "Mapas, waypoints, airspaces, Direct-To, planejamento de voo, navegação vertical, procedimentos, RAIM, navegação de plano, operação anormal",
      },
      {
        id: "g1000_06",
        order: 6,
        title: "Prevenção de Riscos (Hazard Avoidance)",
        description:
          "SiriusXM Weather, HTerrain Proximity, HTerrain-SVS, Profile View, HTAWS, TIS, Garmin GTS Traffic",
      },
      {
        id: "g1000_07",
        order: 7,
        title: "Recursos Adicionais",
        description:
          "SVT, SafeTaxi, ChartView, FliteCharts, Airport Directory, Scheduler, Flight Data Logging",
      },
    ],
  },
];

export const getAW119AvionicsSection = (id) =>
  AW119_AVIONICS_SECTIONS.find((s) => s.id === id) || null;

export const getAW119AvionicsChapters = (id) =>
  getAW119AvionicsSection(id)?.chapters || [];