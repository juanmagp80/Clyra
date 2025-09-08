#!/bin/bash

echo "🔍 Verificando datos en la aplicación web..."
echo ""

# Verificar clientes
echo "📊 Consultando clientes..."
curl -s "http://localhost:3000/api/clients" | jq -r '.[] | "👤 \(.name) (\(.email))"' 2>/dev/null || echo "❌ Error consultando clientes"

echo ""

# Verificar proyectos  
echo "📊 Consultando proyectos..."
curl -s "http://localhost:3000/api/projects" | jq -r '.[] | "🏗️ \(.name) (\(.status))"' 2>/dev/null || echo "❌ Error consultando proyectos"

echo ""

# Verificar propuestas
echo "📊 Consultando propuestas..."
curl -s "http://localhost:3000/api/proposals" | jq -r '.[] | "📋 \(.title) (€\(.total_amount // "N/A"))"' 2>/dev/null || echo "❌ Error consultando propuestas"

echo ""
echo "✅ Verificación completada"
echo ""
echo "🚀 Si no ves datos arriba, podemos:"
echo "   1. Crear datos directamente desde la UI"
echo "   2. Usar las automatizaciones con datos manuales"
echo "   3. Verificar las APIs individualmente"
