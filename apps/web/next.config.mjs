// apps/web/next.config.mjs
import { withSentryConfig } from "@sentry/nextjs";


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // …keep all your existing options here
};


// Make sure adding Sentry options is the last code to run before exporting
export default withSentryConfig(nextConfig, {
  org: "high-altitude-web",
  project: "javascript-nextjs",
  // Only print logs for uploading source maps in CI
  // Set to `true` to suppress logs
  silent: !process.env.CI,
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});