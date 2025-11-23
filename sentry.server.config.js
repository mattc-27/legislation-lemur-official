import * as Sentry from "@sentry/nextjs";
Sentry.init({
    dsn: "https://93280440b208f3108b2ca5bc1f4bb932@o4510370044444672.ingest.us.sentry.io/4510370046803968",
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,
    // Enable logs to be sent to Sentry
    enableLogs: true,
    // that it will also get attached to your source maps
});