import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't normalize URLs (required for Django which needs trailing slashes)
  skipProxyUrlNormalize: true,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;

