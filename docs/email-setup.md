# 📧 Configuración de Email para Clyra

## 🚀 Guía de configuración de servicios de email

Para que el sistema de tokens funcione correctamente, necesitas configurar un proveedor de email. Aquí tienes las opciones disponibles:

---

## 🔥 RESEND (Recomendado)

**✅ Pros:** Fácil de configurar, 3000 emails gratis/mes, excelente deliverability

### Configuración:

1. **Regístrate en Resend:**
   - Ve a [https://resend.com](https://resend.com)
   - Crea una cuenta gratuita

2. **Obtén tu API Key:**
   - Ve al dashboard de Resend
   - Navega a "API Keys"
   - Crea una nueva API key

3. **Configura el dominio (Opcional para testing):**
   - Para testing: puedes usar `onboarding@resend.dev`
   - Para producción: agrega y verifica tu dominio en Resend

4. **Agrega a tu `.env.local`:**
   ```bash
   RESEND_API_KEY=re_tu_api_key_aqui
   FROM_EMAIL=Clyra <onboarding@resend.dev>
   ```

---

## 📮 SENDGRID

**✅ Pros:** Muy confiable, 100 emails gratis/día

### Configuración:

1. **Regístrate en SendGrid:**
   - Ve a [https://sendgrid.com](https://sendgrid.com)
   - Crea una cuenta

2. **Obtén tu API Key:**
   - Ve a Settings > API Keys
   - Crea una nueva API key con permisos de "Mail Send"

3. **Verifica tu dominio:**
   - Ve a Settings > Sender Authentication
   - Configura tu dominio

4. **Agrega a tu `.env.local`:**
   ```bash
   SENDGRID_API_KEY=tu_api_key_aqui
   FROM_EMAIL=Clyra <noreply@tudominio.com>
   ```

---

## 📬 POSTMARK

**✅ Pros:** Excelente para emails transaccionales, 100 emails gratis/mes

### Configuración:

1. **Regístrate en Postmark:**
   - Ve a [https://postmarkapp.com](https://postmarkapp.com)
   - Crea una cuenta

2. **Crea un servidor:**
   - En el dashboard, crea un nuevo "Server"
   - Copia el "Server API Token"

3. **Configura el dominio:**
   - Agrega y verifica tu dominio de envío

4. **Agrega a tu `.env.local`:**
   ```bash
   POSTMARK_API_KEY=tu_server_api_token_aqui
   FROM_EMAIL=Clyra <noreply@tudominio.com>
   ```

---

## 📧 GMAIL/SMTP (Para desarrollo)

**⚠️ Solo para desarrollo:** No recomendado para producción

### Configuración:

1. **Habilita 2FA en Gmail:**
   - Ve a tu cuenta de Google
   - Habilita la autenticación de dos factores

2. **Genera una contraseña de aplicación:**
   - Ve a "Contraseñas de aplicaciones"
   - Genera una para "Otra aplicación personalizada"

3. **Agrega a tu `.env.local`:**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu_email@gmail.com
   SMTP_PASS=tu_contraseña_de_aplicacion
   FROM_EMAIL=Clyra <tu_email@gmail.com>
   ```

---

## 🧪 Testing sin proveedor

Si no configuras ningún proveedor, el sistema:
- ✅ Generará el token correctamente
- ✅ Mostrará la URL del portal en la respuesta
- ⚠️ No enviará el email (solo lo loggeará en consola)

---

## 🔧 Verificar configuración

Para verificar que tu configuración funciona:

1. **Configura uno de los proveedores arriba**
2. **Reinicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
3. **Prueba enviar un token desde la app**
4. **Revisa la consola del servidor para ver los logs**

---

## 📊 Comparación rápida

| Proveedor | Emails gratis | Facilidad | Recomendado para |
|-----------|---------------|-----------|------------------|
| **Resend** | 3,000/mes | ⭐⭐⭐⭐⭐ | Desarrollo y producción |
| **SendGrid** | 100/día | ⭐⭐⭐⭐ | Aplicaciones empresariales |
| **Postmark** | 100/mes | ⭐⭐⭐⭐ | Emails transaccionales |
| **Gmail/SMTP** | Ilimitado | ⭐⭐ | Solo desarrollo |

---

**💡 Recomendación:** Empieza con **Resend** para desarrollo y producción. Es el más fácil de configurar y el más generoso con el plan gratuito.
