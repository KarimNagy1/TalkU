import {
  constantTimeEqual,
  createPasswordRecord,
  json,
  randomToken,
  sameOrigin
} from "./_utils.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ error: "Cross-origin request rejected." }, 403);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "Invalid request." }, 415);
  }

  if (!env.OWNER_SETUP_SECRET) {
    return json({ error: "Owner setup is not enabled." }, 404);
  }

  const authorization = request.headers.get("Authorization") || "";
  const suppliedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!constantTimeEqual(suppliedSecret, env.OWNER_SETUP_SECRET)) {
    return json({ error: "Setup is not authorized." }, 403);
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

  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    return json(
      {
        error:
          "Username must be 3–32 characters and use only letters, numbers, dots, underscores, or hyphens."
      },
      400
    );
  }

  if (password.length < 12 || password.length > 256) {
    return json(
      { error: "Password must be between 12 and 256 characters." },
      400
    );
  }

  try {
    const existing = await env.DB.prepare(`
      SELECT id FROM admin_users LIMIT 1
    `).first();

    if (existing) {
      return json({ error: "Owner setup has already been completed." }, 409);
    }

    const id = randomToken(16);
    const passwordRecord = await createPasswordRecord(password);

    const result = await env.DB.prepare(`
      INSERT INTO admin_users
        (id, username, password_hash, role, is_active)
      SELECT ?, ?, ?, 'owner', 1
      WHERE NOT EXISTS (
        SELECT 1 FROM admin_users
      )
    `).bind(id, username, passwordRecord).run();

    if (Number(result.meta?.changes || 0) !== 1) {
      return json(
        { error: "Owner setup has already been completed." },
        409
      );
    }

    return json(
      {
        ok: true,
        message: "Owner account created. You can now sign in."
      },
      201
    );
  } catch (error) {
    if (error?.message?.includes("UNIQUE constraint failed")) {
      return json({ error: "That username is already in use." }, 409);
    }

    console.error("Owner setup failed:", error);
    return json({ error: "Owner setup is temporarily unavailable." }, 500);
  }
}
