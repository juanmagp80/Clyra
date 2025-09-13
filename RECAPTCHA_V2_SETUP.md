# 🔄 CAMBIAR A reCAPTCHA v2 (CHECKBOX)

## 📋 PASOS PARA CREAR reCAPTCHA v2:

### 1. **Crear nuevo sitio reCAPTCHA v2**
1. Ve a: https://www.google.com/recaptcha/admin/create
2. **NO uses Google Cloud Console** - usa el reCAPTCHA clásico
3. Configuración:
   - **Etiqueta**: Taskelio - Plataforma Freelance
   - **Tipo**: **reCAPTCHA v2** > **"No soy un robot" (Checkbox)**
   - **Dominios**: 
     - `localhost` (para desarrollo)
     - Tu dominio de producción
   - Acepta términos y crea

### 2. **Obtener las claves**
Después de crear verás:
- **Clave del sitio**: Para frontend (pública)
- **Clave secreta**: Para backend (privada)

### 3. **Actualizar .env.local**
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu_nueva_site_key_v2
RECAPTCHA_SECRET_KEY=tu_nueva_secret_key_v2
```

## ✅ **VENTAJAS DE reCAPTCHA v2:**
- ✅ Más fácil de implementar
- ✅ Código ya está listo
- ✅ Usuario ve claramente la verificación
- ✅ Compatible con nuestra implementación actual