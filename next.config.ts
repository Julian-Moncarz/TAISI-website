import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The intensive moved from /summer-intensive to /intensive. Keep the old
      // paths working for posters, emails, and anything already shared.
      {
        source: "/summer-intensive",
        destination: "/intensive",
        permanent: true,
      },
      {
        source: "/summer-intensive/:path*",
        destination: "/intensive/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
