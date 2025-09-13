# 🚨 SOLUCIÓN: "Error sending confirmation email"

## 🔍 PROBLEMA IDENTIFICADO:
El error "Error sending confirmation email" indica un problema en la configuración de Supabase Authentication.

## ✅ VARIABLES DE ENTORNO: OK
- ✅ SUPABASE_URL configurado
- ✅ SUPABASE_ANON_KEY configurado  
- ✅ RESEND_API_KEY configurado
- ✅ SITE_URL configurado

## 🔧 SOLUCIÓN PASO A PASO:

### **PASO 1: Verificar configuración SMTP en Supabase**
1. Ve a: https://supabase.com/dashboard/project/joyhaxtpmrmndmifsihn/settings/auth
2. Busca la sección **"SMTP Settings"**
3. Verifica que esté configurado así:

```
✅ Enable custom SMTP: ACTIVADO

📧 SMTP Host: smtp.resend.com
📧 SMTP Port: 587
📧 SMTP User: resend
📧 SMTP Pass: re_UkgfUy6o_N3xmtw5pRCk3ydKGGdYJWdV7
📧 Sender Email: noreply@taskelio.app
📧 Sender Name: Taskelio
🔐 Enable STARTTLS: ACTIVADO
```

### **PASO 2: Verificar confirmación de email**
1. En la misma página de Authentication Settings
2. Busca **"User Signups"**
3. ✅ Verifica que **"Enable email confirmations"** esté **ACTIVADO**

### **PASO 3: Configurar URLs de redirección**
1. Busca **"URL Configuration"** 
2. En **"Site URL"**: `http://localhost:3000`
3. En **"Redirect URLs"**, agrega:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

### **PASO 4: Verificar dominio en Resend**
1. Ve a: https://resend.com/domains
2. Verifica que `taskelio.app` aparezca como **"Verified"**
3. Si no está verificado, sigue las instrucciones DNS

### **PASO 5: Revisar plantilla de email (opcional)**
1. Ve a **Authentication** > **Email Templates** > **"Confirm signup"**
2. Verifica que la plantilla no tenga errores de sintaxis

## 🧪 PROBAR LA SOLUCIÓN:

### **Opción A: Probar desde la aplicación**
1. Ve a: http://localhost:3000/register
2. Registra un usuario con tu email real
3. Verifica si llega el email de confirmación

### **Opción B: Probar desde Supabase Dashboard**
1. Ve a: https://supabase.com/dashboard/project/joyhaxtpmrmndmifsihn/auth/users
2. Busca **"Invite user"** o **"Create user"**
3. Crea un usuario de prueba
4. Verifica si envía el email

## 📋 CHECKLIST DE VERIFICACIÓN:

```
☐ SMTP activado en Supabase
☐ Datos SMTP correctos (smtp.resend.com, port 587)
☐ API key de Resend correcta
☐ Email confirmations habilitadas
☐ Site URL configurada: http://localhost:3000
☐ Redirect URL configurada: http://localhost:3000/auth/callback
☐ Dominio taskelio.app verificado en Resend
☐ Plantilla de email sin errores
```

## 🚨 SI SIGUE FALLANDO:

### **Revisar logs de Supabase:**
1. Ve a: https://supabase.com/dashboard/project/joyhaxtpmrmndmifsihn/logs/auth
2. Busca errores relacionados con email o SMTP
3. Los errores más comunes:
   - `SMTP authentication failed`
   - `Domain not verified`
   - `Rate limit exceeded`

### **Revisar logs de Resend:**
1. Ve a: https://resend.com/logs
2. Busca intentos de envío fallidos
3. Verifica el estado de los emails

### **Temporalmente deshabilitar confirmación:**
Si necesitas urgentemente que funcione el registro:
1. En Supabase > Authentication > Settings
2. **Desactiva temporalmente** "Enable email confirmations"
3. Los usuarios se crearán directamente sin email de confirmación
4. **IMPORTANTE**: Reactivar en producción

## 🎯 RESULTADO ESPERADO:
- ✅ Registro exitoso sin errores
- ✅ Email de confirmación enviado
- ✅ Remitente: "Taskelio <noreply@taskelio.app>"
- ✅ Usuario creado pero no confirmado hasta hacer clic en email