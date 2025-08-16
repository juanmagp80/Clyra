#!/bin/bash

# Script para ejecutar Google Calendar MCP Integration
echo "🚀 Iniciando Google Calendar MCP Integration"
echo "============================================"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio raíz de Clyra"
    exit 1
fi

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    if [ ! -z "$MAIN_PID" ]; then
        kill $MAIN_PID 2>/dev/null || true
    fi
    if [ ! -z "$MCP_PID" ]; then
        kill $MCP_PID 2>/dev/null || true
    fi
    echo "✅ Servicios detenidos"
    exit 0
}

# Configurar trap para limpiar al salir
trap cleanup SIGINT SIGTERM

echo ""
echo "📦 Verificando instalación..."

# Verificar que googleapis esté instalado
if ! npm list googleapis > /dev/null 2>&1; then
    echo "📦 Instalando googleapis..."
    npm install googleapis
fi

# Verificar que resend esté instalado
if ! npm list resend > /dev/null 2>&1; then
    echo "📦 Instalando resend..."
    npm install resend
fi

echo ""
echo "🔧 Iniciando servidor principal (Next.js)..."
npm run dev &
MAIN_PID=$!

# Esperar a que el servidor principal esté listo
sleep 5

echo ""
echo "🔧 Iniciando MCP Server..."
cd mcp-google-calendar
npm run dev &
MCP_PID=$!
cd ..

echo ""
echo "✅ SERVICIOS INICIADOS"
echo "====================="
echo ""
echo "🌐 Aplicación principal: http://localhost:3000"
echo "📅 Dashboard Google Calendar: http://localhost:3000/dashboard/google-calendar"
echo "🔧 MCP Server: http://localhost:3001"
echo ""
echo "📋 INSTRUCCIONES:"
echo ""
echo "1. Abre http://localhost:3000/dashboard/google-calendar"
echo "2. Haz clic en 'Conectar Google Calendar'"
echo "3. Autoriza el acceso a tu cuenta de Google"
echo "4. ¡Ya puedes usar los recordatorios automáticos!"
echo ""
echo "⚠️  IMPORTANTE: Ejecuta el esquema SQL en Supabase:"
echo "   - Abre mcp-google-calendar/schema.sql"
echo "   - Copia y pega en Supabase SQL Editor"
echo "   - Ejecuta el script para crear las tablas"
echo ""
echo "💡 Para detener los servicios, presiona Ctrl+C"
echo ""

# Mantener el script corriendo
while true; do
    sleep 1
    
    # Verificar que los procesos sigan corriendo
    if ! kill -0 $MAIN_PID 2>/dev/null; then
        echo "❌ El servidor principal se ha detenido"
        cleanup
    fi
    
    if ! kill -0 $MCP_PID 2>/dev/null; then
        echo "❌ El MCP server se ha detenido"
        cleanup
    fi
done
