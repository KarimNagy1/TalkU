export async function onRequest() {
  return Response.json({
    status: "ok",
    service: "talku-funds-api",
    message: "Backend endpoint is running."
  });
}
