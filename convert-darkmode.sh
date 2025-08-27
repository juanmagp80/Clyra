#!/bin/bash

# Script para convertir el sistema darkMode anterior a next-themes
echo "Convirtiendo archivos del sistema darkMode anterior a next-themes..."

# Lista de archivos a procesar
FILES=(
    "app/dashboard/calendar/CalendarPageClient.tsx"
    "app/dashboard/reports/ReportsPageClientSimplified.tsx" 
    "app/dashboard/tasks/TasksPageClient.tsx"
    "app/dashboard/time-tracking/TimeTrackingClient.tsx"
    "app/page.tsx"
    "app/login/page.tsx"
    "app/register/page.tsx"
    "app/dashboard/invoices/InvoicesPageClient.tsx"
    "app/dashboard/clients/ClientsPageClient.tsx"
    "app/dashboard/projects/ProjectsPageClient.tsx"
)

for file in "${FILES[@]}"; do
    echo "Procesando: $file"
    
    # Remover imports del sistema anterior
    sed -i '/import.*@\/utils\/darkMode/d' "$file"
    
    # Reemplazos básicos de combineClasses
    sed -i 's/combineClasses(darkModeClasses\.background\.primary, "\([^"]*\)")/"\1 bg-white dark:bg-slate-900"/g' "$file"
    sed -i 's/combineClasses(darkModeClasses\.gradient\.text, "\([^"]*\)")/"\1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent"/g' "$file"
    sed -i 's/combineClasses(darkModeClasses\.text\.primary, "\([^"]*\)")/"\1 text-slate-900 dark:text-white"/g' "$file"
    sed -i 's/combineClasses(darkModeClasses\.text\.secondary, "\([^"]*\)")/"\1 text-slate-600 dark:text-slate-400"/g' "$file"
    sed -i 's/combineClasses(darkModeClasses\.text\.tertiary, "\([^"]*\)")/"\1 text-slate-500 dark:text-slate-500"/g' "$file"
    sed -i 's/combineClasses(darkModeClasses\.text\.muted, "\([^"]*\)")/"\1 text-slate-500 dark:text-slate-500"/g' "$file"
    
    # Presets
    sed -i 's/combineClasses(presets\.card, "\([^"]*\)")/"\1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"/g' "$file"
    sed -i 's/combineClasses(presets\.cardInteractive, "\([^"]*\)")/"\1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"/g' "$file"
    
    # Orden inverso
    sed -i 's/combineClasses("\([^"]*\)", darkModeClasses\.text\.primary)/"\1 text-slate-900 dark:text-white"/g' "$file"
    sed -i 's/combineClasses("\([^"]*\)", darkModeClasses\.text\.secondary)/"\1 text-slate-600 dark:text-slate-400"/g' "$file"
    sed -i 's/combineClasses("\([^"]*\)", darkModeClasses\.text\.tertiary)/"\1 text-slate-500 dark:text-slate-500"/g' "$file"
    sed -i 's/combineClasses("\([^"]*\)", darkModeClasses\.text\.muted)/"\1 text-slate-500 dark:text-slate-500"/g' "$file"
    
    echo "✓ Procesado: $file"
done

echo "¡Conversión completada!"
echo "Recuerda verificar manualmente los archivos para casos complejos."
