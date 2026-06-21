import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/**/*': [
      './node_modules/@libsql/client/**/*',
      './node_modules/@libsql/isomorphic-ws/**/*',
      './node_modules/@libsql/hrana-client/**/*',
    ],
  },
};

export default nextConfig;
