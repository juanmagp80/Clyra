#!/bin/bash

# Script para verificar deployment y triggerear manualmente si es necesario

echo "🔍 Verificando estado de deployment..."

# Obtener el último commit
LAST_COMMIT=$(git rev-parse HEAD)
COMMIT_SHORT=$(git rev-parse --short HEAD)

echo "📊 Último commit: $COMMIT_SHORT"
echo "📅 Fecha del commit: $(git show -s --format=%cd --date=local $LAST_COMMIT)"

# Verificar si el sitio está online
echo "🌐 Verificando sitio en producción..."

# Cambiar esta URL por tu URL de Vercel
VERCEL_URL="https://clyra.vercel.app"

if curl -s --head "$VERCEL_URL" | grep -q "200 OK"; then
    echo "✅ Sitio online en $VERCEL_URL"
else
    echo "❌ Sitio no responde en $VERCEL_URL"
    echo "🔄 Intentando deployment manual..."
    
    # Intentar deployment manual
    npx vercel --prod --yes
fi

echo "📋 Para verificar deployments manualmente:"
echo "   - Ir a: https://vercel.com/dashboard"
echo "   - Verificar el proyecto Clyra"
echo "   - Ver logs de deployment"

echo "🔧 Si el deployment automático no funciona:"
echo "   1. Verificar webhooks en GitHub → Settings → Webhooks"
echo "   2. Verificar configuración en Vercel → Project → Settings → Git"
echo "   3. Asegurar que Auto-Deploy esté habilitado"
