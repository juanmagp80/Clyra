#!/bin/bash

echo "🔍 VERIFICANDO CONFIGURACIÓN OAUTH GOOGLE"
echo "========================================"

# Cargar variables de entorno
if [ -f ".env.local" ]; then
    source .env.local
    echo "✅ Variables de entorno cargadas"
else
    echo "❌ No se encontró .env.local"
    exit 1
fi

echo ""
echo "📋 CONFIGURACIÓN ACTUAL:"
echo "----------------------"
echo "GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-'❌ NO CONFIGURADO'}"
echo "GOOGLE_REDIRECT_URI: ${GOOGLE_REDIRECT_URI:-'❌ NO CONFIGURADO'}"
echo ""

# Verificar que el servidor esté corriendo
echo "🌐 VERIFICANDO SERVIDOR:"
echo "-----------------------"
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Servidor corriendo en http://localhost:3001"
else
    echo "❌ Servidor no responde en puerto 3001"
fi

echo ""
echo "🔧 URLS QUE DEBES CONFIGURAR EN GOOGLE CLOUD CONSOLE:"
echo "===================================================="
echo ""
echo "1. Ve a: https://console.cloud.google.com"
echo "2. APIs y servicios > Credenciales"
echo "3. Edita tu OAuth 2.0 Client ID: ${GOOGLE_CLIENT_ID}"
echo ""
echo "4. AÑADE ESTAS URLS EN 'URIs de redirección autorizados':"
echo "   http://localhost:3001/api/auth/google/callback"
echo "   http://localhost:3000/api/auth/google/callback"
echo "   http://127.0.0.1:3001/api/auth/google/callback"
echo ""
echo "5. AÑADE ESTAS URLS EN 'Orígenes JavaScript autorizados':"
echo "   http://localhost:3001"
echo "   http://localhost:3000"
echo "   http://127.0.0.1:3001"
echo ""

# Verificar endpoints
echo "🔗 VERIFICANDO ENDPOINTS:"
echo "------------------------"
if curl -s http://localhost:3001/api/auth/google | grep -q "redirect"; then
    echo "✅ Endpoint OAuth disponible: /api/auth/google"
else
    echo "⚠️  Endpoint OAuth: /api/auth/google"
fi

echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "================="
echo "1. Actualizar Google Cloud Console con las URLs de arriba"
echo "2. Esperar 2-3 minutos para propagación"
echo "3. Ir a: http://localhost:3001/dashboard/google-calendar"
echo "4. Hacer clic en 'Conectar Google Calendar'"
echo ""
