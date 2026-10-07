import type { FailureCode, WriteFailure } from "@/lib/writes/result";

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

const STATUS: Record<FailureCode, number> = {
  invalid: 400,
  unauthorized: 401,
  closed: 403,
  not_found: 404,
  taken: 409,
  exists: 409,
  rate_limited: 429,
  busy: 503,
};

// A write from lib/writes that couldn't go ahead. Its message is the website's
// wording, so the app can show it as-is.
export function failed(failure: WriteFailure) {
  return apiError(STATUS[failure.code], failure.code, failure.error);
}

// The request's JSON body, or undefined when it isn't JSON (the write's own
// checks then answer "invalid").
export async function readJson(request: Request): Promise<unknown> {
  return request.json().catch(() => undefined);
}

// Supabase is down or over a limit (the website shows "the server is busy").
export const busy = () =>
  apiError(503, "busy", "the server is busy right now. try again in a minute.");
