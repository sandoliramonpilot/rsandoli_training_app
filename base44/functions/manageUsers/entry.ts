import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { AUDITABLE_ACTIONS, canManageLevel, generateTempPassword, rankOf } from "../../shared/accessSecurity.js";

const ACCOUNT_STATUSES = ["convite_pendente", "ativa", "bloqueada", "suspensa", "desativada"];
const ACCESS_LEVELS = ["admin_geral", "administrador", "gestor_supervisor", "operacional", "consulta"];

function levelOf(u) {
  if (u?.access_level && ACCESS_LEVELS.includes(u.access_level)) return u.access_level;
  return u?.role === "admin" ? "administrador" : "operacional";
}

async function logAudit(base44, actor, target, action, details) {
  try {
    await base44.asServiceRole.entities.AccessAuditLog.create({
      actor_user_id: actor?.id || null,
      actor_name: actor?.full_name || actor?.email || "Sistema",
      target_user_id: target?.id || null,
      target_name: target?.full_name || target?.email || null,
      action,
      details: details || "",
      created_at: new Date().toISOString(),
    });
  } catch {}
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const actorLevel = levelOf(user);
    const canManage = actorLevel === "admin_geral" || actorLevel === "administrador";

    // ---------- LIST ----------
    if (action === "list") {
      const users = await base44.asServiceRole.entities.User.list();
      const sanitized = users.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        role: u.role,
        access_level: levelOf(u),
        account_status: u.account_status || "ativa",
        login: u.login || null,
        registration: u.registration || null,
        phone: u.phone || null,
        unit: u.unit || null,
        job_title: u.job_title || null,
        photo_uri: u.photo_uri || null,
        must_change_password: !!u.must_change_password,
        last_login_at: u.last_login_at || null,
        created_date: u.created_date,
        created_by_user_id: u.created_by_user_id || null,
        custom_permissions: u.custom_permissions || null,
        admin_notes: canManage ? (u.admin_notes || null) : null,
      }));
      return Response.json({ users: sanitized, actorLevel });
    }

    if (!canManage) return Response.json({ error: "Forbidden" }, { status: 403 });

    // ---------- CREATE ----------
    if (action === "create") {
      const email = String(body.email || "").trim().toLowerCase();
      const login = String(body.login || "").trim();
      const fullName = String(body.full_name || "").trim();
      const accessLevel = body.access_level;
      if (!fullName || !login || !email || !accessLevel) {
        return Response.json({ error: "Preencha nome, login, e-mail e nível de acesso." }, { status: 400 });
      }
      if (!ACCESS_LEVELS.includes(accessLevel)) {
        return Response.json({ error: "Nível de acesso inválido." }, { status: 400 });
      }
      if (!canManageLevel(actorLevel, accessLevel)) {
        return Response.json({ error: "Você não pode conceder um nível de acesso igual ou superior ao seu." }, { status: 403 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return Response.json({ error: "Formato de e-mail inválido." }, { status: 400 });
      }
      const all = await base44.asServiceRole.entities.User.list();
      if (all.some((u) => (u.email || "").toLowerCase() === email)) {
        return Response.json({ error: "Já existe um usuário com este e-mail." }, { status: 409 });
      }
      if (all.some((u) => (u.login || "").toLowerCase() === login.toLowerCase())) {
        return Response.json({ error: "Já existe um usuário com este login." }, { status: 409 });
      }

      // Cria a conta real de autenticação via convite (senha definida pelo próprio usuário).
      const role = accessLevel === "admin_geral" || accessLevel === "administrador" ? "admin" : "user";
      await base44.users.inviteUser(email, role);

      const created = (await base44.asServiceRole.entities.User.filter({ email }))[0];
      if (!created) return Response.json({ error: "Não foi possível concluir o cadastro." }, { status: 500 });

      const extras = {
        access_level: accessLevel,
        account_status: "convite_pendente",
        login,
        registration: body.registration ? String(body.registration).trim() : null,
        phone: body.phone ? String(body.phone).trim() : null,
        unit: body.unit ? String(body.unit).trim() : null,
        job_title: body.job_title ? String(body.job_title).trim() : null,
        photo_uri: body.photo_uri || null,
        admin_notes: body.admin_notes || null,
        must_change_password: !!body.must_change_password,
        created_by_user_id: user.id,
      };
      if (body.custom_permissions && typeof body.custom_permissions === "object") {
        extras.custom_permissions = JSON.stringify(body.custom_permissions);
      }
      await base44.asServiceRole.entities.User.update(created.id, extras);
      await logAudit(base44, user, created, AUDITABLE_ACTIONS.user_created, `Nível: ${accessLevel}`);
      return Response.json({ ok: true, userId: created.id, inviteSent: true });
    }

    // ---------- UPDATE / STATUS / LEVEL / PERMISSIONS ----------
    if (action === "update") {
      const targetId = body.user_id;
      if (!targetId) return Response.json({ error: "Usuário não informado." }, { status: 400 });
      const target = await base44.asServiceRole.entities.User.get(targetId);
      if (!target) return Response.json({ error: "Usuário não encontrado." }, { status: 404 });
      const targetLevel = levelOf(target);

      const patch = {};
      const changes = [];

      if (body.account_status !== undefined) {
        if (!ACCOUNT_STATUSES.includes(body.account_status)) return Response.json({ error: "Situação inválida." }, { status: 400 });
        if (target.id === user.id && body.account_status !== "ativa") {
          return Response.json({ error: "Você não pode alterar a situação da própria conta." }, { status: 403 });
        }
        if (targetLevel === "admin_geral") {
          if (actorLevel !== "admin_geral") return Response.json({ error: "Somente o Administrador Geral pode alterar outro Administrador Geral." }, { status: 403 });
          if (body.account_status === "desativada" || body.account_status === "bloqueada" || body.account_status === "suspensa") {
            const all = await base44.asServiceRole.entities.User.list();
            const activeGerals = all.filter((u) => levelOf(u) === "admin_geral" && (u.account_status || "ativa") === "ativa");
            if (activeGerals.length <= 1 && activeGerals[0]?.id === target.id) {
              return Response.json({ error: "Não é possível desativar o último Administrador Geral ativo." }, { status: 403 });
            }
          }
        }
        patch.account_status = body.account_status;
        changes.push(`Situação: ${target.account_status || "ativa"} → ${body.account_status}`);
      }

      if (body.access_level !== undefined) {
        if (!ACCESS_LEVELS.includes(body.access_level)) return Response.json({ error: "Nível de acesso inválido." }, { status: 400 });
        if (!canManageLevel(actorLevel, body.access_level) || !canManageLevel(actorLevel, targetLevel)) {
          return Response.json({ error: "Você não pode alterar para um nível igual ou superior ao seu." }, { status: 403 });
        }
        if (target.id === user.id) return Response.json({ error: "Você não pode alterar o próprio nível de acesso." }, { status: 403 });
        if (targetLevel === "admin_geral" && body.access_level !== "admin_geral") {
          const all = await base44.asServiceRole.entities.User.list();
          const gerals = all.filter((u) => levelOf(u) === "admin_geral" && (u.account_status || "ativa") === "ativa");
          if (gerais.length <= 1) return Response.json({ error: "Não é possível remover a função do último Administrador Geral ativo." }, { status: 403 });
        }
        patch.access_level = body.access_level;
        patch.role = body.access_level === "admin_geral" || body.access_level === "administrador" ? "admin" : "user";
        changes.push(`Nível: ${targetLevel} → ${body.access_level}`);
      }

      if (body.custom_permissions !== undefined) {
        if (actorLevel !== "admin_geral") return Response.json({ error: "Somente o Administrador Geral pode alterar permissões personalizadas." }, { status: 403 });
        patch.custom_permissions = body.custom_permissions ? JSON.stringify(body.custom_permissions) : null;
        changes.push("Permissões personalizadas alteradas");
      }

      if (body.profile && typeof body.profile === "object") {
        const p = body.profile;
        if (p.login !== undefined) {
          const login = String(p.login).trim();
          const all = await base44.asServiceRole.entities.User.list();
          if (all.some((u) => u.id !== targetId && (u.login || "").toLowerCase() === login.toLowerCase())) {
            return Response.json({ error: "Já existe um usuário com este login." }, { status: 409 });
          }
          patch.login = login;
        }
        ["registration", "phone", "unit", "job_title", "admin_notes", "photo_uri"].forEach((f) => {
          if (p[f] !== undefined) patch[f] = p[f];
        });
        if (p.full_name !== undefined) patch.full_name = String(p.full_name).trim();
        changes.push("Dados cadastrais atualizados");
      }

      if (Object.keys(patch).length === 0) return Response.json({ error: "Nada para atualizar." }, { status: 400 });
      await base44.asServiceRole.entities.User.update(targetId, patch);
      await logAudit(base44, user, target, AUDITABLE_ACTIONS.user_edited, changes.join(" | "));
      return Response.json({ ok: true });
    }

    // ---------- RESET PASSWORD ----------
    if (action === "reset_password") {
      const target = await base44.asServiceRole.entities.User.get(body.user_id);
      if (!target) return Response.json({ error: "Usuário não encontrado." }, { status: 404 });
      try {
        await base44.asServiceRole.auth.resetPasswordRequest(target.email);
      } catch {}
      await base44.asServiceRole.entities.User.update(target.id, { must_change_password: true });
      await logAudit(base44, user, target, AUDITABLE_ACTIONS.password_reset_requested, "Redefinição encaminhada pelo administrador");
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}