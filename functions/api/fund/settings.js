import { getAdmin, json, sameOrigin } from "../auth/_utils.js";

const MAX_AMOUNT_PIASTERS = 1000000000000;

function validMonth(value) {
  return typeof value === "string" &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function validAmount(value) {
  return Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= MAX_AMOUNT_PIASTERS;
}

// Public read-only monthly settings.
export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(`
      SELECT
        month,
        target_piasters,
        opening_balance_piasters
      FROM fund_month_settings
      ORDER BY month DESC
    `).all();

    return json({ settings: result.results || [] });
  } catch (error) {
    console.error("Fund settings query failed:", error);
    return json({ error: "Unable to load fund settings." }, 500);
  }
}

// Protected monthly settings update.
export async function onRequestPut({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ error: "Cross-origin request rejected." }, 403);
  }

  let admin;

  try {
    admin = await getAdmin(request, env);
  } catch (error) {
    console.error("Fund settings session verification failed:", error);
    return json({ error: "Unable to verify admin session." }, 500);
  }

  if (!admin) {
    return json({ error: "Admin authentication required." }, 401);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "Content-Type must be application/json." }, 415);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request." }, 400);
  }

  const month = body?.month;
  const target = body?.target_piasters;
  const opening = body?.opening_balance_piasters;

  if (!validMonth(month)) {
    return json({ error: "Month must use YYYY-MM format." }, 400);
  }

  if (!validAmount(target) || !validAmount(opening)) {
    return json(
      { error: "Target and opening balance must be non-negative integer amounts in piastres." },
      400
    );
  }

  try {
    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO fund_month_settings (
          month,
          target_piasters,
          opening_balance_piasters,
          updated_at
        )
        VALUES (
          ?, ?, ?,
          strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        )
        ON CONFLICT(month) DO UPDATE SET
          target_piasters = excluded.target_piasters,
          opening_balance_piasters = excluded.opening_balance_piasters,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      `).bind(month, target, opening),
      env.DB.prepare(`
        INSERT INTO admin_audit_log (
          actor_username, action, entry_id, details
        )
        VALUES (?, 'settings.update', NULL, ?)
      `).bind(
        admin.username,
        JSON.stringify({
          month,
          target_piasters: target,
          opening_balance_piasters: opening
        })
      )
    ]);

    return json({ ok: true, month });
  } catch (error) {
    console.error("Fund settings update failed:", error);
    return json({ error: "Unable to update fund settings." }, 500);
  }
}
