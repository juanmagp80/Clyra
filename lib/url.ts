// Utilidad para obtener la URL base de manera segura en el cliente y servidor
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // En el cliente, usar window.location.origin
    return window.location.origin;
  }
  
  // En el servidor, intentar usar variable de entorno primero
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // En el servidor, usar las variables de entorno de Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Para desarrollo local
  return `http://localhost:${process.env.PORT || 3000}`;
}

// Hook para usar la URL base solo en el cliente
export function useBaseUrl(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return getBaseUrl();
}
