import { getAdmin, json } from "./_utils.js";

export async function onRequestGet({ request, env }) {
  try {
    const admin = await getAdmin(request, env);

    if (!admin) {
      return json({ authenticated: false }, 401);
    }

    return json({
      authenticated: true,
      admin: {
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Admin session check failed:", error);
    return json({ error: "Unable to verify session." }, 500);
  }
}
