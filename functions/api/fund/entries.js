import { getAdmin, json, randomToken, sameOrigin } from "../auth/_utils.js";

const MAX_AMOUNT_PIASTERS = 1000000000000;

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value;
}

function optionalText(value, maxLength) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return undefined;

  const text = value.trim();
  if (text.length > maxLength) return undefined;

  return text || null;
}

function validateEntry(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Invalid entry." };
  }

  const { type, amount_piasters, description, date } = body;

  if (type !== "donation" && type !== "expense") {
    return { error: "Type must be donation or expense." };
  }

  if (
    !Number.isSafeInteger(amount_piasters) ||
    amount_piasters < 1 ||
    amount_piasters > MAX_AMOUNT_PIASTERS
  ) {
    return { error: "Amount must be a valid positive integer in piastres." };
  }

  if (
    typeof description !== "string" ||
    !description.trim() ||
    description.trim().length > 500
  ) {
    return { error: "Description is required and must be at most 500 characters." };
  }

  if (!validDate(date)) {
    return { error: "Date must be a valid YYYY-MM-DD date." };
  }

  const donorPrivateName = optionalText(body.donor_private_name, 150);
  const donorDisplayName = optionalText(body.donor_display_name, 100);
  const payeeName = optionalText(body.payee_name, 150);

  if (
    donorPrivateName === undefined ||
    donorDisplayName === undefined ||
    payeeName === undefined
  ) {
    return { error: "Names must be valid text within the allowed length." };
  }

  const visibility = body.donor_name_visibility ?? "anonymous";

  if (visibility !== "anonymous" && visibility !== "public") {
    return { error: "Invalid donor name visibility." };
  }

  if (type === "donation") {
    if (visibility === "public" && !donorDisplayName) {
      return { error: "A display name is required when publishing a donor's name." };
    }

    return {
      value: {
        type,
        amount: amount_piasters,
        description: description.trim(),
        date,
        donorPrivateName,
        donorDisplayName,
        visibility,
        payeeName: null
      }
    };
  }

  return {
    value: {
      type,
      amount: amount_piasters,
      description: description.trim(),
      date,
      donorPrivateName: null,
      donorDisplayName: null,
      visibility: "anonymous",
      payeeName
    }
  };
}

async function requireAdmin(request, env) {
  try {
    const admin = await getAdmin(request, env);
    return { admin: admin || null, error: false };
  } catch (error) {
    console.error("Fund admin session verification failed:", error);
    return { admin: null, error: true };
  }
}

async function readJson(request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return { response: json({ error: "Content-Type must be application/json." }, 415) };
  }

  try {
    return { body: await request.json() };
  } catch {
    return { response: json({ error: "Invalid JSON request." }, 400) };
  }
}

// Public ledger. Never select or return donor_private_name.
export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(`
      SELECT
        id,
        entry_type,
        amount_piasters,
        description,
        entry_date,
        donor_display_name,
        donor_name_visibility,
        payee_name,
        created_at
      FROM fund_entries
      ORDER BY entry_date DESC, created_at DESC
    `).all();

    const entries = (result.results || []).map((row) => ({
      id: row.id,
      type: row.entry_type,
      amount_piasters: row.amount_piasters,
      description: row.description,
      date: row.entry_date,
      public_name:
        row.entry_type === "donation"
          ? (
              row.donor_name_visibility === "public"
                ? row.donor_display_name || null
                : null
            )
          : row.payee_name || null
    }));

    return json({ entries });
  } catch (error) {
    console.error("Public fund entries query failed:", error);
    return json({ error: "Unable to load fund entries." }, 500);
  }
}

