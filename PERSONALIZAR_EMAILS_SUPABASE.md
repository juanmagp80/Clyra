# 🎨 PERSONALIZAR EMAILS DE SUPABASE

## PROBLEMA IDENTIFICADO ✅
Los emails de confirmación de registro tienen asunto "Supabase" porque usan los templates por defecto.

## SOLUCIÓN - PERSONALIZAR EMAIL TEMPLATES:

### 1. ACCEDER AL DASHBOARD
1. Ve a: https://app.supabase.com/project/joyhaxtpmrmndmifsihn
2. Inicia sesión con tu cuenta

### 2. CONFIGURAR TEMPLATES DE EMAIL
1. Ve a **Authentication > Email Templates**
2. Verás 4 tipos de templates:
   - **Confirm signup** (el que necesitas cambiar)
   - **Invite user**  
   - **Magic Link**
   - **Reset Password**

### 3. PERSONALIZAR "CONFIRM SIGNUP"
1. Haz clic en **"Confirm signup"**
2. Cambia el **Subject** de:
   ```
   Confirm Your Signup
   ```
   A:
   ```
   Confirma tu registro en Taskelio - ¡Bienvenido! 🎉
   ```

3. Personaliza el **Body** HTML. Aquí tienes un template moderno:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirma tu registro</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 30px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 10px 0;
        }
        .content p {
            font-size: 16px;
            margin-bottom: 15px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 ¡Bienvenido a Taskelio!</h1>
            <p style="color: #64748b; font-size: 18px; margin: 0;">Tu plataforma de gestión freelance</p>
        </div>

        <div class="content">
            <p>¡Hola!</p>
            
            <p>Gracias por registrarte en <strong>Taskelio</strong>. Para completar tu registro y acceder a todas las funcionalidades de la plataforma, necesitamos que confirmes tu dirección de email.</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    ✅ Confirmar mi cuenta
                </a>
            </div>
            
            <p>Una vez confirmado tu email, podrás:</p>
            <ul>
                <li>✨ Gestionar tus proyectos y contratos</li>
                <li>📊 Crear presupuestos profesionales</li>
                <li>👥 Administrar clientes</li>
                <li>📧 Enviar contratos por email</li>
                <li>📈 Hacer seguimiento de tus ingresos</li>
            </ul>
            
            <p>Si no te has registrado en Taskelio, puedes ignorar este email.</p>
            
            <p><strong>¿Problemas con el botón?</strong><br>
            Copia y pega este enlace en tu navegador:<br>
            <code style="background: #f1f5f9; padding: 5px; border-radius: 4px; word-break: break-all;">{{ .ConfirmationURL }}</code></p>
        </div>

        <div class="footer">
            <p><strong>Equipo Taskelio</strong><br>
            Tu plataforma de gestión freelance</p>
            <p>Este link expira en 24 horas por seguridad.</p>
        </div>
    </div>
</body>
</html>
```

### 4. PERSONALIZAR OTROS TEMPLATES (OPCIONAL)

**Reset Password:**
- Subject: `Restablece tu contraseña - Taskelio 🔐`

**Magic Link:**  
- Subject: `Tu enlace de acceso a Taskelio ✨`

**Invite User:**
- Subject: `Te han invitado a Taskelio 🎉`

### 5. CONFIGURAR INFORMACIÓN DE REMITENTE
1. Ve a **Authentication > Settings**
2. En la sección **Email**:
   - **Site URL**: `http://localhost:3000` (desarrollo) o tu dominio
   - **From Email**: Puedes usar `noreply@taskelio.app` si tienes dominio verificado
   - **From Name**: `Taskelio - Plataforma Freelance`

### 6. VARIABLES DISPONIBLES EN TEMPLATES
En los templates puedes usar estas variables:
- `{{ .Email }}` - Email del usuario
- `{{ .ConfirmationURL }}` - URL de confirmación  
- `{{ .Token }}` - Token de confirmación
- `{{ .TokenHash }}` - Hash del token
- `{{ .SiteURL }}` - URL de tu sitio
- `{{ .RedirectTo }}` - URL de redirección

### 7. PROBAR LOS CAMBIOS
1. Guarda los cambios en Supabase
2. Registra un nuevo usuario de prueba
3. Verifica que el email llega con tu nuevo diseño

## CONSEJOS ADICIONALES:

### PARA PRODUCCIÓN:
- Configura un dominio personalizado para emails
- Usa un servicio SMTP dedicado (SendGrid, Mailgun)
- Añade tu logo en el template

### BACKUP DEL TEMPLATE ORIGINAL:
Guarda el template original por si necesitas volver atrás:
```html
<!-- Template original de Supabase -->
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```