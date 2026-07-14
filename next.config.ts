import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/*": ["./node_modules/sqlite/**/*", "./node_modules/sqlite3/**/*"],
  },
};

export default nextConfig;
