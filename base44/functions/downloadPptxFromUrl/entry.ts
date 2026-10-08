import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// ---- IP / SSRF validation ----
// Normalizes alternate IPv4 encodings (decimal, hex, octal, mixed bases) to
// dotted-decimal and validates against private/reserved ranges. DNS names are
// resolved (best-effort, runtime-dependent) and every resolved address is
// checked, so a public hostname that points at an internal IP is rejected.

function parseIpv4Literal(host) {
  const h = String(host).toLowerCase();
  // dotted decimal
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const oct = [m[1], m[2], m[3], m[4]].map(Number);
    if (oct.some((o) => o > 255)) return null;
    return oct.join(".");
  }
  // single integer (decimal or hex) — e.g. 2130706433 or 0x7f000001
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
  // dotted with mixed bases — e.g. 0x7f.0.0.1 or 0177.0.0.1
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
  if (!m) return true; // not a valid dotted ipv4 -> reject
  const a = +m[1], b = +m[2];
  if (a === 0 || a === 127 || a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true; // multicast / reserved
  return false;
}

function isPrivateIpv6(ip) {
  const h = String(ip).toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "::1" || h === "::") return true;
  // IPv4-mapped IPv6 (::ffff:a.b.c.d)
  const mapped = h.match(/::ffff:([0-9.]+)$/);
  if (mapped) return isPrivateIpv4(mapped[1]);
  const parts = h.split(":");
  const head = parts[0] === "" ? "0" : parts[0];
  const headHex = parseInt(head, 16) || 0;
  if (headHex >= 0xfe80 && headHex <= 0xfebf) return true; // link-local
  if (headHex >= 0xfc00 && headHex <= 0xfdff) return true;  // unique local (fc00::/7)
  if (headHex >= 0xff00) return true;                       // multicast
  return false;
}

let _resolver = null; // null = not probed; function | false
async function buildResolver() {
  // Prefer Deno-native DNS, then node:dns/promises; false if neither available.
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
  if (!_resolver) return null; // resolution unavailable
  return _resolver(host);
}

async function isAllowedHost(host) {
  if (!host) return false;
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost")) return false;
  const v4 = parseIpv4Literal(h);
  if (v4) return !isPrivateIpv4(v4);
  if (h.includes(":")) return !isPrivateIpv6(h);
  // DNS name — resolve and validate every returned address.
  const addrs = await resolveHost(h);
  if (addrs === null) return true; // resolver unavailable: keep current behavior
  if (!addrs.length) return false;  // did not resolve -> reject
  return addrs.every((a) => (a.includes(":") ? !isPrivateIpv6(a) : !isPrivateIpv4(a)));
}

async function safeUrl(rawUrl) {
  let parsed;
  try { parsed = new URL(rawUrl); } catch { return null; }
  if (!/^https?:$/.test(parsed.protocol)) return null;
  if (!(await isAllowedHost(parsed.hostname))) return null;
  return parsed;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Apenas administradores podem baixar arquivos.' }, { status: 403 });

    const body = await req.json();
    const url = body?.url;
    if (!url || typeof url !== 'string') return Response.json({ error: 'URL inválida.' }, { status: 400 });

    const parsed = await safeUrl(url);
    if (!parsed) return Response.json({ error: 'URL inválida ou destino não permitido.' }, { status: 400 });

    let res;
    let current = parsed.href;
    for (let i = 0; i < 5; i++) {
      res = await fetch(current, { signal: AbortSignal.timeout(60000), redirect: 'manual' });
      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        const next = await safeUrl(new URL(res.headers.get('location'), current).href);
        if (!next) return Response.json({ error: 'Redirecionamento para destino não permitido.' }, { status: 400 });
        current = next.href;
        continue;
      }
      break;
    }
    if (!res || !res.ok) return Response.json({ error: 'Falha ao baixar o arquivo (HTTP ' + (res ? res.status : 0) + ').' }, { status: 502 });

    const blob = await res.blob();
    if (blob.size === 0) return Response.json({ error: 'Arquivo vazio.' }, { status: 400 });
    if (blob.size > 50 * 1024 * 1024) return Response.json({ error: 'Arquivo excede 50 MB.' }, { status: 413 });

    const pathParts = parsed.pathname.split('/');
    let filename = body?.file_name || pathParts[pathParts.length - 1] || 'apresentacao.pptx';
    if (!/\.pptx$/i.test(filename)) filename += '.pptx';

    const file = new File([blob], filename, { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const result = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });

    return Response.json({ file_uri: result.file_uri, file_name: filename, file_size: blob.size });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}