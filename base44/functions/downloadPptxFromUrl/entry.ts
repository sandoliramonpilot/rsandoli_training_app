import { createClientFromRequest } from "npm:@base44/sdk";
import { DENY_MESSAGE, isActiveAccount, isAdminUser } from "../../shared/accessSecurity.js";

// ---- IP / SSRF validation ----
// Normalizes alternate IPv4 encodings (decimal, hex, octal, mixed bases) to
// dotted-decimal and validates against private/reserved ranges. DNS names are
// resolved (best-effort, runtime-dependent) and every resolved address is
// checked, so a public hostname that points at an internal IP is rejected.
// When the resolver is unavailable the request is rejected (no unvalidated fetch).
// The validated public address (IPv4 preferred, else IPv6) is pinned for the
// fetch — the hostname is never resolved again after validation — keeping the
// original Host and, for HTTPS, the SNI/servername. A host resolved by DNS with
// no pinnable public address is rejected rather than fetched by hostname.

function parseIpv4Literal(host) {
  const h = String(host).toLowerCase();
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const oct = [m[1], m[2], m[3], m[4]].map(Number);
    if (oct.some((o) => o > 255)) return null;
    return oct.join(".");
  }
  if (/^\d+$/.test(h)) {
    const n = Number(h);
    if (!Number.isFinite(n) || n < 0 || n > 0xffffffff) return null;
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
  }
  if (/^0x[0-9a-f]+$/.test(h)) {
    const n = parseInt(h, 16);
    if (n < 0 || n > 0xffffffff) return null;
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
  }
  if (h.includes(".") && /^[0-9a-fx.]+$/i.test(h)) {
    const parts = h.split(".");
    if (parts.length !== 4) return null;
    const oct = parts.map((p) => {
      if (/^0x[0-9a-f]+$/.test(p)) return parseInt(p, 16);
      if (/^0[0-7]+$/.test(p) && p.length > 1) return parseInt(p, 8);
      if (/^\d+$/.test(p)) return parseInt(p, 10);
      return NaN;
    });
    if (oct.some((o) => !Number.isFinite(o) || o < 0 || o > 255)) return null;
    return oct.join(".");
  }
  return null;
}

