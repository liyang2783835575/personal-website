/**
 * Next.js server-side instrumentation hook.
 *
 * Discovered automatically by Next.js — no source imports required. Runs once
 * per server instance, before the first request. `NEXT_RUNTIME` distinguishes
 * Node.js from Edge so we can avoid pulling in incompatible modules.
 *
 * See: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md
 */

import type { Instrumentation } from "next";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initSentryServer } = await import(
      "@/lib/observability/sentry"
    );
    await initSentryServer();
  } else if (process.env.NEXT_RUNTIME === "edge") {
    const { initSentryEdge } = await import("@/lib/observability/sentry");
    await initSentryEdge();
  }
}

/**
 * Server-error sink. Wire to Sentry.captureException() (or any other
 * observability backend) once the SDK is installed. No-op until then.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (process.env.NODE_ENV !== "production") {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "unknown error";
    console.error("[observability] onRequestError", {
      message,
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
    });
  }
  // When `@sentry/nextjs` is installed and SENTRY_DSN is set, add:
  //   Sentry.captureException(error, { extra: { request, context } });
};
