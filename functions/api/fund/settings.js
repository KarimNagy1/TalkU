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

    return Response.json(
      { settings: result.results || [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Fund settings query failed:", error);

    return Response.json(
      { error: "Unable to load fund settings." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