function isPrivateIpv4(ip) {
  const m = String(ip).match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return true;
  const a = +m[1], b = +m[2];
  if (a === 0 || a === 127 || a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
}

// Expande qualquer notação IPv6 (comprimida com ::, estendida, ou com
// quadrupla dotted no final) para 8 grupos hex de 4 dígitos. Retorna null
// se o endereço não for um IPv6 válido. Necessário porque formas
// equivalentes do mesmo endereço (::ffff:7f00:1, 0:0:0:0:0:ffff:a9fe:a9fe,
// ::ffff:127.0.0.1) precisam ser classificadas de forma idêntica.
function expandIpv6(host) {
  let h = String(host).toLowerCase().trim().replace(/^\[|\]$/g, "");
  if (!h) return null;
  // Quadrupla dotted embarcada (ex.: ::ffff:1.2.3.4) -> dois grupos hex.
  const dotted = h.match(/^(.*?)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (dotted) {
    const octs = dotted[2].split(".").map(Number);
    if (octs.some((o) => !Number.isFinite(o) || o < 0 || o > 255)) return null;
    const hi = ((octs[0] << 8) | octs[1]) >>> 0;
    const lo = ((octs[2] << 8) | octs[3]) >>> 0;
    const prefix = dotted[1];
    const sep = prefix && !prefix.endsWith(":") ? ":" : "";
    h = prefix + sep + hi.toString(16) + ":" + lo.toString(16);
  }
  let groups;
  if (h.includes("::")) {
    if (h.indexOf("::") !== h.lastIndexOf("::")) return null;
    const [left, right] = h.split("::");
    const leftParts = left ? left.split(":") : [];
    const rightParts = right ? right.split(":") : [];
    if (leftParts.length + rightParts.length > 7) return null;
    const fill = 8 - leftParts.length - rightParts.length;
    groups = [...leftParts, ...Array(fill).fill("0"), ...rightParts];
  } else {
    groups = h.split(":");
  }
  if (groups.length !== 8) return null;
  if (groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return groups.map((g) => g.padStart(4, "0"));
}

function isPrivateIpv6(ip) {
  const raw = String(ip).toLowerCase().replace(/^\[|\]$/g, "");
  if (raw === "::1" || raw === "::") return true;
  const groups = expandIpv6(raw);
  if (!groups) return true; // endereço inválido -> rejeitar por segurança
  // Não-especificado (::) e loopback (::1) em qualquer notação.
  if (groups.every((g) => g === "0000")) return true;
  if (groups.slice(0, 7).every((g) => g === "0000") && groups[7] === "0001") return true;
  // IPv4-mapeado ::ffff:0:0/96 em qualquer notação (hex, estendida, dotted).
  if (groups[0] === "0000" && groups[1] === "0000" && groups[2] === "0000" &&
      groups[3] === "0000" && groups[4] === "0000" && groups[5] === "ffff") {
    const hi = parseInt(groups[6], 16);
    const lo = parseInt(groups[7], 16);
    const ipv4 = [(hi >> 8) & 255, hi & 255, (lo >> 8) & 255, lo & 255].join(".");
    return isPrivateIpv4(ipv4);
  }
  // IPv4-compatível (obsoleto, ::a.b.c.d) -> classifica como o IPv4 embutido.
  if (groups[0] === "0000" && groups[1] === "0000" && groups[2] === "0000" &&
      groups[3] === "0000" && groups[4] === "0000" && groups[5] === "0000") {
    const hi = parseInt(groups[6], 16);
    const lo = parseInt(groups[7], 16);
    if (hi !== 0 || lo !== 0) {
      const ipv4 = [(hi >> 8) & 255, hi & 255, (lo >> 8) & 255, lo & 255].join(".");
      return isPrivateIpv4(ipv4);
    }
  }
  const headHex = parseInt(groups[0], 16) || 0;
  if (headHex >= 0xfe80 && headHex <= 0xfebf) return true; // link-local
  if (headHex >= 0xfc00 && headHex <= 0xfdff) return true; // unique-local
  if (headHex >= 0xff00) return true; // multicast
  return false;
}

let _resolver = null; // null = not probed; function | false
async function buildResolver() {
  try {
    if (typeof Deno !== "undefined" && typeof Deno.resolveDns === "function") {
      return async (host) => {
        const out = [];
        try { const r = await Deno.resolveDns(host, "A"); if (Array.isArray(r)) out.push(...r); } catch {}
        try { const r = await Deno.resolveDns(host, "AAAA"); if (Array.isArray(r)) out.push(...r); } catch {}
        return out;
      };
    }
  } catch {}
  try {
    const dns = await import("node:dns/promises");
    if (dns && (dns.resolve4 || dns.resolve6)) {
      return async (host) => {
        const out = [];
        try { if (dns.resolve4) out.push(...(await dns.resolve4(host))); } catch {}
        try { if (dns.resolve6) out.push(...(await dns.resolve6(host))); } catch {}
        return out;
      };
    }
  } catch {}
  return false;
}

async function resolveHost(host) {
  if (_resolver === null) _resolver = await buildResolver();
  if (!_resolver) return null;
  return _resolver(host);
}

async function validateUrl(rawUrl) {
  let parsed;
  try { parsed = new URL(rawUrl); } catch { return null; }
  if (!/^https?:$/.test(parsed.protocol)) return null;
  const h = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost")) return null;
  const v4 = parseIpv4Literal(h);
  if (v4) return isPrivateIpv4(v4) ? null : { parsed, pinIp: null };
  if (h.includes(":")) return isPrivateIpv6(h) ? null : { parsed, pinIp: null };
  const addrs = await resolveHost(h);
  if (addrs === null) return null; // resolver unavailable -> reject
  const publicAddrs = addrs.filter((a) => a && (a.includes(":") ? !isPrivateIpv6(a) : !isPrivateIpv4(a)));
  // Qualquer resposta não-pública (ou vazia) invalida o host; assim sempre há ao
  // menos um endereço público pinável, inclusive em hosts somente-IPv6.
  if (!publicAddrs.length || publicAddrs.length !== addrs.length) return null;
  // Fixa o endereço público validado (IPv4 preferencial, senão IPv6) para HTTP e
  // HTTPS, de modo que o hostname não seja re-resolvido: a conexão fixada usa
  // Host/SNI contra o hostname original, fechando o TOCTOU de DNS rebinding.
  const pinIp = publicAddrs.find((a) => !a.includes(":")) || publicAddrs[0] || null;
  return { parsed, pinIp };
}

let _nodeHttp = null;
async function loadNodeHttp() {
  if (_nodeHttp !== null) return _nodeHttp;
  try {
    _nodeHttp = { http: await import("node:http"), https: await import("node:https") };
  } catch {
    _nodeHttp = false;
  }
  return _nodeHttp;
}

// Faz a requisição ao IP validado (pinning) preservando SNI/Host do hostname.
// HTTP: conecta ao IP com header Host = hostname. HTTPS: conecta ao IP com
// servername = hostname (SNI + validação de cert contra o hostname), eliminando
// a janela de DNS rebinding entre validação e fetch.
// pinIp ausente significa host literal de IP (já validado e sem DNS, logo sem
// rebinding possível), único caso em que a busca direta é segura.
async function pinnedRequest(validated) {
  const { parsed, pinIp } = validated;
  const directFetch = async () => {
    const res = await fetch(parsed.href, { signal: AbortSignal.timeout(60000), redirect: "manual" });
    const buf = new Uint8Array(await res.arrayBuffer());
    return { status: res.status, headers: Object.fromEntries(res.headers.entries()), bodyBuffer: buf };
  };
  if (!pinIp) return directFetch();
  const mods = await loadNodeHttp();
  // Sem node:http/https não há como fixar o endereço: recusar em vez de deixar o
  // fetch re-resolver o hostname (reabrindo a janela de rebinding).
  if (!mods) throw new Error("Não foi possível fixar o endereço validado do host.");
  const { Buffer } = await import("node:buffer");
  const isHttps = parsed.protocol === "https:";
  const mod = isHttps ? mods.https : mods.http;
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      hostname: pinIp,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      headers: { Host: parsed.hostname, "User-Agent": "base44-pptx/1.0" },
      timeout: 60000,
    };
    if (isHttps) {
      options.rejectUnauthorized = true;
      options.servername = parsed.hostname;
    }
    const req = mod.request(options, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, bodyBuffer: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.end();
  });
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: DENY_MESSAGE }, { status: 401 });
    if (!(await isActiveAccount(base44, user))) return Response.json({ error: DENY_MESSAGE }, { status: 403 });
    if (!isAdminUser(user)) return Response.json({ error: DENY_MESSAGE }, { status: 403 });

    const body = await req.json();
    const url = body?.url;
    if (!url || typeof url !== 'string') return Response.json({ error: 'URL inválida.' }, { status: 400 });

    const validated = await validateUrl(url);
    if (!validated) return Response.json({ error: 'URL inválida ou destino não permitido.' }, { status: 400 });

    let res;
    let current = validated;
    for (let i = 0; i < 5; i++) {
      res = await pinnedRequest(current);
      const loc = res.headers?.location || res.headers?.Location || null;
      if (res.status >= 300 && res.status < 400 && loc) {
        const next = await validateUrl(new URL(loc, current.parsed.href).href);
        if (!next) return Response.json({ error: 'Redirecionamento para destino não permitido.' }, { status: 400 });
        current = next;
        continue;
      }
      break;
    }
    if (!res || res.status < 200 || res.status >= 300) return Response.json({ error: 'Falha ao baixar o arquivo (HTTP ' + (res ? res.status : 0) + ').' }, { status: 502 });

    const size = res.bodyBuffer ? res.bodyBuffer.length : 0;
    if (size === 0) return Response.json({ error: 'Arquivo vazio.' }, { status: 400 });
    if (size > 50 * 1024 * 1024) return Response.json({ error: 'Arquivo excede 50 MB.' }, { status: 413 });

    const pathParts = validated.parsed.pathname.split('/');
    let filename = body?.file_name || pathParts[pathParts.length - 1] || 'apresentacao.pptx';
    if (!/\.pptx$/i.test(filename)) filename += '.pptx';

    const file = new File([res.bodyBuffer], filename, { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const result = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });

    return Response.json({ file_uri: result.file_uri, file_name: filename, file_size: size });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}