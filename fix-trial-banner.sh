#!/bin/bash

echo "🔧 Corrigiendo TrialBanner en todas las páginas..."

# Lista de archivos a revisar
files=(
    "/home/juan/Documentos/clyra/app/dashboard/proposals/ProposalsPageClient.tsx"
    "/home/juan/Documentos/clyra/app/dashboard/tasks/TasksPageClient.tsx"
    "/home/juan/Documentos/clyra/app/dashboard/templates/TemplatesPageClient.tsx"
    "/home/juan/Documentos/clyra/app/dashboard/emails/EmailsPageClient.tsx"
    "/home/juan/Documentos/clyra/app/dashboard/reports/ReportsPageClient.tsx"
    "/home/juan/Documentos/clyra/app/dashboard/calendar/CalendarPageClient.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "📄 Revisando: $(basename "$file")"
        
        # Verificar si tiene userEmail como prop
        if grep -q "userEmail.*string\|userEmail.*:" "$file"; then
            echo "  ✅ Tiene userEmail, corrigiendo TrialBanner..."
            sed -i 's/<TrialBanner \/>/<TrialBanner userEmail={userEmail} \/>/g' "$file"
        else
            echo "  ⚠️  No tiene userEmail como prop, saltando..."
        fi
    else
        echo "  ❌ Archivo no encontrado: $file"
    fi
done

echo "✅ Proceso completado"
