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
      const invites = await base44.asServiceRole.entities.UserInvite.list().catch(() => []);

      // Aplica metadados de convites já aceitos (convidado já existe como usuário).
      const usersByEmail = new Map(users.map((u) => [(u.email || "").toLowerCase(), u]));
      for (const inv of invites) {
        if (inv.status !== "pending") continue;
        const matched = usersByEmail.get((inv.email || "").toLowerCase());
        if (matched) {
          const patch = {};
          if (inv.access_level) patch.access_level = inv.access_level;
          if (inv.login) patch.login = inv.login;
          if (!matched.registration && inv.registration) patch.registration = inv.registration;
          if (!matched.phone && inv.phone) patch.phone = inv.phone;
          if (!matched.unit && inv.unit) patch.unit = inv.unit;
          if (!matched.job_title && inv.job_title) patch.job_title = inv.job_title;
          if (inv.custom_permissions) patch.custom_permissions = inv.custom_permissions;
          if (inv.admin_notes) patch.admin_notes = inv.admin_notes;
          patch.account_status = matched.account_status || "ativa";
          patch.role = inv.access_level === "admin_geral" || inv.access_level === "administrador" ? "admin" : "user";
          await base44.asServiceRole.entities.User.update(matched.id, patch).catch(() => {});
          await base44.asServiceRole.entities.UserInvite.update(inv.id, { status: "accepted", accepted_at: new Date().toISOString() }).catch(() => {});
        }
      }

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
        is_master: !!u.is_master,
        admin_notes: canManage ? (u.admin_notes || null) : null,
        invite_status: invites.find((i) => (i.email || "").toLowerCase() === (u.email || "").toLowerCase() && i.status === "accepted") ? "accepted" : null,
      }));

      // Inclui convites pendentes (convidado ainda não aceitou) como itens separados.
      const pending = invites
        .filter((i) => i.status === "pending")
        .map((i) => ({
          id: i.id,
          invite: true,
          full_name: i.full_name || i.login || null,
          email: i.email,
          access_level: i.access_level,
          account_status: "convite_pendente",
          login: i.login || null,
          registration: i.registration || null,
          phone: i.phone || null,
          unit: i.unit || null,
          job_title: i.job_title || null,
          created_date: i.created_at,
          invited_by_name: i.invited_by_name || null,
          admin_notes: canManage ? (i.admin_notes || null) : null,
        }));

      return Response.json({ users: [...pending, ...sanitized], actorLevel });
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

      // Envia o convite de cadastro (o convidado define a própria senha via link por e-mail).
      // A conta só passa a constar na lista de usuários após o convidado aceitar o convite.
      // Os metadados pretendidos ficam gravados em UserInvite e são aplicados automaticamente
      // assim que o convidado concluir o cadastro (ver "list").
      const role = accessLevel === "admin_geral" || accessLevel === "administrador" ? "admin" : "user";
      try {
        await base44.users.inviteUser(email, role);
      } catch (inviteErr) {
        return Response.json({ error: `Falha ao enviar convite: ${inviteErr?.message || inviteErr}` }, { status: 500 });
      }

      const invitePayload = {
        email,
        full_name: fullName,
        login,
        access_level: accessLevel,
        registration: body.registration ? String(body.registration).trim() : null,
        phone: body.phone ? String(body.phone).trim() : null,
        unit: body.unit ? String(body.unit).trim() : null,
        job_title: body.job_title ? String(body.job_title).trim() : null,
        admin_notes: body.admin_notes || null,
        status: "pending",
        invited_by_user_id: user.id,
        invited_by_name: user.full_name || user.email || null,
        created_at: new Date().toISOString(),
      };
      if (body.custom_permissions && typeof body.custom_permissions === "object") {
        invitePayload.custom_permissions = JSON.stringify(body.custom_permissions);
      }
      await base44.asServiceRole.entities.UserInvite.create(invitePayload);

      // Cria registro de piloto vinculado (migração usuário→piloto, item 8).
      // O piloto é criado mesmo antes do aceite do convite, garantindo integridade e relacionamento.
      try {
        await base44.asServiceRole.entities.Pilot.create({
          full_name: fullName,
          email,
          registration: body.registration ? String(body.registration).trim() : null,
          role: "copilot",
          status: "active",
          approval_status: "approved",
          anac_code: null,
        });
      } catch (pilotErr) {
        // Falha na criação do piloto não deve impedir o convite; registra no log.
        await logAudit(base44, user, { email, full_name: fullName }, "Criação de usuário", `Piloto não criado: ${pilotErr?.message || pilotErr}`);
      }

      await logAudit(
        base44,
        user,
        { email, full_name: fullName },
        AUDITABLE_ACTIONS.user_created,
        `Convite enviado — Nível: ${accessLevel} | Login: ${login}`
      );
      return Response.json({ ok: true, inviteSent: true, message: "Convite enviado. O convidado receberá um e-mail para concluir o cadastro." });
    }

