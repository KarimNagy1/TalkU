const SESSION_COOKIE = "__Host-talku_fund_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const PASSWORD_ITERATIONS = 100000;

function json(data, status = 200, headers = {}) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function randomToken(byteLength = 32) {
  return base64url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

async function sha256(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return base64url(new Uint8Array(digest));
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: new TextEncoder().encode(salt),
      iterations: PASSWORD_ITERATIONS
    },
    key,
    256
  );

  return base64url(new Uint8Array(bits));
}

function constantTimeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function createPasswordRecord(password) {
  const salt = randomToken(16);
  const hash = await hashPassword(password, salt);
  return `pbkdf2$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

async function verifyPassword(password, storedRecord) {
  if (typeof storedRecord !== "string") return false;

  const parts = storedRecord.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;

  const iterations = Number(parts[1]);
  const salt = parts[2];
  const expectedHash = parts[3];

  if (
    iterations !== PASSWORD_ITERATIONS ||
    !salt ||
    !expectedHash
  ) {
    return false;
  }

  const candidate = await hashPassword(password, salt);
  return constantTimeEqual(candidate, expectedHash);
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  for (const part of cookie.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    if (part.slice(0, index).trim() === name) {
      return part.slice(index + 1).trim();
    }
  }
  return null;
}

function sessionCookie(token, maxAge = SESSION_TTL_SECONDS) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function getAdmin(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;

  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(`
    SELECT
      admin_users.id,
      admin_users.username,
      admin_users.role,
      admin_sessions.id AS session_id
    FROM admin_sessions
    JOIN admin_users
      ON admin_users.id = admin_sessions.admin_user_id
    WHERE admin_sessions.token_hash = ?
      AND admin_sessions.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      AND admin_users.is_active = 1
    LIMIT 1
  `).bind(tokenHash).first();

  return row || null;
}

export {
  SESSION_TTL_SECONDS,
  constantTimeEqual,
  createPasswordRecord,
  getAdmin,
  hashPassword,
  json,
  randomToken,
  sessionCookie,
  sameOrigin,
  sha256,
  verifyPassword
};
