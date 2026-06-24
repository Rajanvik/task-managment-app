/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/api-docs',
        destination: '/docs',
        permanent: true,
      },
      {
        source: '/swagger',
        destination: '/docs',
        permanent: true,
      },
    ];
  },
  experimental: {
    outputFileTracingIncludes: {
      '/api/swagger': ['./src/app/api/**/*.ts'],
    },
  },
};

export default nextConfig;
