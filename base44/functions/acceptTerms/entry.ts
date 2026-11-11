import { createClientFromRequest } from "npm:@base44/sdk";
import { DENY_MESSAGE, isActiveAccount } from "../../shared/accessSecurity.js";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // Exige usuário autenticado — o aceite dos termos é registrado após o login
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: DENY_MESSAGE }, { status: 401 });
    // Conta inativa não pode aceitar termos.
    if (!(await isActiveAccount(base44, user))) return Response.json({ error: DENY_MESSAGE }, { status: 403 });

    const body = await req.json().catch(() => ({}));

    // Usa apenas o cabeçalho IP definido pela plataforma de execução (Cloudflare).
    // x-forwarded-for e x-real-ip são definíveis pelo cliente e não são confiáveis.
    const ip = req.headers.get("cf-connecting-ip") || "";

    const userAgent = req.headers.get("user-agent") || "";
    // Limita o tamanho do device_info recebido do cliente para evitar abuso
    const deviceInfo = String(body.device_info || "").slice(0, 200);

    // Cria o registro de aceite para auditoria
    await base44.asServiceRole.entities.TermsAcceptance.create({
      accepted_at: new Date().toISOString(),
      user_id: user?.id || null,
      user_email: user?.email || null,
      ip_address: ip,
      device_info: deviceInfo,
      user_agent: userAgent,
      // session_id gerado no servidor — não confia no valor enviado pelo cliente
      session_id: crypto.randomUUID(),
      terms_version: "v1",
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}