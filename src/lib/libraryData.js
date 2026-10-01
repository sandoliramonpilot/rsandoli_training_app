// Categorias da Biblioteca Técnica
export const LIBRARY_CATEGORIES = [
  { id: "poh", name: "POH", icon: "FileText", color: "from-violet-500 to-purple-600" },
  { id: "rfm", name: "RFM", icon: "FileText", color: "from-emerald-500 to-teal-600" },
  { id: "mmel", name: "MMEL", icon: "FileText", color: "from-amber-500 to-orange-600" },
  { id: "mel", name: "MEL", icon: "FileText", color: "from-amber-500 to-red-600" },
  { id: "qrh", name: "QRH", icon: "Siren", color: "from-rose-500 to-red-600" },
  { id: "flight_manual", name: "Flight Manual", icon: "BookOpen", color: "from-sky-500 to-blue-600" },
  { id: "maintenance_manual", name: "Maintenance Manual", icon: "Wrench", color: "from-amber-500 to-orange-600" },
  { id: "wiring_manual", name: "Wiring Manual", icon: "Cable", color: "from-teal-500 to-cyan-600" },
  { id: "avionics_manual", name: "Avionics Manual", icon: "Monitor", color: "from-indigo-500 to-blue-600" },
  { id: "helipilot_manual", name: "HeliPilot Manual", icon: "Joystick", color: "from-cyan-500 to-sky-600" },
  { id: "genesys_manual", name: "Genesys IDU-680 Manual", icon: "Monitor", color: "from-blue-500 to-indigo-600" },
  { id: "anac", name: "Publicações ANAC", icon: "Landmark", color: "from-emerald-500 to-green-600" },
  { id: "icao", name: "Publicações ICAO", icon: "Globe", color: "from-sky-500 to-cyan-600" },
  { id: "faa", name: "Publicações FAA", icon: "Flag", color: "from-indigo-500 to-violet-600" },
];

export const CATEGORY_LABELS = Object.fromEntries(LIBRARY_CATEGORIES.map((c) => [c.id, c.name]));