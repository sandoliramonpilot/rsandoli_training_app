import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { AUDITABLE_ACTIONS, canManageLevel, generateTempPassword, getCodeSecret, hashCode, isActiveAccount, rankOf, SENSITIVE_OPERATIONS, setAccountStatusRecord } from "../../shared/accessSecurity.js";const ACCOUNT_STATUSES = ["convite_pendente", "ativa", "bloqueada", "suspensa", "desativada"];
const ACCESS_LEVELS = ["admin_geral", "administrador", "gestor_supervisor", "operacional", "consulta"];

function levelOf(u) {
  if (u?.access_level && ACCESS_LEVELS.includes(u.access_level)) return u.access_level;
  return u?.role === "admin" ? "administrador" : "operacional";
}
// ---------- Escopo de perfis (D1) ----------
function parseProfiles(value) {
  if (!value) return ["AW119"]; // legado: vazio = AW119
  if (Array.isArray(value)) return value;
  try {
    const arr = JSON.parse(value);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// null = admin_geral (vê tudo); caso contrário, lista de perfis do ator.
// Busca o registro no backend para não depender do que auth.me() devolve.
async function actorScope(base44, user) {
  if (levelOf(user) === "admin_geral") return null;
  const self = await base44.asServiceRole.entities.User.get(user.id).catch(() => null);
  return parseProfiles((self || user).aircraft_profiles);
}

function inScope(scope, record) {
  if (scope === null) return true;
  return parseProfiles(record.aircraft_profiles).some((p) => scope.includes(p));
}

// Perfis de aeronave atribuíveis a usuários (mesmos valores do frontend).
const AIRCRAFT_PROFILE_VALUES = ["AW119", "H125"];

// C3: valida os perfis de aeronave solicitados contra os valores conhecidos e
// contra o escopo do chamador. Retorna a mensagem de erro ou null.
function validateProfiles(scope, requested) {
  const list = parseProfiles(requested);
  if (!list.length || list.some((p) => !AIRCRAFT_PROFILE_VALUES.includes(p))) return "Perfil de aeronave inválido.";
  if (scope !== null && !list.every((p) => scope.includes(p))) return "Você só pode atribuir os perfis de aeronave que gerencia.";
  return null;
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

// Verificação step-up no backend: valida o código de acesso (purpose "sensitive_op")
// do próprio chamador para UMA operação específica, consumindo-o em caso de sucesso.
const MAX_CODE_ATTEMPTS = 5;
async function verifyAccessCode(base44, user, code, operation) {
  if (!SENSITIVE_OPERATIONS.includes(operation)) return false;
  if (!code || !/^\d{6}$/.test(String(code))) return false;
  const secret = getCodeSecret();
  if (!secret) return false; // fail closed: sem segredo, nenhuma operação sensível passa
  try {
    const open = (await base44.asServiceRole.entities.AccessCode.filter({ user_id: user.id, purpose: "sensitive_op", used: false }))
      .filter((c) => c.operation === operation);
    const latest = open.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    if (!latest) return false;
    if (new Date(latest.expires_at).getTime() < Date.now()) {
      await base44.asServiceRole.entities.AccessCode.update(latest.id, { used: true });
      return false;
    }
    if ((latest.attempts || 0) >= MAX_CODE_ATTEMPTS) {
      await base44.asServiceRole.entities.AccessCode.update(latest.id, { used: true });
      return false;
    }
    const codeHash = await hashCode(String(code), user.id, secret);
    if (codeHash !== latest.code_hash) {
      const attempts = (latest.attempts || 0) + 1;
      await base44.asServiceRole.entities.AccessCode.update(latest.id, { attempts, used: attempts >= MAX_CODE_ATTEMPTS });
      return false;
    }
    await base44.asServiceRole.entities.AccessCode.update(latest.id, { used: true });
    return true;
  } catch {
    return false;
  }
}
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await isActiveAccount(base44, user))) return Response.json({ error: "Conta não está ativa." }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const actorLevel = levelOf(user);
    const canManage = user.role === "admin" && (actorLevel === "admin_geral" || actorLevel === "administrador");
    if (!canManage) return Response.json({ error: "Forbidden" }, { status: 403 });

        // ---------- LIST ----------
    if (action === "list") {
      const scope = await actorScope(base44, user);
      const allUsers = await base44.asServiceRole.entities.User.list();
      const invites = await base44.asServiceRole.entities.UserInvite.list().catch(() => []);
      // C1: convite só é aplicado depois de aprovado pelo administrador geral,
      // e somente a usuários dentro do escopo de quem está listando.
      const usersByEmail = new Map(allUsers.map((u) => [(u.email || "").toLowerCase(), u]));
      for (const inv of invites) {
        if (inv.status !== "pending") continue;
        if ((inv.approval_status || "approved") !== "approved") continue;
        const matched = usersByEmail.get((inv.email || "").toLowerCase());
        if (!matched || !inScope(scope, matched)) continue;
        const patch = {};
        if (inv.access_level) patch.access_level = inv.access_level;
        if (inv.login) patch.login = inv.login;
        if (!matched.registration && inv.registration) patch.registration = inv.registration;
        if (!matched.phone && inv.phone) patch.phone = inv.phone;
        if (!matched.unit && inv.unit) patch.unit = inv.unit;
        if (!matched.job_title && inv.job_title) patch.job_title = inv.job_title;
        if (inv.custom_permissions) patch.custom_permissions = inv.custom_permissions;
        if (inv.aircraft_profiles) patch.aircraft_profiles = inv.aircraft_profiles;
        if (inv.admin_notes) patch.admin_notes = inv.admin_notes;
        patch.account_status = matched.account_status || "ativa";
        patch.role = inv.access_level === "admin_geral" || inv.access_level === "administrador" ? "admin" : "user";
        await base44.asServiceRole.entities.User.update(matched.id, patch).catch(() => {});
        await base44.asServiceRole.entities.UserInvite.update(inv.id, { status: "accepted", accepted_at: new Date().toISOString() }).catch(() => {});
      }
      // Recarrega após os convites aplicados e filtra pelo escopo do ator (C3).
      const users = (await base44.asServiceRole.entities.User.list()).filter((u) => inScope(scope, u));
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
        aircraft_profiles: u.aircraft_profiles || null,
        is_master: !!u.is_master,
        admin_notes: canManage ? (u.admin_notes || null) : null,
        invite_status: invites.find((i) => (i.email || "").toLowerCase() === (u.email || "").toLowerCase() && i.status === "accepted") ? "accepted" : null,
      }));
      // Convites pendentes dentro do escopo do ator (C3).
      const pending = invites
        .filter((i) => i.status === "pending" && inScope(scope, i))
        .map((i) => ({
          id: i.id,
          invite: true,
          full_name: i.full_name || i.login || null,
          email: i.email,
          access_level: i.access_level,
          account_status: "convite_pendente",
          approval_status: i.approval_status || "approved",
          login: i.login || null,
          registration: i.registration || null,
          phone: i.phone || null,
          unit: i.unit || null,
          job_title: i.job_title || null,
          created_date: i.created_at,
          invited_by_name: i.invited_by_name || null,
          admin_notes: canManage ? (i.admin_notes || null) : null,
          aircraft_profiles: i.aircraft_profiles || null,
        }));
      // Vínculo com pilotos (sem alteração de lógica)
      const pilots = await base44.asServiceRole.entities.Pilot.list().catch(() => []);
      const pilotsByUserId = new Map(pilots.filter((p) => p.user_id).map((p) => [p.user_id, p]));
      const pilotsByEmail = new Map(
        pilots.filter((p) => p.email).map((p) => [(p.email || "").toLowerCase(), p])
      );
      for (const u of sanitized) {
        let pilot = pilotsByUserId.get(u.id) || (u.email ? pilotsByEmail.get(u.email.toLowerCase()) : null);
        if (pilot && !pilot.user_id) {
          await base44.asServiceRole.entities.Pilot.update(pilot.id, { user_id: u.id }).catch(() => {});
        }
        u.pilot_id = pilot?.id || null;
        u.pilot_status = pilot
          ? (pilot.approval_status === "pending" ? "incompleto" : "completo")
          : "sem_vinculo";
        u.pilot_canac = pilot?.anac_code || pilot?.registration || null;
      }
      // Backfill de AccountStatus para usuários legados (sem alteração de lógica)
      const allStatuses = await base44.asServiceRole.entities.AccountStatus.list().catch(() => []);
      const statusByUser = new Set((allStatuses || []).map((s) => s.user_id));
      for (const u of sanitized) {
        if (u.id && !statusByUser.has(u.id)) {
          await base44.asServiceRole.entities.AccountStatus.create({
            user_id: u.id,
            status: "ativa",
            set_by: "Sistema (backfill)",
            set_at: new Date().toISOString(),
            reason: "",
          }).catch(() => {});
        }
      }
      return Response.json({ users: [...pending, ...sanitized], actorLevel });
    }

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
      // C2: somente o Administrador Geral define permissões personalizadas.
      if (body.custom_permissions != null && actorLevel !== "admin_geral") {
        return Response.json({ error: "Somente o Administrador Geral pode definir permissões personalizadas." }, { status: 403 });
      }
      // C3: o convidado só pode receber perfis de aeronave que o convidador gerencia.
      let inviteProfiles = null;
      if (body.aircraft_profiles) {
        const profilesError = validateProfiles(await actorScope(base44, user), body.aircraft_profiles);
        if (profilesError) return Response.json({ error: profilesError }, { status: 403 });
        inviteProfiles = parseProfiles(body.aircraft_profiles);
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

      // Fluxo de aprovação: somente o Administrador Geral envia convites imediatamente.
      // Administradores criam convites pendentes de aprovação — o e-mail só é enviado
      // após um Administrador Geral aprovar (ver "approve_invite").
      const role = accessLevel === "admin_geral" || accessLevel === "administrador" ? "admin" : "user";
      const needsApproval = actorLevel !== "admin_geral";
      const approvalStatus = needsApproval ? "pending" : "approved";

      if (!needsApproval) {
        try {
          await base44.users.inviteUser(email, role);
        } catch (inviteErr) {
          return Response.json({ error: `Falha ao enviar convite: ${inviteErr?.message || inviteErr}` }, { status: 500 });
        }
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
        approval_status: approvalStatus,
        invited_by_user_id: user.id,
        invited_by_name: user.full_name || user.email || null,
        created_at: new Date().toISOString(),
      };
      if (body.custom_permissions && typeof body.custom_permissions === "object") {
        invitePayload.custom_permissions = JSON.stringify(body.custom_permissions);
      }
      if (inviteProfiles) {
        invitePayload.aircraft_profiles = JSON.stringify(inviteProfiles);
      }
      await base44.asServiceRole.entities.UserInvite.create(invitePayload);

      // Vínculo com piloto — procura cadastro existente por e-mail antes de criar (item 10).
      const allPilots = await base44.asServiceRole.entities.Pilot.list().catch(() => []);
      const existingByEmail = allPilots.filter((p) => (p.email || "").toLowerCase() === email);
      if (existingByEmail.length === 1) {
        // Correspondência inequívoca — não cria duplicidade; será linkado por user_id ao aceitar o convite.
        await logAudit(base44, user, { email, full_name: fullName }, "Vínculo com piloto", `Piloto existente vinculado: ${existingByEmail[0].full_name}`);
      } else if (existingByEmail.length === 0) {
        // Sem correspondência — cria novo piloto marcado como incompleto (item 10.5).
        try {
          await base44.asServiceRole.entities.Pilot.create({
            full_name: fullName,
            email,
            registration: body.registration ? String(body.registration).trim() : null,
            cpf: body.cpf ? String(body.cpf).trim() : null,
            anac_code: body.canac ? String(body.canac).trim() : null,
            role: "copilot",
            status: "active",
            approval_status: "pending",
            aircraftProfile: inviteProfiles && inviteProfiles.length > 1 ? "shared" : (inviteProfiles?.[0] || "AW119"),
          });
        } catch (pilotErr) {
          await logAudit(base44, user, { email, full_name: fullName }, "Criação de usuário", `Piloto não criado: ${pilotErr?.message || pilotErr}`);
        }
      } else {
        // Múltiplas correspondências — não vincula automaticamente; marca para revisão (item 10.6).
        await logAudit(base44, user, { email, full_name: fullName }, "Vínculo com piloto", `Múltiplas correspondências (${existingByEmail.length}) — revisão necessária`);
      }

      await logAudit(
        base44,
        user,
        { email, full_name: fullName },
        AUDITABLE_ACTIONS.user_created,
        needsApproval
          ? `Convite criado (aguardando aprovação) — Nível: ${accessLevel} | Login: ${login}`
          : `Convite enviado — Nível: ${accessLevel} | Login: ${login}`
      );
      return Response.json({
        ok: true,
        inviteSent: !needsApproval,
        needsApproval,
        message: needsApproval
          ? "Convite criado e aguardando aprovação do Administrador Geral. O e-mail será enviado após a aprovação."
          : "Convite enviado. O convidado receberá um e-mail para concluir o cadastro.",
      });
    }

    // ---------- FIND PILOT MATCHES ----------
    if (action === "find_pilot_matches") {
      const email = String(body.email || "").trim().toLowerCase();
      const cpf = String(body.cpf || "").trim();
      const canac = String(body.canac || "").trim();
      const registration = String(body.registration || "").trim();
      const pilots = await base44.asServiceRole.entities.Pilot.list().catch(() => []);
      const scope = await actorScope(base44, user);
      const matches = pilots
        .filter((p) => {
          if (scope !== null && !(scope.includes(p.aircraftProfile) || p.aircraftProfile === "shared")) return false;
          if (email && (p.email || "").toLowerCase() === email) return true;
          if (cpf && p.cpf === cpf) return true;
          if (canac && (p.anac_code === canac || p.registration === canac)) return true;
          if (registration && p.registration === registration) return true;
          return false;
        })
        .map((p) => ({
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          registration: p.registration,
          anac_code: p.anac_code,
          user_id: p.user_id || null,
        }));
      return Response.json({ matches });
    }

