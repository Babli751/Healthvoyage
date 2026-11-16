import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this project (a lockfile exists in the home dir too).
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
};

export default withNextIntl(nextConfig);
