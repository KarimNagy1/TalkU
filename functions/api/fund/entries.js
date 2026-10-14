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

      // Never return donor_private_name from the public API.
      public_name:
        row.entry_type === "donation"
          ? (
              row.donor_name_visibility === "public"
                ? row.donor_display_name || null
                : null
            )
          : row.payee_name || null
    }));

    return Response.json(
      { entries },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Public fund entries query failed:", error);

    return Response.json(
      { error: "Unable to load fund entries." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
