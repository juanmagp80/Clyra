import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */



  // Mejorar la experiencia de desarrollo
  webpack: (config, { dev, isServer }) => {
    // Desactivar sourcemaps en producción para reducir errores
    if (!dev && !isServer) {
      config.devtool = false;
    }
    return config;
  },

  // Configuración experimental para mejorar el rendimiento
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Configuración de imágenes si se necesita
  images: {
    domains: [],
  },
};

export default nextConfig;
