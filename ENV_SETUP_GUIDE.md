# Guía de Configuración de Variables de Entorno

## Archivos Creados

He recreado los siguientes archivos `.env`:

- **`.env.local`** - Para desarrollo local (úsalo ahora)
- **`.env.example`** - Plantilla para otros desarrolladores
- **`.env.production`** - Para el entorno de producción

## Configuración Paso a Paso

### 1. Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Accede a tu proyecto
3. Ve a Settings > API
4. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Google OAuth
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto o selecciona uno existente
3. Habilita Google Calendar API
4. Ve a Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Configura:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google-callback`
6. Copia Client ID y Client Secret

### 3. Stripe
1. Ve a [stripe.com](https://stripe.com)
2. Accede a tu dashboard
3. Ve a Developers > API keys
4. Copia las claves de test (para desarrollo)
5. Para webhooks:
   - Ve a Developers > Webhooks
   - Añade endpoint: `http://localhost:3000/api/webhooks/stripe`
   - Copia el signing secret

### 4. Resend (Email)
1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta
3. Ve a API Keys
4. Genera una nueva API key
5. Configura tu dominio (opcional para desarrollo)

## Pasos Siguientes

1. **Edita `.env.local`** con tus valores reales
2. **Reinicia el servidor de desarrollo**: `npm run dev`
3. **Verifica la configuración** visitando `/test-supabase`

## Seguridad

- ✅ Los archivos `.env*` están en `.gitignore`
- ❌ NUNCA subas archivos `.env` con datos reales a Git
- 🔒 Usa variables de entorno en producción (Vercel, Railway, etc.)

## Servicios Opcionales

Si no usas algún servicio, puedes comentar o eliminar esas variables:
- **SendGrid/Postmark**: Solo si no usas Resend
- **MCP Server**: Solo si usas el servidor MCP

## Solución de Problemas

Si tienes errores:
1. Verifica que todas las variables requeridas estén configuradas
2. Reinicia el servidor después de cambiar `.env.local`
3. Revisa la consola del navegador para errores específicos
4. Usa las páginas de test: `/test-supabase`, `/api/debug-subscription`
