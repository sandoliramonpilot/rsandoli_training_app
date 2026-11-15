import { base44 } from "@/api/base44Client";

export const AVISO_ACCEPT = ".pdf,.ppsx,.pptx,.doc,.docx,.jpg,.jpeg,.mp4";
export const AVISO_MAX_MB = 50;

export const PERFIS = [
  { value: "AW119", label: "AW119" },
  { value: "H125", label: "H125" },
];

export function parseAnexos(aviso) {
  try {
    const list = JSON.parse(aviso?.anexos || "[]");
    if (!Array.isArray(list)) return [];
    return list.filter((a) => a && a.name && (a.uri || a.url));
  } catch {
    return [];
  }
}

export function parseProfiles(aviso) {
  try {
    const list = JSON.parse(aviso?.aircraft_profiles || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function parseDestinatarios(aviso) {
  try {
    const list = JSON.parse(aviso?.pilotos_destinatarios || "[]");
    if (!Array.isArray(list)) return [];
    return list.filter(Boolean).map(String);
  } catch {
    return [];
  }
}

// Aviso direcionado a pilotos específicos (não é um comunicado geral).
export function isDirecionado(aviso) {
  return parseDestinatarios(aviso).length > 0;
}

// Sem destinatários = todos os pilotos; com destinatários = apenas os selecionados.
export function isDestinadoAo(aviso, pilotId) {
  const ids = parseDestinatarios(aviso);
  if (ids.length === 0) return true;
  return !!pilotId && ids.includes(String(pilotId));
}

export function isAplicavel(aviso, profileValue) {
  const list = parseProfiles(aviso);
  if (list.length === 0) return true;
  return list.includes(profileValue);
}

export function anexoKind(name = "") {
  const ext = String(name).split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png"].includes(ext)) return "image";
  if (ext === "mp4") return "video";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (ext === "pptx" || ext === "ppsx") return "slide";
  return "pdf";
}

export async function abrirAnexo(anexo) {
  if (anexo.url) {
    window.open(anexo.url, "_blank", "noopener,noreferrer");
    return;
  }
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
    file_uri: anexo.uri,
  });
  window.open(signed_url, "_blank", "noopener,noreferrer");
}

export function fmtData(value) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}