// JSON answers for the app's API (/api/app/v1/*). Errors share one shape,
// { error: { code, message } }: the app switches on code and can show message,
// which is written in the app's lowercase voice.

export function json(data: unknown, init?: { status?: number; cache?: string }) {
  return Response.json(data, {
    status: init?.status ?? 200,
    // Most answers depend on who's asking, so none are cached unless a route says so.
    headers: { "Cache-Control": init?.cache ?? "no-store" },
  });
}

export function apiError(status: number, code: string, message: string) {
  return json({ error: { code, message } }, { status });
}

export const unauthorized = () => apiError(401, "unauthorized", "sign in to do that.");

// Supabase is down or over a limit (the website shows "the server is busy").
export const busy = () =>
  apiError(503, "busy", "the server is busy right now. try again in a minute.");
