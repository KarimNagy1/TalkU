import {
  SESSION_TTL_SECONDS,
  hashPassword,
  json,
  randomToken,
  sessionCookie,
  sha256,
  verifyPassword,
  sameOrigin
} from "./_utils.js";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ error: "Cross-origin request rejected." }, 403);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "Invalid request." }, 415);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request." }, 400);
  }

  const username =
    typeof body?.username === "string" ? body.username.trim() : "";
  const password =
    typeof body?.password === "string" ? body.password : "";

  if (
    username.length < 1 ||
    username.length > 64 ||
    password.length < 1 ||
    password.length > 256
  ) {
    return json({ error: "Invalid username or password." }, 400);
  }

  let attemptId = null;

  try {
    // Cloudflare supplies this header. Do not trust a client-provided
    // X-Forwarded-For header for rate limiting.
    const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
    const usernameKey = await sha256(username.toLowerCase());
    const ipKey = `ip:${await sha256(clientIp)}`;

    // Keep the rate-limit table bounded.
    await env.DB.prepare(`
      DELETE FROM admin_login_attempts
      WHERE julianday(attempted_at) <= julianday('now', '-1 day')
    `).run();

    // Count completed failures before registering this new attempt.
    const attempts = await env.DB.prepare(`
      SELECT
        COALESCE(SUM(
          CASE WHEN username_key = ? THEN 1 ELSE 0 END
        ), 0) AS username_attempts,
        COALESCE(SUM(
          CASE WHEN username_key = ? THEN 1 ELSE 0 END
        ), 0) AS ip_attempts
      FROM admin_login_attempts
      WHERE status IN ('pending', 'failed')
        AND julianday(attempted_at) >
            julianday('now', '-' || ? || ' minutes')
    `).bind(usernameKey, ipKey, WINDOW_MINUTES).first();

    if (
      Number(attempts?.username_attempts || 0) >= MAX_ATTEMPTS ||
      Number(attempts?.ip_attempts || 0) >= MAX_ATTEMPTS
    ) {
      return json(
        { error: "Too many login attempts. Please try again later." },
        429
      );
    }

    // Pending attempts are not counted as failures.
    // Two rows track the username and client IP independently.
    attemptId = randomToken(16);

    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO admin_login_attempts
          (username_key, attempt_id, succeeded, status)
        VALUES (?, ?, 0, 'pending')
      `).bind(usernameKey, attemptId),
      env.DB.prepare(`
        INSERT INTO admin_login_attempts
          (username_key, attempt_id, succeeded, status)
        VALUES (?, ?, 0, 'pending')
      `).bind(ipKey, attemptId)
    ]);

    const user = await env.DB.prepare(`
      SELECT id, username, password_hash, role, is_active
      FROM admin_users
      WHERE username = ? COLLATE NOCASE
      LIMIT 1
    `).bind(username).first();

    let validPassword = false;

    if (user) {
      validPassword = await verifyPassword(password, user.password_hash);
    } else {
      // Perform a password-hashing operation to reduce username timing leaks.
      await hashPassword(password, "talku-dummy-salt");
    }

    const success = Boolean(
      user && user.is_active === 1 && validPassword
    );

    if (!success) {
      // Only completed, unsuccessful authentication becomes a failure.
      await env.DB.prepare(`
        UPDATE admin_login_attempts
        SET status = 'failed', succeeded = 0
        WHERE attempt_id = ?
      `).bind(attemptId).run();

      attemptId = null;

      return json({ error: "Invalid username or password." }, 401);
    }

    const token = randomToken();
    const tokenHash = await sha256(token);
    const sessionId = randomToken(16);

    await env.DB.prepare(`
      INSERT INTO admin_sessions
        (id, admin_user_id, token_hash, expires_at)
      VALUES (
        ?, ?, ?,
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+8 hours')
      )
    `).bind(sessionId, user.id, tokenHash).run();

    // Successful attempts are removed. Clear previous failures for this
    // username, while preserving failures recorded against the client IP.
    await env.DB.batch([
      env.DB.prepare(`
        DELETE FROM admin_login_attempts
        WHERE attempt_id = ?
      `).bind(attemptId),
      env.DB.prepare(`
        DELETE FROM admin_login_attempts
        WHERE username_key = ? AND status = 'failed'
      `).bind(usernameKey)
    ]);

    attemptId = null;

    return json(
      { ok: true, username: user.username, role: user.role },
      200,
      { "Set-Cookie": sessionCookie(token, SESSION_TTL_SECONDS) }
    );
  } catch (error) {
    // Avoid leaving pending attempts behind if an operation fails.
    if (attemptId) {
      try {
        await env.DB.prepare(`
          UPDATE admin_login_attempts
          SET status = 'failed', succeeded = 0
          WHERE attempt_id = ? AND status = 'pending'
        `).bind(attemptId).run();
      } catch (cleanupError) {
        console.error("Login attempt cleanup failed:", cleanupError);
      }
    }

    console.error("Admin login failed:", error);

    return json(
      { error: "Login is temporarily unavailable." },
      500
    );
  }
}
