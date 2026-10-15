
const TALKU_API_URL = "https://talku.ddns.net:8000/connected_users/";
const TIMEOUT_MS = 4000;
const MAX_RETRY_DELAY_MS = 2000;
const CACHE_TTL_MS = 15000;

let cachedStatus = null;
let cachedAt = 0;
let inFlightRequest = null;

async function fetchTalkUApi() {
  async function request() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      return await fetch(TALKU_API_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
        cache: "no-store"
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  const firstResponse = await request();

  if (firstResponse.status !== 429) {
    return firstResponse;
  }

  const retryAfter = Number(firstResponse.headers.get("Retry-After"));
  const delayMs =
    Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : 750;

  if (delayMs > MAX_RETRY_DELAY_MS) {
    return firstResponse;
  }

  await firstResponse.body?.cancel();
  await new Promise(resolve => setTimeout(resolve, delayMs));

  return request();
}

async function checkTalkUApi() {
  try {
    const response = await fetchTalkUApi();

    if (!response.ok) {
      return {
        status: "unavailable",
        service: "talku-api",
        message:
          response.status === 429
            ? "TalkU API rate limit prevented a health check."
            : "TalkU API did not return a successful response."
      };
    }

    const data = await response.json();

    if (
      !Number.isInteger(data.connected_users) ||
      data.connected_users < 0
    ) {
      return {
        status: "unavailable",
        service: "talku-api",
        message: "TalkU API returned an unexpected response."
      };
    }

    return {
      status: "ok",
      service: "talku-api",
      connected_users: data.connected_users
    };
  } catch {
    return {
      status: "unavailable",
      service: "talku-api",
      message: "TalkU API could not be reached."
    };
  }
}

export async function onRequest() {
  const now = Date.now();

  if (cachedStatus && now - cachedAt < CACHE_TTL_MS) {
    return Response.json(cachedStatus, {
      status: cachedStatus.status === "ok" ? 200 : 503,
      headers: { "Cache-Control": "no-store" }
    });
  }

  if (!inFlightRequest) {
    inFlightRequest = checkTalkUApi().then(result => {
      cachedStatus = result;
      cachedAt = Date.now();
      return result;
    }).finally(() => {
      inFlightRequest = null;
    });
  }

  const result = await inFlightRequest;

  return Response.json(result, {
    status: result.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" }
  });
}