// ---------- CANCEL INVITE ----------
    if (action === "cancel_invite") {
      const invite = await base44.asServiceRole.entities.UserInvite.get(body.invite_id).catch(() => null);
      if (!invite) return Response.json({ error: "Convite não encontrado." }, { status: 404 });
      if (invite.status !== "pending") return Response.json({ error: "Convite já processado." }, { status: 400 });
      if (actorLevel !== "admin_geral" && !canManageLevel(actorLevel, invite.access_level)) {
        return Response.json({ error: "Você não pode gerenciar convites de nível igual ou superior ao seu." }, { status: 403 });
      }
      if (!inScope(await actorScope(base44, user), invite)) {
        return Response.json({ error: "Você não pode gerenciar um convite fora do seu escopo de perfis de aeronave." }, { status: 403 });
      }
      await base44.asServiceRole.entities.UserInvite.update(body.invite_id, { status: "cancelled" });
      await logAudit(base44, user, { email: invite.email }, AUDITABLE_ACTIONS.user_edited, `Convite cancelado — ${invite.email}`);
      return Response.json({ ok: true });
    }

    // ---------- RESEND INVITE ----------
    if (action === "resend_invite") {
      const invite = await base44.asServiceRole.entities.UserInvite.get(body.invite_id).catch(() => null);
      if (!invite) return Response.json({ error: "Convite não encontrado." }, { status: 404 });
      if (invite.status !== "pending") return Response.json({ error: "Convite já processado." }, { status: 400 });
      if (actorLevel !== "admin_geral" && !canManageLevel(actorLevel, invite.access_level)) {
        return Response.json({ error: "Você não pode gerenciar convites de nível igual ou superior ao seu." }, { status: 403 });
      }
      if (!inScope(await actorScope(base44, user), invite)) {
        return Response.json({ error: "Você não pode reenviar um convite fora do seu escopo de perfis de aeronave." }, { status: 403 });
      }
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
      // Escopo de perfis (C3): fora do Administrador Geral, o alvo precisa estar
      // entre os perfis de aeronave que o chamador gerencia. Vale para situação,
      // nível, dados cadastrais, notas administrativas e redefinição de senha.
      if (!inScope(await actorScope(base44, user), target)) {
        return Response.json({ error: "Você não pode gerenciar um usuário fora do seu escopo de perfis de aeronave." }, { status: 403 });
      }

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
        // Hierarquia: não é possível alterar a situação de usuário de nível igual ou
        // superior ao do chamador (mesma regra aplicada em create, access_level,
        // convites e reset_password). O Administrador Geral segue com as regras próprias.
        if (actorLevel !== "admin_geral" && !canManageLevel(actorLevel, targetLevel)) {
          return Response.json({ error: "Você não pode alterar a situação de um usuário de nível igual ou superior ao seu." }, { status: 403 });
        }
        const sensitiveStatus = body.account_status === "desativada" || (targetLevel === "admin_geral" && body.account_status !== "ativa");
        if (sensitiveStatus) {
          const codeOk = await verifyAccessCode(base44, user, body.code, "change_account_status");
          if (!codeOk) return Response.json({ error: "Código de verificação inválido, expirado ou já utilizado. Solicite um novo código e tente novamente." }, { status: 403 });
        }
        // O registro autoritativo é gravado antes da alteração cadastral: se falhar,
        // a sanção não é aplicada (nenhuma situação existe apenas no campo do usuário).
        const statusRecorded = await setAccountStatusRecord(base44, target.id, body.account_status, user.full_name || user.email, body.reason || "");
        if (!statusRecorded) {
          return Response.json({ error: "Não foi possível registrar a situação da conta. Nenhuma alteração foi aplicada." }, { status: 500 });
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

      if (body.aircraft_profiles !== undefined) {
        // Ninguém altera os próprios perfis de aeronave, e quem não é Administrador
        // Geral só atribui perfis que gerencia, a usuários que pode gerenciar.
        if (target.id === user.id) {
          return Response.json({ error: "Você não pode alterar os próprios perfis de aeronave." }, { status: 403 });
        }
        if (actorLevel !== "admin_geral" && !canManageLevel(actorLevel, targetLevel)) {
          return Response.json({ error: "Você não pode alterar os perfis de aeronave de um usuário de nível igual ou superior ao seu." }, { status: 403 });
        }
        let profilesValue = null;
        if (body.aircraft_profiles) {
          const profilesError = validateProfiles(await actorScope(base44, user), body.aircraft_profiles);
          if (profilesError) return Response.json({ error: profilesError }, { status: 403 });
          profilesValue = JSON.stringify(parseProfiles(body.aircraft_profiles));
        }
        patch.aircraft_profiles = profilesValue;
        changes.push("Perfis de aeronave alterados");
      }

      if (body.profile && typeof body.profile === "object") {
        // Hierarquia: dados cadastrais de usuário de nível igual ou superior ao do
        // chamador não são editáveis — mesma regra aplicada em situação, nível,
        // convites e redefinição de senha.
        if (actorLevel !== "admin_geral" && !canManageLevel(actorLevel, targetLevel)) {
          return Response.json({ error: "Você não pode alterar os dados cadastrais de um usuário de nível igual ou superior ao seu." }, { status: 403 });
        }
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
      if (actorLevel !== "admin_geral") {
      return Response.json({ error: "Somente o Administrador Geral pode executar a migração." }, { status: 403 });
      }
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

    // ---------- MIGRATE USERS → OATS + AUTO-LINK ----------
    if (action === "migrate_oats") {
      if (actorLevel !== "admin_geral") return Response.json({ error: "Somente o Administrador Geral pode executar a migração de OATs." }, { status: 403 });
      const users = await base44.asServiceRole.entities.User.list().catch(() => []);
      const oats = await base44.asServiceRole.entities.Oat.list().catch(() => []);
      const oatsByUserId = new Map(oats.filter((o) => o.user_id).map((o) => [o.user_id, o]));
      const oatsByEmail = new Map();
      for (const o of oats) {
        const em = (o.email_login || o.email || "").toLowerCase();
        if (em && !oatsByEmail.has(em)) oatsByEmail.set(em, o);
      }
      const created = [];
      const linked = [];
      const skipped = [];
      for (const u of users) {
        const em = (u.email || "").toLowerCase();
        if (!em) continue;
        if (oatsByUserId.has(u.id)) { skipped.push(em); continue; }
        const existingOat = oatsByEmail.get(em);
        if (existingOat) {
          if (!existingOat.user_id) {
            await base44.asServiceRole.entities.Oat.update(existingOat.id, {
              user_id: u.id,
              email_login: u.email,
            }).catch(() => {});
            linked.push(em);
          } else {
            skipped.push(em);
          }
          continue;
        }
        try {
          await base44.asServiceRole.entities.Oat.create({
            full_name: u.full_name || u.email || "OAT",
            email: u.email,
            email_login: u.email,
            user_id: u.id,
            role: "oat",
            registration_status: "active",
            approval_status: "approved",
          });
          created.push(em);
        } catch {}
      }
      await logAudit(base44, user, null, "Migração usuário→OAT", `OATs criados: ${created.length} | Vinculados: ${linked.length} | Já vinculados: ${skipped.length}`);
      return Response.json({ ok: true, created: created.length, linked: linked.length, alreadyLinked: skipped.length });
    }

    // ---------- SET MASTER (Administrador Geral Master) ----------
    if (action === "set_master") {
      // Somente o Administrador Geral pode conceder perfil Master.
      if (actorLevel !== "admin_geral") return Response.json({ error: "Forbidden" }, { status: 403 });
      const codeOk = await verifyAccessCode(base44, user, body.code);
      if (!codeOk) return Response.json({ error: "Código de verificação inválido, expirado ou já utilizado. Solicite um novo código e tente novamente." }, { status: 403 });
      const targetId = body.user_id;
      if (!targetId) return Response.json({ error: "Usuário não informado." }, { status: 400 });
      const target = await base44.asServiceRole.entities.User.get(targetId).catch(() => null);
      if (!target) return Response.json({ error: "Usuário não encontrado." }, { status: 404 });
      const master = !!body.master;
      await setAccountStatusRecord(base44, targetId, "ativa", user.full_name || user.email, "Perfil Master");
      // Master é sempre Administrador Geral com acesso total.
      await base44.asServiceRole.entities.User.update(targetId, {
        access_level: "admin_geral",
        role: "admin",
        account_status: "ativa",
        is_master: master,
        custom_permissions: null, // acesso irrestrito
      });
      const recorded = await setAccountStatusRecord(base44, targetId, "ativa", user.full_name || user.email, "Perfil Master");
      if (!recorded) {
        return Response.json({ error: "Não foi possível registrar a situação da conta. Nenhuma alteração foi aplicada." }, { status: 500 });
      }
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
      const target = await base44.asServiceRole.entities.User.get(body.user_id).catch(() => null);
      if (!target) return Response.json({ error: "Usuário não encontrado." }, { status: 404 });
      const targetLevel = levelOf(target);
      if (actorLevel !== "admin_geral" && !canManageLevel(actorLevel, targetLevel)) {
        return Response.json({ error: "Você não pode redefinir a senha de um usuário de nível igual ou superior." }, { status: 403 });
      }
      if (!inScope(await actorScope(base44, user), target)) {
        return Response.json({ error: "Você não pode redefinir a senha de um usuário fora do seu escopo de perfis de aeronave." }, { status: 403 });
      }
      const codeOk = await verifyAccessCode(base44, user, body.code);
      if (!codeOk) return Response.json({ error: "Código de verificação inválido, expirado ou já utilizado. Solicite um novo código e tente novamente." }, { status: 403 });
      try {
        await base44.asServiceRole.auth.resetPasswordRequest(target.email);
      } catch {}
      await base44.asServiceRole.entities.User.update(target.id, { must_change_password: true });
      await logAudit(base44, user, target, AUDITABLE_ACTIONS.password_reset_requested, "Redefinição encaminhada pelo administrador");
      return Response.json({ ok: true });
    }

    // ---------- LIST PENDING APPROVALS ----------
    if (action === "list_approvals") {
      const [invites, pilots, aircraft, oats] = await Promise.all([
        base44.asServiceRole.entities.UserInvite.list().catch(() => []),
        base44.asServiceRole.entities.Pilot.list().catch(() => []),
        base44.asServiceRole.entities.Aircraft.list().catch(() => []),
        base44.asServiceRole.entities.Oat.list().catch(() => []),
      ]);
      const pendingInvites = invites
        .filter((i) => i.status === "pending" && (i.approval_status || "approved") === "pending")
        .map((i) => ({
          id: i.id,
          type: "user_invite",
          name: i.full_name || i.login || i.email,
          email: i.email,
          access_level: i.access_level,
          login: i.login || null,
          registration: i.registration || null,
          unit: i.unit || null,
          job_title: i.job_title || null,
          created_at: i.created_at,
          invited_by_name: i.invited_by_name || null,
          admin_notes: i.admin_notes || null,
          // O aprovador precisa ver o que está sendo concedido (C2/C3).
          aircraft_profiles: i.aircraft_profiles || null,
          custom_permissions: i.custom_permissions || null,
        }));
      const pendingPilots = pilots
        .filter((p) => p.approval_status === "pending")
        .map((p) => ({
          id: p.id,
          type: "pilot",
          name: p.full_name,
          war_name: p.war_name || null,
          email: p.email || null,
          role: p.role || null,
          base: p.base || null,
          anac_code: p.anac_code || null,
          registration: p.registration || null,
          created_date: p.created_date,
          created_by: p.created_by_id || null,
        }));
      const pendingAircraft = aircraft
        .filter((a) => (a.approval_status || "approved") === "pending")
        .map((a) => ({
          id: a.id,
          type: "aircraft",
          name: a.registration,
          model: a.model || null,
          manufacturer: a.manufacturer || null,
          year: a.year || null,
          status: a.status || null,
          created_date: a.created_date,
          created_by: a.created_by_id || null,
        }));
      const pendingOats = oats
        .filter((o) => (o.approval_status || "approved") === "pending")
        .map((o) => ({
          id: o.id,
          type: "oat",
          name: o.full_name,
          war_name: o.war_name || null,
          email: o.email || o.email_login || null,
          role: o.role || null,
          base: o.base || null,
          anac_code: o.anac_code || null,
          registration_status: o.registration_status || null,
          created_date: o.created_date,
          created_by: o.created_by_id || null,
        }));
      return Response.json({ invites: pendingInvites, pilots: pendingPilots, aircraft: pendingAircraft, oats: pendingOats });
    }

    // ---------- APPROVE / REJECT USER INVITE ----------
    if (action === "approve_invite") {
      if (actorLevel !== "admin_geral") return Response.json({ error: "Somente o Administrador Geral pode aprovar convites." }, { status: 403 });
      const invite = await base44.asServiceRole.entities.UserInvite.get(body.invite_id).catch(() => null);
      if (!invite) return Response.json({ error: "Convite não encontrado." }, { status: 404 });
      if (invite.status !== "pending") return Response.json({ error: "Convite já processado." }, { status: 400 });
      if ((invite.approval_status || "approved") !== "pending") return Response.json({ error: "Convite não está aguardando aprovação." }, { status: 400 });
      const role = invite.access_level === "admin_geral" || invite.access_level === "administrador" ? "admin" : "user";
      try {
        await base44.users.inviteUser(invite.email, role);
      } catch (inviteErr) {
        return Response.json({ error: `Falha ao enviar convite: ${inviteErr?.message || inviteErr}` }, { status: 500 });
      }
      await base44.asServiceRole.entities.UserInvite.update(body.invite_id, { approval_status: "approved" });
      await logAudit(base44, user, { email: invite.email, full_name: invite.full_name }, "Aprovação de convite", `Convite aprovado e enviado — ${invite.email}`);
      return Response.json({ ok: true, message: "Convite aprovado e enviado." });
    }

    if (action === "reject_invite") {
      if (actorLevel !== "admin_geral") return Response.json({ error: "Somente o Administrador Geral pode rejeitar convites." }, { status: 403 });
      const invite = await base44.asServiceRole.entities.UserInvite.get(body.invite_id).catch(() => null);
      if (!invite) return Response.json({ error: "Convite não encontrado." }, { status: 404 });
      if (invite.status !== "pending") return Response.json({ error: "Convite já processado." }, { status: 400 });
      await base44.asServiceRole.entities.UserInvite.update(body.invite_id, { approval_status: "rejected", status: "cancelled" });
      await logAudit(base44, user, { email: invite.email, full_name: invite.full_name }, "Rejeição de convite", `Convite rejeitado — ${invite.email}`);
      return Response.json({ ok: true, message: "Convite rejeitado." });
    }

    // ---------- APPROVE / REJECT PILOT ----------
    if (action === "approve_pilot") {
      if (actorLevel !== "admin_geral") return Response.json({ error: "Somente o Administrador Geral pode aprovar pilotos." }, { status: 403 });
      const pilot = await base44.asServiceRole.entities.Pilot.get(body.pilot_id).catch(() => null);
      if (!pilot) return Response.json({ error: "Piloto não encontrado." }, { status: 404 });
      if (pilot.approval_status !== "pending") return Response.json({ error: "Piloto não está aguardando aprovação." }, { status: 400 });
      const log = JSON.parse(pilot.approval_log || "[]");
      log.push({ action: "approved", by: user.full_name || user.email, at: new Date().toISOString() });
      await base44.asServiceRole.entities.Pilot.update(body.pilot_id, { approval_status: "approved", approval_log: JSON.stringify(log) });
      await logAudit(base44, user, { full_name: pilot.full_name }, "Aprovação de piloto", `Piloto aprovado — ${pilot.full_name}`);
      return Response.json({ ok: true, message: "Piloto aprovado." });
    }

    if (action === "reject_pilot") {
      if (actorLevel !== "admin_geral") return Response.json({ error: "Somente o Administrador Geral pode rejeitar pilotos." }, { status: 403 });
      const pilot = await base44.asServiceRole.entities.Pilot.get(body.pilot_id).catch(() => null);
      if (!pilot) return Response.json({ error: "Piloto não encontrado." }, { status: 404 });
      if (pilot.approval_status !== "pending") return Response.json({ error: "Piloto não está aguardando aprovação." }, { status: 400 });
      const log = JSON.parse(pilot.approval_log || "[]");
      log.push({ action: "rejected", by: user.full_name || user.email, at: new Date().toISOString(), reason: body.reason || null });
      await base44.asServiceRole.entities.Pilot.update(body.pilot_id, { approval_status: "rejected", approval_log: JSON.stringify(log) });
      await logAudit(base44, user, { full_name: pilot.full_name }, "Rejeição de piloto", `Piloto rejeitado — ${pilot.full_name}`);
      return Response.json({ ok: true, message: "Piloto rejeitado." });
    }

    // ---------- APPROVE / REJECT AIRCRAFT ----------
    if (action === "approve_aircraft") {
      if (actorLevel !== "admin_geral") return Response.json({ error: "Somente o Administrador Geral pode aprovar aeronaves." }, { status: 403 });
      const aircraft = await base44.asServiceRole.entities.Aircraft.get(body.aircraft_id).catch(() => null);
      if (!aircraft) return Response.json({ error: "Aeronave não encontrada." }, { status: 404 });
      if ((aircraft.approval_status || "approved") !== "pending") return Response.json({ error: "Aeronave não está aguardando aprovação." }, { status: 400 });
      const log = JSON.parse(aircraft.approval_log || "[]");
      log.push({ action: "approved", by: user.full_name || user.email, at: new Date().toISOString() });
      await base44.asServiceRole.entities.Aircraft.update(body.aircraft_id, { approval_status: "approved", approval_log: JSON.stringify(log) });
      await logAudit(base44, user, null, "Aprovação de aeronave", `Aeronave aprovada — ${aircraft.registration}`);
      return Response.json({ ok: true, message: "Aeronave aprovada." });
    }

    if (action === "reject_aircraft") {
      if (actorLevel !== "admin_geral") return Response.json({ error: "Somente o Administrador Geral pode rejeitar aeronaves." }, { status: 403 });
      const aircraft = await base44.asServiceRole.entities.Aircraft.get(body.aircraft_id).catch(() => null);
      if (!aircraft) return Response.json({ error: "Aeronave não encontrada." }, { status: 404 });
      if ((aircraft.approval_status || "approved") !== "pending") return Response.json({ error: "Aeronave não está aguardando aprovação." }, { status: 400 });
      const log = JSON.parse(aircraft.approval_log || "[]");
      log.push({ action: "rejected", by: user.full_name || user.email, at: new Date().toISOString(), reason: body.reason || null });
      await base44.asServiceRole.entities.Aircraft.update(body.aircraft_id, { approval_status: "rejected", approval_log: JSON.stringify(log) });
      await logAudit(base44, user, null, "Rejeição de aeronave", `Aeronave rejeitada — ${aircraft.registration}`);
      return Response.json({ ok: true, message: "Aeronave rejeitada." });
    }

    // ---------- APPROVE / REJECT OAT ----------
    if (action === "approve_oat") {
      if (actorLevel !== "admin_geral") return Response.json({ error: "Somente o Administrador Geral pode aprovar OATs." }, { status: 403 });
      const oat = await base44.asServiceRole.entities.Oat.get(body.oat_id).catch(() => null);
      if (!oat) return Response.json({ error: "OAT não encontrado." }, { status: 404 });
      if ((oat.approval_status || "approved") !== "pending") return Response.json({ error: "OAT não está aguardando aprovação." }, { status: 400 });
      const log = JSON.parse(oat.approval_log || "[]");
      log.push({ action: "approved", by: user.full_name || user.email, at: new Date().toISOString() });
      await base44.asServiceRole.entities.Oat.update(body.oat_id, { approval_status: "approved", approval_log: JSON.stringify(log) });
      await logAudit(base44, user, { full_name: oat.full_name }, "Aprovação de OAT", `OAT aprovado — ${oat.full_name}`);
      return Response.json({ ok: true, message: "OAT aprovado." });
    }

    if (action === "reject_oat") {
      if (actorLevel !== "admin_geral") return Response.json({ error: "Somente o Administrador Geral pode rejeitar OATs." }, { status: 403 });
      const oat = await base44.asServiceRole.entities.Oat.get(body.oat_id).catch(() => null);
      if (!oat) return Response.json({ error: "OAT não encontrado." }, { status: 404 });
      if ((oat.approval_status || "approved") !== "pending") return Response.json({ error: "OAT não está aguardando aprovação." }, { status: 400 });
      const log = JSON.parse(oat.approval_log || "[]");
      log.push({ action: "rejected", by: user.full_name || user.email, at: new Date().toISOString(), reason: body.reason || null });
      await base44.asServiceRole.entities.Oat.update(body.oat_id, { approval_status: "rejected", approval_log: JSON.stringify(log) });
      await logAudit(base44, user, { full_name: oat.full_name }, "Rejeição de OAT", `OAT rejeitado — ${oat.full_name}`);
      return Response.json({ ok: true, message: "OAT rejeitado." });
    }

    return Response.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}