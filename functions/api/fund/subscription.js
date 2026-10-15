import { getAdmin, json, sameOrigin } from "../auth/_utils.js";

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
}

function nextRenewalDate(anchor, interval, today = new Date().toISOString().slice(0, 10)) {
  const [ay, am, ad] = anchor.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);

  function makeDate(year, monthIndex, day) {
    const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const date = new Date(Date.UTC(year, monthIndex, Math.min(day, lastDay)));
    return date.toISOString().slice(0, 10);
  }

  if (interval === "yearly") {
    let year = Math.max(ay, ty);
    let candidate = makeDate(year, am - 1, ad);
    if (candidate < today) candidate = makeDate(++year, am - 1, ad);
    return candidate;
  }

  let monthIndex = (ay - 1) * 12 + (am - 1);
  const todayMonthIndex = (ty - 1) * 12 + (tm - 1);
  monthIndex = Math.max(monthIndex, todayMonthIndex);

  let year = Math.floor(monthIndex / 12) + 1;
  let month = monthIndex % 12;
  let candidate = makeDate(year, month, ad);

  if (candidate < today) {
    monthIndex++;
    year = Math.floor(monthIndex / 12) + 1;
    month = monthIndex % 12;
    candidate = makeDate(year, month, ad);
  }

  return candidate;
}

// Public response contains only the schedule, never admin or donor data.
export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(`
      SELECT anchor_date, renewal_interval
      FROM fund_subscription_settings
      WHERE id = 1
    `).first();

    if (!result) return json({ subscription: null });

    return json({
      subscription: {
        anchor_date: result.anchor_date,
        renewal_interval: result.renewal_interval,
        next_renewal_date: nextRenewalDate(
          result.anchor_date,
          result.renewal_interval
        )
      }
    });
  } catch (error) {
    console.error("Subscription schedule query failed:", error);
    return json({ error: "Unable to load the subscription schedule." }, 500);
  }
}

// Only an authenticated admin can change the schedule.
export async function onRequestPut({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ error: "Cross-origin request rejected." }, 403);
  }

  let admin;
  try {
    admin = await getAdmin(request, env);
  } catch (error) {
    console.error("Subscription session verification failed:", error);
    return json({ error: "Unable to verify admin session." }, 500);
  }

  if (!admin) return json({ error: "Admin authentication required." }, 401);

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "Content-Type must be application/json." }, 415);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request." }, 400);
  }

  const anchorDate = body?.anchor_date;
  const interval = body?.renewal_interval;

  if (!validDate(anchorDate)) {
    return json({ error: "A valid anchor date in YYYY-MM-DD format is required." }, 400);
  }

  if (!["monthly", "yearly"].includes(interval)) {
    return json({ error: "Renewal interval must be monthly or yearly." }, 400);
  }

  try {
    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO fund_subscription_settings (
          id, anchor_date, renewal_interval, updated_at
        )
        VALUES (
          1, ?, ?,
          strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        )
        ON CONFLICT(id) DO UPDATE SET
          anchor_date = excluded.anchor_date,
          renewal_interval = excluded.renewal_interval,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      `).bind(anchorDate, interval),
      env.DB.prepare(`
        INSERT INTO admin_audit_log (
          actor_username, action, entry_id, details
        )
        VALUES (?, 'subscription.update', NULL, ?)
      `).bind(
        admin.username,
        JSON.stringify({ anchor_date: anchorDate, renewal_interval: interval })
      )
    ]);

    return json({
      ok: true,
      anchor_date: anchorDate,
      renewal_interval: interval,
      next_renewal_date: nextRenewalDate(anchorDate, interval)
    });
  } catch (error) {
    console.error("Subscription schedule update failed:", error);
    return json({ error: "Unable to save the subscription schedule." }, 500);
  }
}
