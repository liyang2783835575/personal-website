/**
 * Sentry initialization stubs.
 *
 * The project does not currently depend on `@sentry/nextjs` (see package.json).
 * These helpers are designed to be no-op safe: when `SENTRY_DSN` is unset, the
 * functions return immediately without crashing. To enable real error
 * reporting, install `@sentry/nextjs` and uncomment the corresponding
 * `Sentry.init(...)` block inside the relevant `initSentry*` function.
 *
 * Consumed by `src/instrumentation.ts`, which calls these helpers at server
 * startup based on the active runtime.
 */

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_TRACES_SAMPLE_RATE = Number(
  process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0,
);

const isEnabled = Boolean(SENTRY_DSN);

function logSkip(reason: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[observability] Sentry skipped: ${reason}`);
  }
}

function logInit(runtime: "server" | "edge"): void {
  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[observability] Sentry initialized for ${runtime} (tracesSampleRate=${SENTRY_TRACES_SAMPLE_RATE})`,
    );
  }
}

/**
 * Initialize Sentry for the Node.js server runtime.
 * Call from `instrumentation.ts` when `process.env.NEXT_RUNTIME === "nodejs"`.
 */
export async function initSentryServer(): Promise<void> {
  if (!isEnabled) {
    logSkip("SENTRY_DSN is not set");
    return;
  }

  logInit("server");

  // To enable, install `@sentry/nextjs` and uncomment:
  //
  //   import * as Sentry from "@sentry/nextjs";
  //   Sentry.init({
  //     dsn: SENTRY_DSN,
  //     tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
  //     environment: process.env.NODE_ENV,
  //   });
}

/**
 * Initialize Sentry for the Edge runtime.
 * Call from `instrumentation.ts` when `process.env.NEXT_RUNTIME === "edge"`.
 */
export async function initSentryEdge(): Promise<void> {
  if (!isEnabled) {
    logSkip("SENTRY_DSN is not set");
    return;
  }

  logInit("edge");

  // To enable, install `@sentry/nextjs` and uncomment:
  //
  //   import * as Sentry from "@sentry/nextjs";
  //   Sentry.init({
  //     dsn: SENTRY_DSN,
  //     tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
  //     environment: process.env.NODE_ENV,
  //   });
}
