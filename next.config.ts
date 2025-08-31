import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Reducir el uso de memoria durante el build
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Mejorar la experiencia de desarrollo
  webpack: (config, { dev, isServer }) => {
    // Desactivar sourcemaps en producción para reducir errores
    if (!dev && !isServer) {
      config.devtool = false;
    }
    
    // Optimizar el uso de memoria
    config.optimization = {
      ...config.optimization,
      minimize: true,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true
          }
        }
      }
    };
    
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
