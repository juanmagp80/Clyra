#!/bin/bash

# Script para limpiar todas las referencias al sistema darkMode anterior

echo "🧹 Limpiando referencias al sistema darkMode anterior..."

# Función para procesar archivos
process_files() {
    find app -name "*.tsx" -type f | while read -r file; do
        echo "📝 Procesando: $file"
        
        # Reemplazos básicos más comunes
        sed -i 's/combineClasses(presets\.page, "[^"]*")/"min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"/g' "$file"
        sed -i 's/combineClasses(presets\.card, "[^"]*")/"bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm"/g' "$file"
        sed -i 's/combineClasses(presets\.button, "[^"]*")/"bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg transition-all duration-300"/g' "$file"
        sed -i 's/combineClasses(presets\.modal)/"bg-white dark:bg-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl border border-white\/30 dark:border-slate-700\/30 overflow-hidden max-h-[85vh] overflow-y-auto"/g' "$file"
        
        # Casos más específicos
        sed -i 's/combineClasses(presets\.page)/"min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"/g' "$file"
        sed -i 's/combineClasses("[^"]*", presets\.page)/"min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"/g' "$file"
        
        # Limpiar referencias a darkModeClasses simples
        sed -i 's/combineClasses(darkModeClasses\.background\.primary)/"bg-white dark:bg-slate-900"/g' "$file"
        sed -i 's/combineClasses(darkModeClasses\.text\.primary)/"text-slate-900 dark:text-slate-100"/g' "$file"
        sed -i 's/combineClasses(darkModeClasses\.text\.secondary)/"text-slate-600 dark:text-slate-400"/g' "$file"
        
        # Casos complejos con múltiples parámetros - los más comunes
        sed -i 's/combineClasses("[^"]*", darkModeClasses\.interactive\.hoverButton)/className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md dark:bg-green-700 dark:hover:bg-green-600"/g' "$file"
        
        # Limpiar imports
        sed -i '/import.*darkModeClasses.*from/d' "$file"
        sed -i '/import.*combineClasses.*from/d' "$file"
        sed -i '/import.*presets.*from/d' "$file"
        sed -i '/from.*utils\/darkMode/d' "$file"
        
        # Casos donde combineClasses solo tiene un string
        sed -i 's/combineClasses("\([^"]*\)")/"\1"/g' "$file"
    done
}

# Ejecutar
process_files

echo "✅ Limpieza completada. Verificando errores..."

# Verificar si hay referencias restantes
echo "🔍 Referencias restantes a combineClasses:"
find app -name "*.tsx" -type f -exec grep -l "combineClasses" {} \; 2>/dev/null || echo "   ✅ Ninguna encontrada"

echo "🔍 Referencias restantes a presets:"
find app -name "*.tsx" -type f -exec grep -l "presets\." {} \; 2>/dev/null || echo "   ✅ Ninguna encontrada"

echo "🔍 Referencias restantes a darkModeClasses:"
find app -name "*.tsx" -type f -exec grep -l "darkModeClasses" {} \; 2>/dev/null || echo "   ✅ Ninguna encontrada"

echo "🎉 Script completado!"
