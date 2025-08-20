#!/bin/bash

echo "🚀 Aplicando actualizaciones finales del modo oscuro..."

# Array de archivos que necesitan actualización de contenedor principal
pages=(
    "app/dashboard/projects/ProjectsPageClient.tsx"
    "app/dashboard/invoices/InvoicesPageClient.tsx"
    "app/dashboard/time-tracking/TimeTrackingClient.tsx"
)

for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        echo "🔄 Actualizando $page..."
        
        # Backup del archivo
        cp "$page" "$page.backup"
        
        # Reemplazos específicos para modo oscuro usando sed
        
        # 1. Actualizar contenedor principal con gradient de fondo
        sed -i 's/className="min-h-screen bg-gradient-to-br from-slate-50[^"]*"/className={combineClasses(presets.page, "min-h-screen")}/g' "$page"
        
        # 2. Actualizar contenedor flex principal
        sed -i 's/className="flex h-screen[^"]*"/className={combineClasses(presets.page, "flex h-screen overflow-hidden")}/g' "$page"
        
        # 3. Actualizar headers principales
        sed -i 's/text-slate-600[^"]*mt-2/combineClasses(darkModeClasses.text.muted, "mt-2")/g' "$page"
        
        # 4. Actualizar text gradients
        sed -i 's/bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent/bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent/g' "$page"
        
        # 5. Actualizar cards básicas
        sed -i 's/bg-white\/[0-9]* backdrop-blur[^"]*border[^"]*rounded[^"]*p-[0-9]*[^"]*shadow[^"]*/{combineClasses(presets.card, "p-6")}/g' "$page"
        
        echo "✅ $page actualizado"
        
        # Verificar que el archivo sigue siendo válido
        if node -c "$page" 2>/dev/null; then
            echo "✅ $page sintácticamente correcto"
        else
            echo "⚠️  Posibles problemas de sintaxis en $page, revisa manualmente"
        fi
        
    else
        echo "❌ Archivo no encontrado: $page"
    fi
done

echo ""
echo "🎨 Aplicando mejoras específicas por página..."

# ProjectsPageClient.tsx - Actualizar contenedor específico
if [ -f "app/dashboard/projects/ProjectsPageClient.tsx" ]; then
    echo "📁 Actualizando ProjectsPageClient..."
    # Usar Python para reemplazos más específicos
    python3 - << 'EOF'
import re

with open('app/dashboard/projects/ProjectsPageClient.tsx', 'r') as f:
    content = f.read()

# Actualizar main container
content = re.sub(
    r'className="flex h-screen overflow-hidden[^"]*"',
    'className={combineClasses(presets.page, "flex h-screen overflow-hidden")}',
    content
)

# Actualizar main content area  
content = re.sub(
    r'className="min-h-screen bg-gradient-to-br[^"]*"',
    'className={combineClasses(presets.page, "min-h-screen relative")}',
    content
)

with open('app/dashboard/projects/ProjectsPageClient.tsx', 'w') as f:
    f.write(content)
EOF
fi

# InvoicesPageClient.tsx - Actualizar contenedor específico
if [ -f "app/dashboard/invoices/InvoicesPageClient.tsx" ]; then
    echo "📄 Actualizando InvoicesPageClient..."
    python3 - << 'EOF'
import re

with open('app/dashboard/invoices/InvoicesPageClient.tsx', 'r') as f:
    content = f.read()

# Buscar y reemplazar contenedor principal
content = re.sub(
    r'<div className="min-h-screen bg-gray-50[^"]*"',
    '<div className={combineClasses(presets.page, "min-h-screen")}',
    content
)

with open('app/dashboard/invoices/InvoicesPageClient.tsx', 'w') as f:
    f.write(content)
EOF
fi

# TimeTrackingClient.tsx - Actualizar contenedor específico
if [ -f "app/dashboard/time-tracking/TimeTrackingClient.tsx" ]; then
    echo "⏰ Actualizando TimeTrackingClient..."
    python3 - << 'EOF'
import re

with open('app/dashboard/time-tracking/TimeTrackingClient.tsx', 'r') as f:
    content = f.read()

# Actualizar contenedor principal
content = re.sub(
    r'className="min-h-screen bg-gradient-to-br[^"]*"',
    'className={combineClasses(presets.page, "min-h-screen")}',
    content
)

# Actualizar headers
content = re.sub(
    r'className="text-3xl font-black text-slate-900[^"]*"',
    'className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent"',
    content
)

with open('app/dashboard/time-tracking/TimeTrackingClient.tsx', 'w') as f:
    f.write(content)
EOF
fi

echo ""
echo "✨ Actualizaciones finales completadas!"
echo "🔍 Ejecuta ./check-dark-mode.sh para verificar el progreso"
