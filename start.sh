#!/bin/bash

echo "🚀 Iniciando Taskelio..."
echo ""

# Verificar si existen las variables de entorno de Supabase
if grep -q "your_supabase_project_url_here" .env.local 2>/dev/null; then
    echo "⚠️  CONFIGURACIÓN REQUERIDA:"
    echo ""
    echo "🔧 Los botones de login social (GitHub/Google) no funcionarán hasta que configures Supabase:"
    echo ""
    echo "1️⃣  Ve a https://supabase.com y crea un proyecto gratuito"
    echo "2️⃣  Ve a Settings > API y copia tu Project URL y anon key"
    echo "3️⃣  Edita el archivo .env.local y reemplaza los valores placeholder"
    echo "4️⃣  Ve a Authentication > Providers y habilita GitHub/Google"
    echo ""
    echo "📖 Instrucciones detalladas en .env.example"
    echo ""
    echo "✅ MIENTRAS TANTO: La app funcionará en modo demo"
    echo "   - Puedes ver el diseño y la interfaz"
    echo "   - Login/registro mostrarán la UI pero no funcionarán"
    echo "   - Dashboard mostrará datos ficticios"
    echo ""
    echo "🔄 Continuando con el servidor de desarrollo..."
    echo ""
fi

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

# Verificar si Next.js está disponible
if ! command -v npx &> /dev/null; then
    echo "❌ npx no encontrado. Instalando Node.js..."
    exit 1
fi

# Iniciar el servidor
echo "🌟 Iniciando servidor de desarrollo..."
echo "🔍 Next.js detectará automáticamente el puerto disponible"
echo ""
echo "📋 URLs típicas (puede variar el puerto):"
echo "🔗 Home: http://localhost:3000 (o 3001, 3002...)"
echo "🔗 Login: http://localhost:3000/login"
echo "🔗 Registro: http://localhost:3000/register"
echo "🔗 Dashboard: http://localhost:3000/dashboard"
echo ""
echo "📋 Presiona Ctrl+C para detener el servidor"
echo ""

npm run dev
