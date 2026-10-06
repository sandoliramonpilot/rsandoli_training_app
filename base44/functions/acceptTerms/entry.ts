import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // Exige usuário autenticado — o aceite dos termos é registrado após o login
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    // Obtém IP dos cabeçalhos da requisição
    const ip =
      req.headers.get("cf-connecting-ip") ||
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "";

    const userAgent = req.headers.get("user-agent") || "";
    const deviceInfo = body.device_info || "";

    // Cria o registro de aceite para auditoria
    await base44.asServiceRole.entities.TermsAcceptance.create({
      accepted_at: new Date().toISOString(),
      user_id: user?.id || null,
      user_email: user?.email || null,
      ip_address: ip,
      device_info: deviceInfo,
      user_agent: userAgent,
      session_id: body.session_id || crypto.randomUUID(),
      terms_version: "v1",
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}