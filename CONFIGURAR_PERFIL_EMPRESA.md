# 🔧 CONFIGURAR PERFIL DE EMPRESA PARA EMAILS

## ⚠️ Problema Detectado:
El email muestra "Mi Empresa" porque tu perfil no tiene configurada la información de la empresa.

## 🎯 Solución: Configurar tu Perfil

### 📋 Pasos para configurar:

1. **Ve a tu perfil** en la aplicación
2. **Actualiza estos campos** en la base de datos `profiles`:
   - `company` = "Nombre de tu empresa"
   - `full_name` = "Tu nombre completo" 
   - `email` = "tu-email@empresa.com"
   - `phone` = "+34 XXX XXX XXX"
   - `website` = "https://tuempresa.com"

### 🛠️ Opción 1: Actualizar desde la App
Si tienes una página de perfil, úsala para actualizar la información.

### 🛠️ Opción 2: Actualizar directamente en Supabase
1. Ve a tu dashboard de Supabase
2. Busca la tabla `profiles`
3. Encuentra tu registro (por tu user_id)
4. Actualiza los campos:

```sql
UPDATE profiles 
SET 
    company = 'Tu Empresa S.L.',
    full_name = 'Tu Nombre Completo',
    phone = '+34 600 123 456',
    website = 'https://tuempresa.com'
WHERE id = 'tu-user-id';
```

## 🚀 Mejoras Implementadas:

### ✅ 1. **Reply-To Configurado**
- Los clientes pueden responder directamente al email
- Las respuestas llegan a tu email personal

### ✅ 2. **Headers Anti-Spam**
- `X-Priority: 3` (Normal)
- `X-Mailer: Taskelio Budget System`
- Headers de importancia normal
- Reduce probabilidad de ir a spam

### ✅ 3. **Diseño Profesional Mejorado**
- Información de contacto visible
- Sección "¿Tienes preguntas?" con tu email
- Diseño más profesional y menos "spammy"
- Emojis para mejor legibilidad

### ✅ 4. **Información de Empresa Dinámica**
- Muestra tu nombre/empresa real del perfil
- Email, teléfono y website si están configurados
- Fallback a nombre de usuario si no hay empresa

## 📧 Ejemplo de Email Mejorado:

```
Asunto: Presupuesto: Tu Proyecto

De: noreply@taskelio.app
Responder a: tu-email@empresa.com

📧 TU EMPRESA S.L.
📧 tu-email@empresa.com • 📞 +34 600 123 456 • 🌐 tuempresa.com

[Presupuesto completo con diseño profesional]

💬 ¿Tienes preguntas?
Puedes responder directamente a este email o contactarme en: tu-email@empresa.com
```

## 🧪 Para Probar:

1. **Actualiza tu perfil** con información real
2. **Envía otro presupuesto** 
3. **Verifica que muestra** tu empresa real
4. **Confirma que el reply-to** funciona

¿Necesitas ayuda para actualizar tu perfil en la base de datos?
