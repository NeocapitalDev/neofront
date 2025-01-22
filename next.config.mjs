/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000', // Agrega el puerto si corresponde (opcional para localhost)
        pathname: '/**', // Permitir todas las rutas de imágenes
      },
      {
        protocol: 'https',
        hostname: 'minio.neocapitalfunding.com',
        pathname: '/**', // Permitir todas las rutas de imágenes
      },
    ],
  },
};

export default nextConfig;