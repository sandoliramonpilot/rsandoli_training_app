// Pilot module helpers — expiry computation, JSON parsing, labels

export const ROLE_LABELS = {
  commander: "Comandante",
  copilot: "Copiloto",
  instructor: "Instrutor",
  trainee: "Aluno",
  manager: "Gestor",
};

export const LICENSE_TYPES = [
  { id: "anac_license", label: "Licença ANAC" },
  { id: "pc", label: "Piloto Comercial (PC)" },
  { id: "pla", label: "Piloto de Linha Aérea (PLA)" },
  { id: "ifr", label: "IFR" },
  { id: "mlte", label: "MLTE" },
  { id: "type_aw119", label: "Tipo AW119Kx" },
  { id: "other", label: "Outra habilitação" },
];

export const CERTIFICATE_TYPES = [
  { id: "crm", label: "CRM" },
  { id: "dangerous_goods", label: "Artigos Perigosos" },
  { id: "op_safety", label: "Segurança Operacional" },
  { id: "aph", label: "APH" },
  { id: "nvg", label: "NVG" },
  { id: "internal", label: "Treinamento Interno" },
  { id: "other", label: "Outro Curso" },
];

export const DOC_CATEGORIES = [
  { id: "license", label: "Licença" },
  { id: "cma", label: "CMA" },
  { id: "certificate", label: "Certificado" },
  { id: "passport", label: "Passaporte" },
  { id: "personal", label: "Documento Pessoal" },
  { id: "cv", label: "Currículo" },
  { id: "contract", label: "Contrato" },
  { id: "other", label: "Outro" },
];

export function safeParse(v, fallback) {
  if (!v) return fallback;
  try {
    const p = typeof v === "string" ? JSON.parse(v) : v;
    return p ?? fallback;
  } catch {
    return fallback;
  }
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
}

// Returns { status: 'expired'|'30'|'60'|'90'|'ok', days, label }
export function expiryStatus(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return { status: "none", days: null, label: "—" };
  if (days < 0) return { status: "expired", days, label: `Vencido há ${Math.abs(days)}d` };
  if (days <= 30) return { status: "30", days, label: `${days}d` };
  if (days <= 60) return { status: "60", days, label: `${days}d` };
  if (days <= 90) return { status: "90", days, label: `${days}d` };
  return { status: "ok", days, label: `${days}d` };
}

// Collect all expirable items for a pilot → array of { kind, label, date }
export function collectExpiries(pilot) {
  const items = [];
  const licenses = safeParse(pilot.licenses, []);
  const certificates = safeParse(pilot.certificates, []);
  const documents = safeParse(pilot.documents, []);
  licenses.forEach((l) => l.expiry && items.push({ kind: "Licença", label: l.typeLabel || l.type || "Licença", date: l.expiry }));
  certificates.forEach((c) => c.expiry && items.push({ kind: "Curso", label: c.typeLabel || c.type || "Curso", date: c.expiry }));
  documents.forEach((d) => d.expiry && items.push({ kind: "Documento", label: d.label || d.categoryLabel || "Documento", date: d.expiry }));
  return items.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Most critical upcoming expiry for list view
export function nextCriticalExpiry(pilot) {
  const items = collectExpiries(pilot);
  if (items.length === 0) return null;
  const worst = items.reduce((a, b) => {
    const da = daysUntil(a.date) ?? Infinity;
    const db = daysUntil(b.date) ?? Infinity;
    return db < da ? b : a;
  });
  return { ...worst, ...expiryStatus(worst.date) };
}

export const EXPIRY_COLORS = {
  expired: { dot: "bg-rose-500", text: "text-rose-400", pill: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
  "30": { dot: "bg-amber-500", text: "text-amber-400", pill: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  "60": { dot: "bg-amber-500", text: "text-amber-400", pill: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  "90": { dot: "bg-yellow-500", text: "text-yellow-400", pill: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30" },
  ok: { dot: "bg-emerald-500", text: "text-emerald-400", pill: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  none: { dot: "bg-slate-500", text: "text-slate-400", pill: "bg-slate-500/10 text-slate-400 border-slate-500/30" },
};