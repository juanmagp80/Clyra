#!/bin/bash

# Script de instalación y configuración para MCP Google Calendar Server
# Uso: ./install.sh

set -e

echo "🚀 Instalación de MCP Google Calendar Server"
echo "============================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instalar Node.js 18+ primero."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versión $NODE_VERSION detectada. Se requiere versión 18 o superior."
    exit 1
fi

print_status "Node.js $(node --version) detectado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

print_status "npm $(npm --version) detectado"

# Instalar dependencias
print_info "Instalando dependencias..."
if npm install; then
    print_status "Dependencias instaladas exitosamente"
else
    print_error "Error instalando dependencias"
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    print_info "Creando archivo .env desde .env.example..."
    cp .env.example .env
    print_status "Archivo .env creado"
    print_warning "IMPORTANTE: Editar .env con tus credenciales antes de continuar"
else
    print_info "Archivo .env ya existe"
fi

# Compilar TypeScript
print_info "Compilando TypeScript..."
if npm run build; then
    print_status "Compilación exitosa"
else
    print_error "Error compilando TypeScript"
    exit 1
fi

echo ""
echo "🎉 Instalación completada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "=================="
echo ""
echo "1. 🔧 Configurar variables de entorno:"
echo "   ${YELLOW}nano .env${NC}"
echo ""
echo "2. 🗄️ Configurar base de datos Supabase:"
echo "   - Ejecutar schema.sql en tu base de datos"
echo "   - Configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "3. 📧 Configurar Google Calendar API:"
echo "   - Crear proyecto en Google Cloud Console"
echo "   - Habilitar Google Calendar API"
echo "   - Configurar OAuth 2.0"
echo "   - Agregar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET"
echo ""
echo "4. 📨 Configurar email SMTP:"
echo "   - Gmail: usar contraseña de aplicación"
echo "   - Configurar EMAIL_USER y EMAIL_PASS"
echo ""
echo "5. 🚀 Iniciar el servidor:"
echo "   ${GREEN}npm run dev${NC}     # Modo desarrollo"
echo "   ${GREEN}npm start${NC}       # Modo producción"
echo ""
echo "📖 Ver README.md para documentación completa"

# Verificar archivos críticos
echo ""
echo "🔍 Verificando archivos..."
echo "=========================="

files=("src/index.ts" "src/config/index.ts" "src/services/GoogleCalendarService.ts" "src/services/SupabaseService.ts" "src/services/EmailService.ts" "src/automations/MeetingReminderAutomation.ts" "schema.sql")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file existe"
    else
        print_error "$file no encontrado"
    fi
done

echo ""
print_info "Instalación completa. ¡Feliz coding! 🎉"
