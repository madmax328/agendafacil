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
  // Redireciona a raiz para o login diretamente no edge (mais confiável)
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
