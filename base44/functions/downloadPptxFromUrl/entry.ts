import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

function isPrivateHost(host) {
  if (!host) return true;
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const a = parseInt(ipv4[1], 10), b = parseInt(ipv4[2], 10);
    if (a === 0 || a === 127 || a === 10) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
  }
  if (h.includes(":")) {
    if (h === "::1" || h === "::") return true;
    if (/^fe[89ab]/.test(h) || /^fc/.test(h) || /^fd/.test(h) || /^ff/.test(h)) return true;
    return false;
  }
  return false;
}

function safeUrl(rawUrl) {
  let parsed;
  try { parsed = new URL(rawUrl); } catch { return null; }
  if (!/^https?:$/.test(parsed.protocol)) return null;
  if (isPrivateHost(parsed.hostname)) return null;
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

    const parsed = safeUrl(url);
    if (!parsed) return Response.json({ error: 'URL inválida ou destino não permitido.' }, { status: 400 });

    let res;
    let current = parsed.href;
    for (let i = 0; i < 5; i++) {
      res = await fetch(current, { signal: AbortSignal.timeout(60000), redirect: 'manual' });
      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        const next = safeUrl(new URL(res.headers.get('location'), current).href);
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