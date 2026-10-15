
import {
  createPasswordRecord,
  getAdmin,
  json,
  sameOrigin,
  verifyPassword
} from "./_utils.js";

const SESSION_COOKIE = "__Host-talku_fund_session";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ error: "Cross-origin request rejected." }, 403);
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return json({ error: "Content-Type must be application/json." }, 415);
  }

  try {
    const admin = await getAdmin(request, env);

    if (!admin) {
      return json({ error: "Authentication required." }, 401);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body." }, 400);
    }

    const currentPassword =
      typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : "";

    if (
      currentPassword.length < 1 ||
      currentPassword.length > 256 ||
      newPassword.length < 12 ||
      newPassword.length > 256
    ) {
      return json({
        error: "Enter your current password and a new password of 12–256 characters."
      }, 400);
    }

    const user = await env.DB.prepare(`
      SELECT password_hash
      FROM admin_users
      WHERE id = ? AND is_active = 1
      LIMIT 1
    `).bind(admin.id).first();

    if (!user || !(await verifyPassword(currentPassword, user.password_hash))) {
      return json({ error: "Current password is incorrect." }, 401);
    }

    if (currentPassword === newPassword) {
      return json({
        error: "The new password must be different from the current password."
      }, 400);
    }

    const passwordHash = await createPasswordRecord(newPassword);

    const results = await env.DB.batch([
      env.DB.prepare(`
        UPDATE admin_users
        SET password_hash = ?
        WHERE id = ? AND is_active = 1
      `).bind(passwordHash, admin.id),
      env.DB.prepare(`
        DELETE FROM admin_sessions
        WHERE admin_user_id = ?
      `).bind(admin.id)
    ]);
    if (Number(results?.[0]?.meta?.changes || 0) !== 1) {
      return json(
        { error: "Unable to change the password. Please sign in again." },
        409
      );
    }

    return json(
      {
        ok: true,
        message: "Password changed. Please sign in again."
      },
      200,
      {
        "Set-Cookie":
          `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
      }
    );
  } catch (error) {
    console.error("Password change failed:", error);
    return json({ error: "Unable to change the password right now." }, 500);
  }
}
