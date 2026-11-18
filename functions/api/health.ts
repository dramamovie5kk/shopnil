interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  JWT_SECRET: string;
}

// No credentials, object names, schema details, or application data are returned.
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  let ready = false;
  try {
    const [database] = await Promise.all([
      env.DB.prepare("SELECT count(*) AS ok FROM auth_users").first<{ ok: number }>(),
      env.BUCKET.list({ limit: 1 }),
    ]);
    ready = database !== null && typeof env.JWT_SECRET === "string" && env.JWT_SECRET.length >= 43;
  } catch {
    // Deployment logs can be inspected separately; never reflect binding errors.
  }
  return new Response(
    request.method === "HEAD" ? null : JSON.stringify({ ready }),
    {
      status: ready ? 200 : 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};
