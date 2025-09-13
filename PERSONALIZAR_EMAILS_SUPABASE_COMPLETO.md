# 📧 CONFIGURAR EMAILS PERSONALIZADOS EN SUPABASE

## 🎯 PROBLEMA ACTUAL:
Los emails de confirmación salen con remitente "Supabase Auth" en lugar de tu marca.

## 🔧 SOLUCIÓN: Configurar proveedor de email personalizado

### **OPCIÓN 1: Configurar SMTP personalizado en Supabase**

#### 1. **Ir a configuración de Supabase**
1. Ve a: https://supabase.com/dashboard/project/[tu-project-id]/settings/auth
2. Navega a **Authentication** > **Settings** > **SMTP Settings**

#### 2. **Configurar SMTP personalizado**
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Pass: [tu RESEND_API_KEY]
Sender Email: noreply@taskelio.app
Sender Name: Taskelio
```

#### 3. **Habilitar SMTP personalizado**
- Activa "Enable custom SMTP"
- Guarda la configuración

### **OPCIÓN 2: Usar webhook para emails personalizados**

#### 1. **Crear API endpoint para emails**
Crear `/app/api/auth/send-confirmation/route.ts`:

```typescript
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const { email, token, type } = await request.json();
        
        const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?token=${token}&type=${type}`;
        
        const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Confirma tu cuenta - Taskelio</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px;">
                <h1 style="color: #2563eb; text-align: center;">¡Bienvenido a Taskelio!</h1>
                <p>Hola,</p>
                <p>Gracias por registrarte en Taskelio. Para completar tu registro, haz clic en el siguiente enlace:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmUrl}" 
                       style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Confirmar mi cuenta
                    </a>
                </div>
                <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; color: #666;">${confirmUrl}</p>
                <p>Este enlace expirará en 1 hora.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    Este email fue enviado por Taskelio. Si no solicitaste esta cuenta, puedes ignorar este email.
                </p>
            </div>
        </body>
        </html>
        `;
        
        await resend.emails.send({
            from: 'Taskelio <noreply@taskelio.app>',
            to: [email],
            subject: 'Confirma tu cuenta en Taskelio',
            html: emailHtml
        });
        
        return NextResponse.json({ success: true });
        
    } catch (error) {
        console.error('Error enviando email:', error);
        return NextResponse.json({ error: 'Error enviando email' }, { status: 500 });
    }
}
```

#### 2. **Configurar webhook en Supabase**
1. Ve a **Database** > **Webhooks**
2. Crea webhook para tabla `auth.users`
3. URL: `https://tu-dominio.com/api/auth/send-confirmation`
4. Eventos: `INSERT`

### **OPCIÓN 3: Personalizar plantillas en Supabase Dashboard**

#### 1. **Ir a Email Templates**
1. Dashboard de Supabase > **Authentication** > **Email Templates**
2. Editar "Confirm signup"

#### 2. **Personalizar plantilla**
```html
<h2>Confirma tu cuenta en Taskelio</h2>
<p>Hola,</p>
<p>Gracias por registrarte en Taskelio. Haz clic en el enlace para confirmar tu cuenta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar mi cuenta</a></p>
<p>Si no solicitaste esta cuenta, puedes ignorar este email.</p>
<p>Saludos,<br>El equipo de Taskelio</p>
```

#### 3. **Cambiar remitente en configuración SMTP**
- Sender Name: `Taskelio`
- Sender Email: `noreply@taskelio.app`

## 🚀 **RECOMENDACIÓN: Opción 1 (SMTP personalizado)**

Es la más simple y efectiva:

1. **Configurar SMTP en Supabase** con tus credenciales de Resend
2. **Personalizar plantillas** en el dashboard
3. **Todos los emails** saldrán con tu marca

## ⚙️ **Variables de entorno necesarias:**
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Cambiar en producción
RESEND_API_KEY=tu_api_key_de_resend
```

## 🎯 **Resultado esperado:**
- ✅ Remitente: "Taskelio <noreply@taskelio.app>"
- ✅ Diseño personalizado
- ✅ Enlaces que funcionan
- ✅ Marca consistente