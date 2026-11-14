/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    // The free *.vercel.app address must not show a second copy of the shop to Google.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "frenvix-repo.vercel.app" }],
        destination: "https://www.frenvix.store/:path*",
        permanent: true,
      },
    ];
  },
};
