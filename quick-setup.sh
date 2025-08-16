#!/bin/bash

# Script de configuración rápida para Google Calendar MCP Integration
# Uso: ./quick-setup.sh

set -e

echo "🚀 CONFIGURACIÓN RÁPIDA - GOOGLE CALENDAR MCP"
echo "============================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "app/dashboard" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz de Clyra"
    exit 1
fi

print_status "Directorio correcto detectado"

# 2. Instalar dependencias del servidor MCP
print_info "Instalando dependencias del servidor MCP..."
cd mcp-google-calendar

if npm install; then
    print_status "Dependencias del MCP instaladas"
else
    print_error "Error instalando dependencias del MCP"
    exit 1
fi

# 3. Crear archivo .env si no existe
if [ ! -f .env ]; then
    cp .env.example .env
    print_status "Archivo .env creado"
    print_warning "IMPORTANTE: Debes editar mcp-google-calendar/.env con tus credenciales"
else
    print_info "Archivo .env ya existe"
fi

cd ..

# 4. Verificar que la página de Google Calendar esté accesible
if [ -f "app/dashboard/google-calendar/page.tsx" ]; then
    print_status "Página de Google Calendar creada"
else
    print_error "Página de Google Calendar no encontrada"
    exit 1
fi

# 5. Verificar que el cliente MCP esté creado
if [ -f "src/lib/google-calendar-mcp-client.ts" ]; then
    print_status "Cliente MCP creado"
else
    print_error "Cliente MCP no encontrado"
    exit 1
fi

# 6. Verificar que la navegación esté actualizada
if grep -q "Google Calendar" components/Sidebar.tsx; then
    print_status "Navegación actualizada"
else
    print_warning "Google Calendar no encontrado en la navegación"
fi

echo ""
echo "🎉 CONFIGURACIÓN COMPLETADA!"
echo "=========================="
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1. 🔧 Configurar Google Calendar API:"
echo "   - Ve a Google Cloud Console: https://console.cloud.google.com/"
echo "   - Crea un proyecto o selecciona uno existente"
echo "   - Habilita Google Calendar API"
echo "   - Crea credenciales OAuth 2.0"
echo "   - Configura URIs de redirección: http://localhost:3001/auth/callback"
echo ""
echo "2. 📧 Configurar servicio de email:"
echo "   - Gmail: Habilitar autenticación de 2 factores"
echo "   - Crear contraseña de aplicación"
echo "   - O usar otro proveedor SMTP"
echo ""
echo "3. 🗄️ Configurar base de datos:"
echo "   - Ejecutar: psql -h [host] -U postgres -d postgres -f mcp-google-calendar/schema.sql"
echo "   - O ejecutar el SQL directamente en Supabase Dashboard"
echo ""
echo "4. ⚙️ Editar variables de entorno:"
echo "   ${YELLOW}nano mcp-google-calendar/.env${NC}"
echo ""
echo "5. 🧪 Probar la integración:"
echo "   ${GREEN}cd mcp-google-calendar${NC}"
echo "   ${GREEN}npm run test-integration${NC}"
echo ""
echo "6. 🚀 Iniciar el servidor MCP:"
echo "   ${GREEN}cd mcp-google-calendar${NC}"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "7. 🌐 Acceder a la interfaz:"
echo "   ${GREEN}http://localhost:3000/dashboard/google-calendar${NC}"
echo ""
echo "📚 DOCUMENTACIÓN ADICIONAL:"
echo "- README.md en mcp-google-calendar/"
echo "- Archivos de ejemplo y configuración incluidos"
echo ""
echo "🆘 SOPORTE:"
echo "- Revisar logs de consola para errores"
echo "- Usar script de diagnóstico: npm run test-integration"
echo "- Consultar documentación de Google Calendar API"

print_status "¡Configuración rápida completada! 🎉"
