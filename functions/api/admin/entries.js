import { getAdmin, json } from "../auth/_utils.js";

export async function onRequestGet({ request, env }) {
  let admin;

  try {
    admin = await getAdmin(request, env);
  } catch (error) {
    console.error("Private entries session verification failed:", error);
    return json({ error: "Unable to verify admin session." }, 500);
  }

  if (!admin) {
    return json({ error: "Admin authentication required." }, 401);
  }

  try {
    const result = await env.DB.prepare(`
      SELECT
        id,
        entry_type,
        amount_piasters,
        currency,
        description,
        entry_date,
        donor_private_name,
        donor_display_name,
        donor_name_visibility,
        payee_name,
        created_at,
        updated_at
      FROM fund_entries
      ORDER BY entry_date DESC, created_at DESC
    `).all();

    return json({
      entries: result.results || [],
      admin: {
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Private fund entries query failed:", error);
    return json({ error: "Unable to load private fund entries." }, 500);
  }
}
