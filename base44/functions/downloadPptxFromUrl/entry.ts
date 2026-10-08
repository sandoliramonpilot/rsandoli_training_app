import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Apenas administradores podem baixar arquivos.' }, { status: 403 });

    const body = await req.json();
    const url = body?.url;
    if (!url || typeof url !== 'string') return Response.json({ error: 'URL inválida.' }, { status: 400 });

    let parsed;
    try { parsed = new URL(url); } catch { return Response.json({ error: 'URL malformada.' }, { status: 400 }); }
    if (!/^https?:$/.test(parsed.protocol)) return Response.json({ error: 'Protocolo não suportado.' }, { status: 400 });

    const res = await fetch(url, { signal: AbortSignal.timeout(60000), redirect: 'follow' });
    if (!res.ok) return Response.json({ error: 'Falha ao baixar o arquivo (HTTP ' + res.status + ').' }, { status: 502 });

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