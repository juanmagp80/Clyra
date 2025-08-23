# Configuración de Webhooks de Stripe para Producción

## 🎯 Problema Actual
- En desarrollo: Stripe CLI reenvía webhooks a localhost
- En producción: Necesitas webhook endpoint público

## 🚀 Solución para Producción

### 1. Configurar Webhook en Stripe Dashboard

1. **Ir a Stripe Dashboard:**
   - https://dashboard.stripe.com/webhooks

2. **Crear Nuevo Endpoint:**
   - Click "Add endpoint"
   - URL: `https://tu-dominio-produccion.com/api/webhooks/stripe`
   - Seleccionar eventos:
     - `customer.subscription.created`
     - `customer.subscription.updated` 
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Obtener Webhook Secret:**
   - Después de crear, click en el webhook
   - Copiar "Signing secret" (empieza con `whsec_`)

### 2. Variables de Entorno en Producción

```bash
# .env.production
STRIPE_WEBHOOK_SECRET=whsec_xxx_produccion  # ⚠️ DIFERENTE al de desarrollo
STRIPE_SECRET_KEY=sk_live_xxx               # ⚠️ Usar clave LIVE en producción
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # ⚠️ Usar clave LIVE pública
```

### 3. Diferencias Desarrollo vs Producción

| Aspecto | Desarrollo | Producción |
|---------|------------|------------|
| Webhook URL | `localhost:3000` (via Stripe CLI) | `https://dominio.com` |
| Webhook Secret | Del Stripe CLI | Del Dashboard de Stripe |
| Stripe Keys | Test keys (`sk_test_`, `pk_test_`) | Live keys (`sk_live_`, `pk_live_`) |
| Reenvío | Stripe CLI manual | Automático de Stripe |

### 4. Verificación del Webhook

Para probar que el webhook funciona en producción:

1. **Hacer un pago de prueba** (usando live keys)
2. **Verificar logs** en tu servidor de producción
3. **Verificar en Stripe Dashboard:**
   - Ir a Webhooks → Tu endpoint → "Delivery"
   - Ver si los webhooks llegaron exitosamente

### 5. Debugging en Producción

Si el webhook no funciona:

1. **Verificar URL accesible:**
   ```bash
   curl https://tu-dominio.com/api/webhooks/stripe
   # Debería devolver 400 (método no permitido) no 404
   ```

2. **Verificar logs del servidor**
3. **Verificar en Stripe Dashboard** si hay errores de entrega

## 🔄 Alternativa: Ngrok para Testing

Para testing en desarrollo sin Stripe CLI:

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto local
ngrok http 3000

# Usar la URL de ngrok en Stripe webhook
# Ejemplo: https://abc123.ngrok.io/api/webhooks/stripe
```

## ⚠️ Consideraciones de Seguridad

1. **Webhook Secret:** Siempre verificar la firma del webhook
2. **HTTPS:** Stripe solo envía webhooks a URLs HTTPS en producción
3. **Rate Limiting:** Implementar rate limiting en el endpoint
4. **Logs:** No logear información sensible de pagos

## 🎯 Resumen

- **Desarrollo:** Stripe CLI + localhost ✅
- **Producción:** Webhook directo + dominio público ✅
- **Testing:** Ngrok como alternativa ✅
