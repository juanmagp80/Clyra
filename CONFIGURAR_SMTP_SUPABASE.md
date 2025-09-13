# 🛠️ CONFIGURACIÓN PASO A PASO: SMTP EN SUPABASE

## 📧 **CONFIGURAR SMTP PERSONALIZADO**

### **Paso 1: Ir a configuración de Supabase**
1. Ve a: https://supabase.com/dashboard/project/joyhaxtpmrmndmifsihn/settings/auth
2. En el menú izquierdo, busca **"SMTP Settings"**

### **Paso 2: Configurar datos SMTP**
Usa estos datos exactos:

```
✅ Enable custom SMTP: [ACTIVAR]

📧 SMTP Configuration:
- SMTP Host: smtp.resend.com
- SMTP Port: 587
- SMTP User: resend
- SMTP Pass: re_UkgfUy6o_N3xmtw5pRCk3ydKGGdYJWdV7

👤 Sender Configuration:
- Sender Email: noreply@taskelio.app
- Sender Name: Taskelio

🔐 Security:
- Enable STARTTLS: [ACTIVAR]
```

### **Paso 3: Personalizar plantilla de confirmación**
1. Ve a **Authentication** > **Email Templates**
2. Selecciona **"Confirm signup"**
3. Reemplaza el contenido con:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a Taskelio!</h1>
    <p style="color: white; opacity: 0.9; margin: 10px 0 0 0; font-size: 16px;">
      Plataforma profesional para freelancers
    </p>
  </div>
  
  <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hola,</p>
    
    <p style="font-size: 16px; color: #333; line-height: 1.5;">
      Gracias por registrarte en <strong>Taskelio</strong>. Para completar tu registro y activar tu cuenta, 
      haz clic en el siguiente botón:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; 
                border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
        ✅ Confirmar mi cuenta
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; line-height: 1.5;">
      Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
    </p>
    <p style="font-size: 12px; color: #888; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
      {{ .ConfirmationURL }}
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="font-size: 14px; color: #666; margin: 0;">
        Este enlace es válido por <strong>1 hora</strong>. Si no solicitaste esta cuenta, 
        puedes ignorar este email.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
      <p style="font-size: 14px; color: #888; margin: 0;">
        Saludos,<br>
        <strong style="color: #2563eb;">El equipo de Taskelio</strong>
      </p>
    </div>
  </div>
</div>
```

### **Paso 4: Probar configuración**
1. Guarda todos los cambios
2. Registra un usuario de prueba
3. Verifica que el email llegue con remitente "Taskelio"

## 🎯 **RESULTADO ESPERADO:**
- ✅ Remitente: **"Taskelio <noreply@taskelio.app>"**
- ✅ Asunto personalizado
- ✅ Diseño profesional
- ✅ Enlaces funcionales

## 🚨 **SI NO FUNCIONA:**
1. Verifica que Resend tenga el dominio verificado
2. Comprueba que la API key sea correcta
3. Revisa los logs en Supabase Dashboard

## 📞 **¿Necesitas ayuda?**
Si tienes problemas, revisa el dashboard de Supabase en la sección "Logs" para ver errores específicos.