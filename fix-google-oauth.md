# 🔧 SOLUCION: Error redirect_uri_mismatch

## 🎯 PROBLEMA IDENTIFICADO
El error `redirect_uri_mismatch` ocurre porque la URL de redirección en Google Cloud Console no coincide con la configurada en la aplicación.

**URL actual en la app**: `http://localhost:3001/api/auth/google/callback`
**URL en Google Console**: Probablemente `http://localhost:3000/api/auth/google/callback`

## 🛠️ SOLUCIÓN PASO A PASO

### 1. Acceder a Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **APIs y servicios > Credenciales**

### 2. Encontrar tus credenciales OAuth 2.0
1. Busca tu **ID de cliente OAuth 2.0**
2. El ID debe ser: `608223216812-ecbl9q2t6689a16bjbpkpcglq5rpb33v.apps.googleusercontent.com`
3. Haz clic en el icono de editar (lápiz)

### 3. Actualizar URIs de redirección autorizada
En la sección **"URIs de redirección autorizados"**, añade estas URLs:

```
http://localhost:3000/api/auth/google/callback
http://localhost:3001/api/auth/google/callback
http://127.0.0.1:3000/api/auth/google/callback
http://127.0.0.1:3001/api/auth/google/callback
```

### 4. Orígenes JavaScript autorizados
En la sección **"Orígenes de JavaScript autorizados"**, añade:

```
http://localhost:3000
http://localhost:3001
http://127.0.0.1:3000
http://127.0.0.1:3001
```

### 5. Guardar cambios
1. Haz clic en **"GUARDAR"**
2. Los cambios pueden tardar unos minutos en aplicarse

## 🧪 VERIFICAR LA SOLUCIÓN

Después de actualizar Google Cloud Console:

1. Espera 2-3 minutos para que los cambios se propaguen
2. Ve a: http://localhost:3001/dashboard/google-calendar
3. Haz clic en "Conectar Google Calendar"
4. Debería funcionar correctamente

## 🚨 SI AÚN NO FUNCIONA

### Opción A: Verificar la configuración actual
```bash
# Ejecutar en el terminal para ver la configuración actual
cd /home/juan/Documentos/clyra
echo "GOOGLE_CLIENT_ID: $GOOGLE_CLIENT_ID"
echo "GOOGLE_REDIRECT_URI: $GOOGLE_REDIRECT_URI"
```

### Opción B: Regenerar credenciales
Si el problema persiste, es posible que necesites crear nuevas credenciales OAuth 2.0 en Google Cloud Console.

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] Google Cloud Console actualizado con URIs correctos
- [ ] Esperado 2-3 minutos para propagación
- [ ] Servidor Next.js corriendo en puerto 3001
- [ ] Variables de entorno correctas en .env.local
- [ ] API de Google Calendar habilitada en Google Cloud Console

## 🎉 ¡LISTO!

Una vez completados estos pasos, el botón "Conectar Google Calendar" debería funcionar correctamente y redirigirte al flujo de autenticación de Google.
