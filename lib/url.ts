// Utilidad para obtener la URL base de manera segura en el cliente y servidor
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // En el cliente, usar window.location.origin (puerto dinámico automático)
    return window.location.origin;
  }
  
  // En el servidor, usar las variables de entorno de Vercel primero
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // En el servidor, intentar usar variable de entorno configurada (solo para producción)
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Para desarrollo local - detectar puerto automáticamente
  // Next.js actualiza PORT cuando cambia de puerto automáticamente
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}

// Función para obtener la URL base desde una request (para APIs)
export function getBaseUrlFromRequest(request: Request | { headers: { get: (name: string) => string | null } }): string {
  const host = request.headers.get('host');
  if (!host) {
    return getBaseUrl(); // Fallback
  }
  
  // Detectar si es HTTPS o HTTP
  const protocol = process.env.NODE_ENV === 'production' || host.includes('vercel.app') || host.includes('netlify.app') 
    ? 'https' 
    : 'http';
    
  return `${protocol}://${host}`;
}

// Hook para usar la URL base solo en el cliente
export function useBaseUrl(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return getBaseUrl();
}
