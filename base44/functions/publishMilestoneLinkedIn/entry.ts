import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

const CONNECTOR_ID = "6ac678fd8ca0552cee16b417";

async function getMemberProfile(accessToken) {
  // Tenta v2/me (requer r_basicprofile)
  const res = await fetch("https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,headline)", {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  });
  if (res.ok) {
    const data = await res.json();
    return { id: data.id, profile: data };
  }
  // Fallback: endpoint userinfo (openid/profile)
  const res2 = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  });
  if (res2.ok) {
    const data = await res2.json();
    return { id: data.sub, profile: data };
  }
  throw new Error("Não foi possível obter o perfil do LinkedIn. Verifique as permissões concedidas.");
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    const getConnection = async () => {
      return await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    };

    // ---------- STATUS ----------
    if (action === "status") {
      try {
        const { accessToken } = await getConnection();
        const { id, profile } = await getMemberProfile(accessToken);
        return Response.json({ connected: true, member_id: id, profile });
      } catch {
        return Response.json({ connected: false }, { status: 200 });
      }
    }

    // ---------- PUBLISH ----------
    if (action === "publish") {
      const milestoneId = body.milestone_id;
      if (!milestoneId) return Response.json({ error: "Marco não informado." }, { status: 400 });

      const milestone = await base44.asServiceRole.entities.ProjectMilestone.get(milestoneId);
      if (!milestone) return Response.json({ error: "Marco não encontrado." }, { status: 404 });

      const { accessToken } = await getConnection();
      const { id: memberId } = await getMemberProfile(accessToken);
      const author = `urn:li:person:${memberId}`;

      const postText =
        milestone.linkedin_text ||
        `🏆 ${milestone.title}\n\n${milestone.description || ""}\n\n#RSandoliTraining #Aviação #Helicópteros #AW119Kx`;

      const ugcRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: postText },
              shareMediaCategory: "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberShareVisibility": "PUBLIC",
          },
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!ugcRes.ok) {
        const errBody = await ugcRes.text();
        return Response.json({ error: `LinkedIn API ${ugcRes.status}: ${errBody}` }, { status: 502 });
      }

      const ugcData = await ugcRes.json();
      const postUrn = ugcData.id || ugcData.activity;

      await base44.asServiceRole.entities.ProjectMilestone.update(milestoneId, {
        linkedin_post_urn: postUrn,
        published_at: new Date().toISOString(),
        status: "publicado",
      });

      return Response.json({ ok: true, post_urn: postUrn });
    }

    return Response.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}