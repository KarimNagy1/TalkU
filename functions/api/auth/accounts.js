import {
  createPasswordRecord,
  getAdmin,
  json,
  randomToken,
  sameOrigin
} from "./_utils.js";

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/;

async function requireOwner(request, env) {
  const admin = await getAdmin(request, env);
  if (!admin) {
    return { error: json({ error: "Authentication required." }, 401) };
  }
  if (admin.role !== "owner") {
    return { error: json({ error: "Owner access required." }, 403) };
  }
  return { admin };
}

export async function onRequestGet({ request, env }) {
  try {
    const auth = await requireOwner(request, env);
    if (auth.error) return auth.error;

    const result = await env.DB.prepare(`
      SELECT id, username, role, is_active, created_at
      FROM admin_users
      ORDER BY created_at ASC, username COLLATE NOCASE ASC
    `).all();

    return json({ accounts: result.results || [] });
  } catch (error) {
    console.error("Admin account listing failed:", error);
    return json({ error: "Unable to load administrator accounts." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    if (!sameOrigin(request)) {
      return json({ error: "Invalid request origin." }, 403);
    }

    const auth = await requireOwner(request, env);
    if (auth.error) return auth.error;

    if (!request.headers.get("Content-Type")?.toLowerCase().includes("application/json")) {
      return json({ error: "Content-Type must be application/json." }, 415);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body." }, 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ error: "Invalid request body." }, 400);
    }

    const username = typeof body.username === "string"
      ? body.username.trim()
      : "";
    const password = typeof body.password === "string"
      ? body.password
      : "";

    if (!USERNAME_PATTERN.test(username)) {
      return json({
        error: "Username must be 3–32 characters using letters, numbers, dots, underscores, or hyphens."
      }, 400);
    }

    if (password.length < 12 || password.length > 256) {
      return json({
        error: "Password must be between 12 and 256 characters."
      }, 400);
    }

    const existing = await env.DB.prepare(`
      SELECT id FROM admin_users WHERE username = ? COLLATE NOCASE LIMIT 1
    `).bind(username).first();

    if (existing) {
      return json({ error: "That username is already in use." }, 409);
    }

    const id = randomToken(18);
    const passwordHash = await createPasswordRecord(password);

    await env.DB.prepare(`
      INSERT INTO admin_users (id, username, password_hash, role, is_active)
      VALUES (?, ?, ?, 'admin', 1)
    `).bind(id, username, passwordHash).run();

    return json({
      ok: true,
      account: {
        id,
        username,
        role: "admin",
        is_active: 1
      }
    }, 201);
  } catch (error) {
    if (error?.message?.includes("UNIQUE constraint failed")) {
      return json({ error: "That username is already in use." }, 409);
    }

    console.error("Admin account creation failed:", error);
    return json({ error: "Unable to create the administrator account." }, 500);
  }
}
