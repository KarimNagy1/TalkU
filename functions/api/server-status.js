const TALKU_API_URL = "https://talku.ddns.net:8000/connected_users/";
const TIMEOUT_MS = 4000;

export async function onRequest() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(TALKU_API_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      return Response.json(
        {
          status: "unavailable",
          service: "talku-api",
          message: "TalkU API did not return a successful response."
        },
        {
          status: 503,
          headers: { "Cache-Control": "no-store" }
        }
      );
    }

    const data = await response.json();

    if (
      !Number.isInteger(data.connected_users) ||
      data.connected_users < 0
    ) {
      return Response.json(
        {
          status: "unavailable",
          service: "talku-api",
          message: "TalkU API returned an unexpected response."
        },
        {
          status: 503,
          headers: { "Cache-Control": "no-store" }
        }
      );
    }

    return Response.json(
      {
        status: "ok",
        service: "talku-api",
        connected_users: data.connected_users
      },
      {
        headers: { "Cache-Control": "no-store" }
      }
    );
  } catch {
    return Response.json(
      {
        status: "unavailable",
        service: "talku-api",
        message: "TalkU API could not be reached."
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" }
      }
    );
  } finally {
    clearTimeout(timeout);
  }
}
