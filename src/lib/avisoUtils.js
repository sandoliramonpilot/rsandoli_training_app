import { base44 } from "@/api/base44Client";

export const AVISO_ACCEPT = ".pdf,.jpg,.jpeg,.doc,.docx,.mp4,.pptx";
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
  if (ext === "pptx") return "slide";
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