#!/bin/bash

# Script para configurar webhook de desarrollo con ngrok

echo "🚀 Configurando webhook de Stripe para desarrollo..."

# Verificar si ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo "📦 Instalando ngrok..."
    npm install -g ngrok
fi

echo "🌐 Iniciando túnel ngrok..."
echo "💡 INSTRUCCIONES:"
echo "1. Este script expondrá tu localhost:3000 a internet"
echo "2. Copia la URL HTTPS que aparezca (ej: https://abc123.ngrok.io)"
echo "3. Ve a Stripe Dashboard → Webhooks"
echo "4. Crea un nuevo endpoint con: https://abc123.ngrok.io/api/webhooks/stripe"
echo "5. Copia el webhook secret y actualiza tu .env.local"
echo ""
echo "⚠️  IMPORTANTE: Esta es solo para desarrollo, NO usar en producción"
echo ""
echo "🔄 Iniciando ngrok..."

ngrok http 3000
