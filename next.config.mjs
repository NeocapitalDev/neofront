/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost','minio.neocapitalfunding.com'], // Agrega aquí el dominio de las imágenes
  },
};

export default nextConfig;
