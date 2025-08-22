# 🔧 INSTRUCCIONES PARA CORREGIR EL ERROR DE API KEY

## Problema Actual
La `SUPABASE_SERVICE_ROLE_KEY` en tu archivo `.env.local` no es válida, por eso obtienes el error "Invalid API key".

## Solución paso a paso:

### 1. Ve a tu dashboard de Supabase
Ir a: https://supabase.com/dashboard/project/joyhaxtpmrmndmifsihn

### 2. Navega a Settings → API
En el panel izquierdo, busca "Settings" y luego "API"

### 3. Encuentra la sección "Project API keys"
Verás dos claves principales:
- **anon/public**: Esta ya la tienes correcta
- **service_role**: Esta es la que necesitas copiar

### 4. Copia la clave service_role
- Haz clic en "Copy" junto a la clave service_role
- Es una clave muy larga que empieza similar a: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 5. Actualiza tu archivo .env.local
Reemplaza la línea que dice:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.TDSG7uw8nOaGCfLuUAJPUDfm9xMqHOHRAW9y_h6Pttg
```

Por:
```
SUPABASE_SERVICE_ROLE_KEY=LA_CLAVE_QUE_COPIASTE_DESDE_SUPABASE
```

### 6. Ejecuta también la migración SQL
En Supabase SQL Editor, ejecuta todo el contenido del archivo:
`/home/juan/Documentos/clyra/database/client_communication_migration.sql`

### 7. Reinicia el servidor
```bash
npm run dev
```

## Verificación
Cuando hayas hecho los cambios, deberías ver en la consola:
```
🔧 Variables de entorno: {
  supabaseUrl: '✅ Configurada',
  serviceKey: '✅ Configurada',
  resendKey: '❌ Faltante',
  fromEmail: 'No configurado'
}
```

Y el cliente debería encontrarse correctamente.

## Nota sobre Email
Para el envío real de emails, también necesitarás configurar un proveedor como Resend:
- Regístrate en https://resend.com
- Obtén tu API key
- Añade en .env.local: `RESEND_API_KEY=tu_api_key`
- Añade en .env.local: `FROM_EMAIL=tu_email@tudominio.com`

Por ahora, el sistema funcionará sin envío real de emails (modo desarrollo).
