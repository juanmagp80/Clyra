#!/bin/bash

# Script para validar la sintaxis del archivo TemplatesPageClient.tsx
echo "🔍 Validando sintaxis de TemplatesPageClient.tsx..."

FILE_PATH="app/dashboard/templates/TemplatesPageClient.tsx"

if [ ! -f "$FILE_PATH" ]; then
    echo "❌ El archivo $FILE_PATH no existe"
    exit 1
fi

# Contar líneas
LINES=$(wc -l < "$FILE_PATH")
echo "📊 Número de líneas: $LINES"

# Verificar que termine con }
LAST_LINE=$(tail -1 "$FILE_PATH")
if [[ "$LAST_LINE" == "}" ]]; then
    echo "✅ El archivo termina correctamente con '}'"
else
    echo "❌ El archivo no termina con '}' - Última línea: '$LAST_LINE'"
fi

# Verificar sintaxis con TypeScript
echo "🔧 Verificando sintaxis TypeScript..."
npx tsc --noEmit --jsx preserve "$FILE_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Sintaxis TypeScript válida"
else
    echo "❌ Error de sintaxis TypeScript"
    exit 1
fi

# Verificar estructura de llaves
echo "🔍 Verificando balance de llaves..."
OPEN_BRACES=$(grep -o '{' "$FILE_PATH" | wc -l)
CLOSE_BRACES=$(grep -o '}' "$FILE_PATH" | wc -l)

echo "📊 Llaves abiertas: $OPEN_BRACES"
echo "📊 Llaves cerradas: $CLOSE_BRACES"

if [ $OPEN_BRACES -eq $CLOSE_BRACES ]; then
    echo "✅ Balance de llaves correcto"
else
    echo "❌ Balance de llaves incorrecto"
    exit 1
fi

echo "✅ Validación completa exitosa"
