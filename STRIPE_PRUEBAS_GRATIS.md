# 🧪 Guía para Configurar Stripe en Modo de Prueba (100% GRATIS)

## ✅ Paso 1: Claves ya configuradas ✓
Ya tienes las claves de prueba en tu `.env.local`:
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`  
- ✅ `STRIPE_SECRET_KEY=sk_test_...`

## 📦 Paso 2: Crear Productos en Stripe Dashboard

### Ir a tu Dashboard de Stripe:
1. Ve a [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
2. **Asegúrate de que estés en MODO DE PRUEBA** (arriba a la izquierda debe decir "Modo de prueba")
3. Ve a **"Productos"** en el menú lateral

### Crear Plan Básico:
1. Haz clic en **"Agregar producto"**
2. **Nombre**: `Plan Básico Clyra`
3. **Descripción**: `Plan básico con todas las funciones esenciales`
4. **Modelo de precios**: `Suscripción recurrente`
5. **Precio**: `€29.00` (o el precio que quieras)
6. **Facturación**: `Mensual`
7. **Moneda**: `EUR`
8. Haz clic en **"Guardar producto"**
9. **¡IMPORTANTE!**: Copia el **Price ID** (empezará con `price_...`)

### Crear Plan Empresarial:
1. Repite el proceso anterior con:
   - **Nombre**: `Plan Empresarial Clyra`
   - **Precio**: `€99.00` (o el precio que quieras)
   - **¡IMPORTANTE!**: Copia el **Price ID**

## 🔧 Paso 3: Actualizar los Price IDs en el código

Una vez que tengas los Price IDs, actualiza el archivo `app/pricing/page.tsx`:

```tsx
const STRIPE_PRICES = {
  BASIC: 'price_TU_PRICE_ID_BASICO_AQUI',     // Pega aquí tu Price ID real
  BUSINESS: 'price_TU_PRICE_ID_EMPRESARIAL_AQUI' // Pega aquí tu Price ID real
};
```

## 🧪 Paso 4: Probar con Tarjetas de Prueba

Stripe proporciona tarjetas de prueba que **NO COBRAN DINERO REAL**:

### ✅ Tarjetas de Prueba (100% GRATIS):
- **Visa exitosa**: `4242 4242 4242 4242`
- **Visa que falla**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

### Datos adicionales para pruebas:
- **CVV**: Cualquier 3 números (ej: `123`)
- **Fecha**: Cualquier fecha futura (ej: `12/25`)
- **Código postal**: Cualquier código (ej: `12345`)

## 🚀 Paso 5: ¡Probar!

1. Ve a `http://localhost:3000/pricing`
2. Haz clic en **"Obtener Plan Básico"** o **"Obtener Plan Empresarial"**
3. Te redirigirá a Stripe Checkout
4. Usa las **tarjetas de prueba** mencionadas arriba
5. ¡Completa el pago simulado!

## 💡 ¿Qué pasa cuando pruebas?

- ✅ **No se cobra dinero real**
- ✅ **Funciona exactamente igual que pagos reales**
- ✅ **Puedes ver los pagos en tu dashboard de Stripe**
- ✅ **Puedes probar diferentes escenarios (éxito, fallo, etc.)**

## 🔍 Verificar Pagos de Prueba

En tu Stripe Dashboard > **Pagos**, verás todos los pagos de prueba con el estado correspondiente.

---

**🎉 ¡Una vez configurado, tendrás pagos de prueba completamente funcionales sin gastar ni un centavo!**
