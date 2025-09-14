# 🚨 ERROR 500 - SOLUCIÓN INMEDIATA

## 🔍 PROBLEMA ACTUAL:
- Error 500 en servidor de Supabase
- "Error sending confirmation email"
- SMTP configurado pero no funciona

## 🚀 SOLUCIÓN TEMPORAL (FUNCIONA YA):

### **OPCIÓN 1: Deshabilitar confirmación de email**

1. **Ve a Supabase Dashboard:**
   - https://supabase.com/dashboard/project/joyhaxtpmrmndmifsihn/settings/auth

2. **Busca "User Signups"**

3. **DESACTIVA "Enable email confirmations"**
   - Esto permitirá registro directo sin email
   - Los usuarios se crean inmediatamente

4. **Guarda y prueba el registro**

### **RESULTADO:**
- ✅ Registro funciona inmediatamente
- ✅ No requiere confirmación de email
- ✅ Los usuarios acceden directamente
- ⚠️ Menos seguro (reactivar en producción)

## 🔧 DIAGNÓSTICO DEL PROBLEMA:

### **POSIBLES CAUSAS DEL ERROR 500:**

1. **SMTP mal configurado en Supabase**
2. **Problema con API key de Resend**
3. **Límites de Supabase alcanzados**
4. **Problema temporal de Supabase**

### **VERIFICACIONES:**

1. **Revisar logs de Supabase:**
   - https://supabase.com/dashboard/project/joyhaxtpmrmndmifsihn/logs/auth
   - Buscar errores específicos de SMTP

2. **Verificar API key de Resend:**
   - Ve a: https://resend.com/api-keys
   - Verifica que `re_UkgfUy6o_N3xmtw5pRCk3ydKGGdYJWdV7` esté activa

3. **Probar configuración directa:**
   - Usar Resend API directamente desde tu app

## 🛠️ SOLUCIÓN DEFINITIVA (OPCIÓN 2):

### **Implementar envío de email propio:**

Crear `/app/api/auth/send-welcome-email/route.ts`:

```typescript
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const { email, userName } = await request.json();
        
        const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">¡Bienvenido a Taskelio!</h1>
            <p>Hola ${userName || 'Usuario'},</p>
            <p>Tu cuenta ha sido creada exitosamente en Taskelio.</p>
            <p>Ya puedes empezar a usar nuestra plataforma.</p>
            <p>Saludos,<br>El equipo de Taskelio</p>
        </div>
        `;
        
        await resend.emails.send({
            from: 'Taskelio <noreply@taskelio.app>',
            to: [email],
            subject: '¡Bienvenido a Taskelio!',
            html: emailHtml
        });
        
        return NextResponse.json({ success: true });
        
    } catch (error) {
        console.error('Error enviando email:', error);
        return NextResponse.json({ error: 'Error enviando email' }, { status: 500 });
    }
}
```

### **Modificar registro para usar API propia:**

En `app/register/page.tsx`, después del registro exitoso:

```typescript
// Enviar email de bienvenida propio
try {
    await fetch('/api/auth/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email.trim(),
            userName: companyName.trim()
        })
    });
} catch (emailError) {
    console.log('Email de bienvenida no enviado:', emailError);
    // No bloquear el registro por esto
}
```

## 📋 RECOMENDACIÓN INMEDIATA:

1. **AHORA**: Desactiva "Enable email confirmations" en Supabase
2. **PRUEBA**: El registro debería funcionar inmediatamente
3. **DESPUÉS**: Implementa la solución definitiva con tu propia API

## 🎯 ACCIÓN INMEDIATA:
**Ve a Supabase Dashboard y desactiva "Enable email confirmations" para que funcione YA el registro.**