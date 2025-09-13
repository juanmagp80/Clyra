# 🔐 CONFIGURACIÓN DE reCAPTCHA

## 📋 PASOS PARA OBTENER LAS CLAVES DE reCAPTCHA:

### 1. **Acceder a Google reCAPTCHA Console**
1. Ve a: https://www.google.com/recaptcha/admin/create
2. Inicia sesión con tu cuenta de Google

### 2. **Crear un nuevo sitio reCAPTCHA**
1. **Etiqueta**: Pon un nombre descriptivo como "Taskelio - Plataforma Freelance"
2. **Tipo de reCAPTCHA**: Selecciona "reCAPTCHA v2" > "Casilla de verificación 'No soy un robot'"
3. **Dominios**: Agrega tus dominios:
   - Para desarrollo: `localhost`
   - Para producción: `tu-dominio.com` (ej: `taskelio.app`)
4. **Propietarios**: Agrega tu email de Google
5. **Acepta los términos de servicio**
6. Haz clic en **"Enviar"**

### 3. **Obtener las claves**
Después de crear el sitio, verás:
- **Clave del sitio (Site Key)**: Empieza con `6Lc...` - Esta es pública
- **Clave secreta (Secret Key)**: Empieza con `6Lc...` - Esta es privada

### 4. **Configurar en tu aplicación**
Actualiza tu archivo `.env.local`:

```bash
# reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET_KEY=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 5. **Dominios para configurar**
- **Desarrollo**: `localhost`
- **Producción**: Tu dominio real

### 6. **Probar la configuración**
1. Reinicia tu servidor de desarrollo: `npm run dev`
2. Ve a la página de registro
3. Solo en producción verás el reCAPTCHA
4. Completa el formulario y verifica que funcione

## 🔧 CONFIGURACIÓN ADICIONAL:

### **Para dominios múltiples:**
Si tienes múltiples dominios, agrégalos uno por línea:
```
localhost
staging.tudominio.com
tudominio.com
www.tudominio.com
```

### **Configuración de seguridad:**
- La **Site Key** es pública y se envía al cliente
- La **Secret Key** es privada y solo se usa en el servidor
- Nunca expongas la Secret Key en el código frontend

### **Tipos de reCAPTCHA disponibles:**
1. **reCAPTCHA v2 (Checkbox)**: "No soy un robot" - El que implementamos
2. **reCAPTCHA v2 (Invisible)**: Se ejecuta automáticamente
3. **reCAPTCHA v3**: Basado en puntuación de riesgo

## 🚀 IMPLEMENTACIÓN COMPLETADA:

✅ **Componente reCAPTCHA**: `/src/components/ReCaptcha.tsx`
✅ **API de verificación**: `/app/api/verify-recaptcha/route.ts`
✅ **Integración en registro**: Formulario actualizado
✅ **Validación**: Solo se activa en producción
✅ **Tema**: Configurado para modo oscuro

## 🎯 CÓMO FUNCIONA:

1. **Usuario completa el formulario**
2. **reCAPTCHA se valida en el cliente** (Google)
3. **Token se envía al servidor** para verificación
4. **Servidor verifica con Google** que el token es válido
5. **Solo entonces se permite el registro**

## 🔍 DEBUGGING:

### Si reCAPTCHA no aparece:
- Verifica que `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` esté configurado
- Asegúrate de estar en modo producción
- Revisa la consola del navegador para errores

### Si la verificación falla:
- Verifica que `RECAPTCHA_SECRET_KEY` esté configurado correctamente
- Comprueba que el dominio esté autorizado en Google reCAPTCHA Console
- Revisa los logs del servidor para errores de verificación

## 📚 DOCUMENTACIÓN OFICIAL:
- Google reCAPTCHA: https://developers.google.com/recaptcha
- react-google-recaptcha: https://www.npmjs.com/package/react-google-recaptcha