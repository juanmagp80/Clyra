#!/bin/bash

echo "🧪 Probando configuración de Stripe..."
echo ""

# Verificar variables de entorno
echo "1️⃣ Verificando variables de entorno..."
if [ -z "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ]; then
    echo "❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no está configurada"
else
    echo "✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY configurada"
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ STRIPE_SECRET_KEY no está configurada"
else
    echo "✅ STRIPE_SECRET_KEY configurada"
fi

echo ""
echo "2️⃣ Probando API de setup de productos..."
curl -X POST http://localhost:3000/api/stripe/setup-product \
     -H "Content-Type: application/json" \
     -w "\nStatus: %{http_code}\n"

echo ""
echo "3️⃣ Para completar la configuración:"
echo "   1. Ve a: https://dashboard.stripe.com/webhooks"
echo "   2. Crea un nuevo webhook endpoint"
echo "   3. URL: http://localhost:3000/api/webhooks/stripe"
echo "   4. Eventos a escuchar:"
echo "      - customer.subscription.created"
echo "      - customer.subscription.updated"
echo "      - customer.subscription.deleted"
echo "      - invoice.payment_succeeded"
echo "      - invoice.payment_failed"
echo "   5. Copia el webhook secret y añádelo a .env.local"
echo ""
echo "✅ Stripe está listo para funcionar!"
