# 📧 CONFIGURACIÓN DE RESEND PARA EMAILS REALES

## 🎯 Paso 1: Obtener API Key de Resend

### Registrarse en Resend:
1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Verifica tu email

### Obtener API Key:
1. Ve al Dashboard de Resend
2. Navega a "API Keys" en el menú lateral
3. Haz clic en "Create API Key"
4. Dale un nombre como "Clyra-Presupuestos"
5. Copia la API Key que empieza con `re_`

## 🎯 Paso 2: Configurar Dominio

### Opción A: Usar dominio de prueba (más fácil)
- Usa: `FROM_EMAIL=noreply@resend.dev`
- ✅ Funciona inmediatamente
- ⚠️ Limitado a 100 emails/día

### Opción B: Verificar tu dominio (recomendado)
1. En Resend Dashboard → "Domains"
2. Añadir tu dominio (ej: miempresa.com)
3. Configurar registros DNS según las instrucciones
4. Esperar verificación (puede tomar horas)
5. Usar: `FROM_EMAIL=presupuestos@miempresa.com`

## 🎯 Paso 3: Actualizar .env.local

Reemplaza en tu archivo `.env.local`:

```bash
# Reemplaza estas líneas:
RESEND_API_KEY=re_tu_api_key_aqui
FROM_EMAIL=noreply@resend.dev

# Con tus valores reales:
RESEND_API_KEY=re_abc123xyz789...  # Tu API key real
FROM_EMAIL=noreply@resend.dev      # O tu dominio verificado
```

## 🎯 Paso 4: Reiniciar servidor de desarrollo

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar:
npm run dev
```

## 🧪 Paso 5: Probar envío real

1. Ve a `/dashboard/budgets`
2. Crea un presupuesto con cliente que tenga email válido
3. Haz clic en menú (⋮) → "Enviar"
4. Revisa la consola del navegador para logs
5. ✅ El cliente debería recibir el email

## 📊 Logs de éxito esperados:

```
🚀 Iniciando proceso de envío de presupuesto...
✅ Usuario autenticado: tu-email@example.com
✅ Presupuesto encontrado: Nombre del presupuesto
📧 Email del cliente: cliente@ejemplo.com
👤 Perfil usuario: Tu Nombre
📧 Enviando email real a: cliente@ejemplo.com
📤 Desde: noreply@resend.dev
✅ Email enviado exitosamente, ID: abc123...
✅ Presupuesto actualizado exitosamente
```

## ⚠️ Troubleshooting

### Error: "API key is required"
- Verifica que RESEND_API_KEY esté configurada
- Reinicia el servidor después de cambiar .env.local

### Error: "Domain not verified"  
- Usa `noreply@resend.dev` temporalmente
- O verifica tu dominio en Resend Dashboard

### Email no llega:
- Revisa carpeta de spam
- Verifica email del cliente en la base de datos
- Usa email de prueba conocido

### Error: "Rate limit exceeded"
- Plan gratuito: 100 emails/día, 1 email/segundo
- Espera un momento entre envíos

## 🎨 Personalización del Email

El template incluye:
- ✅ Logo/nombre de empresa automático
- ✅ Información completa del presupuesto
- ✅ Tabla de items con precios
- ✅ Cálculo de IVA y total
- ✅ Diseño responsivo móvil
- ✅ Información de contacto

## 🚀 Estado Actual:

**Sin configurar Resend:** Sistema funciona en modo simulación
**Con Resend configurado:** Emails reales se envían automáticamente

¡El sistema detecta automáticamente si tienes Resend configurado y actúa en consecuencia!
