/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Permite server actions em todos os domínios (localhost + Vercel)
      allowedOrigins: ["*"],
    },
  },
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "res.cloudinary.com",
      "images.unsplash.com",
    ],
  },
};

module.exports = nextConfig;