// Create an entry. Requires an authenticated admin.
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ error: "Cross-origin request rejected." }, 403);
  }

  const auth = await requireAdmin(request, env);
  if (auth.error) {
    return json({ error: "Unable to verify admin session." }, 500);
  }
  const admin = auth.admin;
  if (!admin) return json({ error: "Admin authentication required." }, 401);

  const parsed = await readJson(request);
  if (parsed.response) return parsed.response;

  const validated = validateEntry(parsed.body);
  if (validated.error) return json({ error: validated.error }, 400);

  const entry = validated.value;
  const id = randomToken(16);

  try {
    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO fund_entries (
          id, entry_type, amount_piasters, currency, description,
          entry_date, donor_private_name, donor_display_name,
          donor_name_visibility, payee_name
        ) VALUES (?, ?, ?, 'EGP', ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        entry.type,
        entry.amount,
        entry.description,
        entry.date,
        entry.donorPrivateName,
        entry.donorDisplayName,
        entry.visibility,
        entry.payeeName
      ),
      env.DB.prepare(`
        INSERT INTO admin_audit_log (actor_username, action, entry_id, details)
        VALUES (?, 'entry.create', ?, ?)
      `).bind(
        admin.username,
        id,
        JSON.stringify({
          type: entry.type,
          amount_piasters: entry.amount,
          date: entry.date
        })
      )
    ]);

    return json({ ok: true, id }, 201);
  } catch (error) {
    console.error("Fund entry creation failed:", error);
    return json({ error: "Unable to create fund entry." }, 500);
  }
}

// Update an existing entry. Requires an authenticated admin.
export async function onRequestPut({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ error: "Cross-origin request rejected." }, 403);
  }

  const auth = await requireAdmin(request, env);
  if (auth.error) {
    return json({ error: "Unable to verify admin session." }, 500);
  }
  const admin = auth.admin;
  if (!admin) return json({ error: "Admin authentication required." }, 401);

  const parsed = await readJson(request);
  if (parsed.response) return parsed.response;

  const id = typeof parsed.body?.id === "string" ? parsed.body.id.trim() : "";
  if (!id || id.length > 128) {
    return json({ error: "A valid entry ID is required." }, 400);
  }

  const validated = validateEntry(parsed.body);
  if (validated.error) return json({ error: validated.error }, 400);

  const entry = validated.value;

  try {
    const result = await env.DB.batch([
      env.DB.prepare(`
        UPDATE fund_entries
        SET
          entry_type = ?,
          amount_piasters = ?,
          description = ?,
          entry_date = ?,
          donor_private_name = ?,
          donor_display_name = ?,
          donor_name_visibility = ?,
          payee_name = ?,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ?
      `).bind(
        entry.type,
        entry.amount,
        entry.description,
        entry.date,
        entry.donorPrivateName,
        entry.donorDisplayName,
        entry.visibility,
        entry.payeeName,
        id
      ),
      env.DB.prepare(`
        INSERT INTO admin_audit_log (actor_username, action, entry_id, details)
        SELECT ?, 'entry.update', ?, ?
        WHERE EXISTS (SELECT 1 FROM fund_entries WHERE id = ?)
      `).bind(
        admin.username,
        id,
        JSON.stringify({
          type: entry.type,
          amount_piasters: entry.amount,
          date: entry.date
        }),
        id
      )
    ]);

    if (Number(result[0]?.meta?.changes || 0) !== 1) {
      return json({ error: "Entry not found." }, 404);
    }

    return json({ ok: true, id });
  } catch (error) {
    console.error("Fund entry update failed:", error);
    return json({ error: "Unable to update fund entry." }, 500);
  }
}

// Delete an entry. Requires an authenticated admin.
export async function onRequestDelete({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ error: "Cross-origin request rejected." }, 403);
  }

  const auth = await requireAdmin(request, env);
  if (auth.error) {
    return json({ error: "Unable to verify admin session." }, 500);
  }
  const admin = auth.admin;
  if (!admin) return json({ error: "Admin authentication required." }, 401);

  const id = new URL(request.url).searchParams.get("id")?.trim() || "";
  if (!id || id.length > 128) {
    return json({ error: "A valid entry ID is required in the id query parameter." }, 400);
  }

  try {
    const result = await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO admin_audit_log (actor_username, action, entry_id, details)
        SELECT ?, 'entry.delete', id,
          json_object('type', entry_type, 'amount_piasters', amount_piasters, 'date', entry_date)
        FROM fund_entries
        WHERE id = ?
      `).bind(admin.username, id),
      env.DB.prepare(`
        DELETE FROM fund_entries WHERE id = ?
      `).bind(id)
    ]);

    if (Number(result[1]?.meta?.changes || 0) !== 1) {
      return json({ error: "Entry not found." }, 404);
    }

    return json({ ok: true, id });
  } catch (error) {
    console.error("Fund entry deletion failed:", error);
    return json({ error: "Unable to delete fund entry." }, 500);
  }
}