// ---------- CANCEL INVITE ----------
    if (action === "cancel_invite") {
      const invite = await base44.asServiceRole.entities.UserInvite.get(body.invite_id).catch(() => null);
      if (!invite) return Response.json({ error: "Convite não encontrado." }, { status: 404 });
      if (invite.status !== "pending") return Response.json({ error: "Convite já processado." }, { status: 400 });
      await base44.asServiceRole.entities.UserInvite.update(body.invite_id, { status: "cancelled" });
      await logAudit(base44, user, { email: invite.email }, AUDITABLE_ACTIONS.user_edited, `Convite cancelado — ${invite.email}`);
      return Response.json({ ok: true });
    }

    // ---------- RESEND INVITE ----------
    if (action === "resend_invite") {
      const invite = await base44.asServiceRole.entities.UserInvite.get(body.invite_id).catch(() => null);
      if (!invite) return Response.json({ error: "Convite não encontrado." }, { status: 404 });
      if (invite.status !== "pending") return Response.json({ error: "Convite já processado." }, { status: 400 });
      const role = invite.access_level === "admin_geral" || invite.access_level === "administrador" ? "admin" : "user";
      await base44.users.inviteUser(invite.email, role).catch((e) => {});
      await logAudit(base44, user, { email: invite.email }, AUDITABLE_ACTIONS.user_edited, `Convite reenviado — ${invite.email}`);
      return Response.json({ ok: true });
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
          if (gerals.length <= 1) return Response.json({ error: "Não é possível remover a função do último Administrador Geral ativo." }, { status: 403 });
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

    // ---------- MIGRATE USERS → PILOTS ----------
    if (action === "migrate") {
      const users = await base44.asServiceRole.entities.User.list().catch(() => []);
      const pilots = await base44.asServiceRole.entities.Pilot.list().catch(() => []);
      const pilotsByEmail = new Map(
        pilots
          .filter((p) => p.email)
          .map((p) => [(p.email || "").toLowerCase(), p])
      );
      const created = [];
      const skipped = [];
      for (const u of users) {
        const em = (u.email || "").toLowerCase();
        if (!em) continue;
        if (pilotsByEmail.has(em)) {
          skipped.push(em);
          continue;
        }
        try {
          await base44.asServiceRole.entities.Pilot.create({
            full_name: u.full_name || u.email || "Piloto",
            email: u.email,
            registration: u.registration || null,
            phone: u.phone || null,
            role: "copilot",
            status: "active",
            approval_status: "approved",
            anac_code: null,
          });
          created.push(em);
        } catch (err) {
          // segue para o próximo; sem interromper a migração
        }
      }
      await logAudit(base44, user, null, "Migração usuário→piloto", `Pilotos criados: ${created.length} | Já vinculados: ${skipped.length}`);
      return Response.json({ ok: true, created: created.length, alreadyLinked: skipped.length });
    }

    // ---------- SET MASTER (Administrador Geral Master) ----------
    if (action === "set_master") {
      // Somente o Administrador Geral pode conceder perfil Master.
      if (actorLevel !== "admin_geral") return Response.json({ error: "Forbidden" }, { status: 403 });
      const targetId = body.user_id;
      if (!targetId) return Response.json({ error: "Usuário não informado." }, { status: 400 });
      const target = await base44.asServiceRole.entities.User.get(targetId).catch(() => null);
      if (!target) return Response.json({ error: "Usuário não encontrado." }, { status: 404 });
      const master = !!body.master;
      // Master é sempre Administrador Geral com acesso total.
      await base44.asServiceRole.entities.User.update(targetId, {
        access_level: "admin_geral",
        role: "admin",
        account_status: "ativa",
        is_master: master,
        custom_permissions: null, // acesso irrestrito
      });
      // Sincroniza o piloto vinculado ao e-mail, marcando is_master.
      const pilots = await base44.asServiceRole.entities.Pilot.filter({ email: target.email }).catch(() => []);
      for (const p of pilots) {
        await base44.asServiceRole.entities.Pilot.update(p.id, { is_master: master, permission: "full", approval_status: "approved" }).catch(() => {});
      }
      await logAudit(base44, user, target, "Admin Geral Master", `Perfil Master ${master ? "concedido" : "removido"} para ${target.full_name || target.email}`);
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