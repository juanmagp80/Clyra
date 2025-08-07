# Soporte Dinámico de Puertos

## Problema

Cuando Next.js detecta que el puerto 3000 está ocupado, automáticamente cambia a otro puerto (3001, 3002, etc.). Sin embargo, las URLs hardcodeadas en el código seguían apuntando al puerto 3000, causando errores 404.

## Solución Implementada

### 1. Detección Automática de Puerto

- **Frontend**: Usa `window.location.origin` para detectar automáticamente el puerto actual
- **Backend/APIs**: Usa el header `host` de la request para construir URLs dinámicamente
- **Desarrollo local**: Ya no depende de `NEXT_PUBLIC_SITE_URL` en `.env.local`

### 2. Función `getBaseUrl()` mejorada

```typescript
// lib/url.ts
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin; // Cliente: puerto automático
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`; // Vercel
  }
  
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_SITE_URL; // Producción
  }
  
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`; // Desarrollo
}
```

### 3. Nueva función `getBaseUrlFromRequest()`

```typescript
export function getBaseUrlFromRequest(request: Request): string {
  const host = request.headers.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}
```

### 4. Cambios en `.env.local`

```bash
# Antes:
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Ahora (comentado para desarrollo):
# NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Solo para producción
```

## Beneficios

✅ **Automático**: No hay que cambiar configuración cuando cambia el puerto  
✅ **Robusto**: Funciona en desarrollo, staging y producción  
✅ **Sin errores 404**: Las APIs siempre generan URLs correctas  
✅ **Compatible**: Sigue funcionando con configuración manual para producción  

## Uso

### En componentes React
```typescript
import { getBaseUrl } from '@/lib/url';

const MyComponent = () => {
  const baseUrl = getBaseUrl(); // Detecta automáticamente
  // ...
};
```

### En APIs
```typescript
import { getBaseUrlFromRequest } from '@/lib/url';

export async function POST(request: NextRequest) {
  const baseUrl = getBaseUrlFromRequest(request);
  const portalUrl = `${baseUrl}/client-portal/${token}`;
  // ...
}
```

### Script de prueba
```bash
# Detecta puerto automáticamente
node test-email-api.js

# O especifica puerto manualmente
node test-email-api.js 3001
```

## Archivos Modificados

- `lib/url.ts` - Funciones de detección mejoradas
- `.env.local` - Variable comentada para desarrollo
- `app/api/client-communications/send-token-email/route.ts` - Usa detección dinámica
- `test-email-api.js` - Soporte para múltiples puertos
- `start.sh` - Mensajes actualizados

## Para Producción

En producción, sigue siendo recomendable configurar `NEXT_PUBLIC_SITE_URL` explícitamente:

```bash
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

Pero para desarrollo local, ya no es necesario.
