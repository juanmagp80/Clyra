#!/bin/bash

echo "🌙 Verificando implementación del modo oscuro en todas las páginas..."
echo "=================================================================="

# Lista de páginas principales que deben tener modo oscuro
pages=(
    "app/page.tsx"
    "app/login/page.tsx" 
    "app/register/page.tsx"
    "app/dashboard/DashboardClient.tsx"
    "app/dashboard/clients/ClientsPageClient.tsx"
    "app/dashboard/projects/ProjectsPageClient.tsx"
    "app/dashboard/tasks/TasksPageClient.tsx"
    "app/dashboard/calendar/CalendarPageClient.tsx"
    "app/dashboard/invoices/InvoicesPageClient.tsx"
    "app/dashboard/templates/TemplatesPageClient.tsx"
    "app/dashboard/time-tracking/TimeTrackingClient.tsx"
    "app/dashboard/reports/ReportsPageClientSimplified.tsx"
)

missing_imports=()
missing_usage=()

for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        echo "🔍 Verificando $page..."
        
        # Verificar import del sistema darkMode
        if grep -q "darkModeClasses.*presets.*combineClasses.*@/utils/darkMode" "$page"; then
            echo "  ✅ Import correcto"
        else
            echo "  ❌ Falta import de darkMode"
            missing_imports+=("$page")
        fi
        
        # Verificar uso de las utilidades
        if grep -q "combineClasses\|presets\." "$page"; then
            echo "  ✅ Uso de utilidades"
        else
            echo "  ❌ No usa las utilidades"
            missing_usage+=("$page")
        fi
        
    else
        echo "  ❌ Archivo no encontrado: $page"
    fi
    echo ""
done

echo "=================================================================="
echo "📊 RESUMEN:"

if [ ${#missing_imports[@]} -eq 0 ]; then
    echo "✅ Todos los archivos tienen los imports correctos"
else
    echo "❌ Archivos sin imports:"
    printf '   %s\n' "${missing_imports[@]}"
fi

if [ ${#missing_usage[@]} -eq 0 ]; then
    echo "✅ Todos los archivos usan las utilidades"
else
    echo "❌ Archivos sin usar utilidades:"
    printf '   %s\n' "${missing_usage[@]}"
fi

echo ""
echo "🎨 Verificando componentes UI..."

ui_components=(
    "components/ui/Button.tsx"
    "components/ui/Input.tsx"
    "components/ui/Card.tsx"
)

for component in "${ui_components[@]}"; do
    if grep -q "dark:" "$component"; then
        echo "✅ $component - Modo oscuro implementado"
    else
        echo "❌ $component - Falta modo oscuro"
    fi
done

echo ""
echo "🔧 Verificando archivos de configuración..."

if grep -q "darkMode.*class" "tailwind.config.js"; then
    echo "✅ Tailwind configurado para modo oscuro"
else
    echo "❌ Tailwind sin configuración de modo oscuro"
fi

if [ -f "utils/darkMode.ts" ]; then
    echo "✅ Sistema darkMode.ts presente"
else
    echo "❌ Sistema darkMode.ts faltante"
fi

if grep -q ":root.dark" "app/globals.css"; then
    echo "✅ CSS variables para modo oscuro"
else
    echo "❌ CSS sin variables de modo oscuro"
fi

echo ""
echo "🌙 Verificación completa del modo oscuro terminada!"
