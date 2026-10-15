import { getAdmin, json, sameOrigin } from "./_utils.js";

const SESSION_COOKIE = "__Host-talku_fund_session";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) {
    return json(
      { error: "Cross-origin request rejected." },
      403,
      {
        "Set-Cookie":
          `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
      }
    );
  }

  try {
    const admin = await getAdmin(request, env);

    if (admin?.session_id) {
      await env.DB.prepare(`
        DELETE FROM admin_sessions
        WHERE id = ?
      `).bind(admin.session_id).run();
    }

    return json(
      { ok: true },
      200,
      {
        "Set-Cookie":
          `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
      }
    );
  } catch (error) {
    console.error("Admin logout failed:", error);
    return json({ error: "Unable to log out right now." }, 500);
  }
}
