#!/bin/bash

echo "🎯 Creando datos de prueba directamente..."

# Crear cliente
echo "📝 Creando cliente..."
CLIENT_DATA='{
  "name": "María González García",
  "email": "maria.gonzalez@techsolutions.com",
  "company": "TechSolutions Madrid S.L.",
  "phone": "+34 666 777 888"
}'

curl -X POST "http://localhost:3000/api/clients" \
  -H "Content-Type: application/json" \
  -d "$CLIENT_DATA" 2>/dev/null && echo "✅ Cliente creado"

echo ""

# Crear proyecto
echo "📝 Creando proyecto..."
PROJECT_DATA='{
  "name": "Plataforma E-commerce Completa con IA",
  "description": "Desarrollo de una plataforma de comercio electrónico completa con funcionalidades de IA para recomendaciones personalizadas, chatbot de atención al cliente, análisis predictivo de ventas y sistema de gestión de inventario automatizado.",
  "status": "in_progress",
  "budget": 45000,
  "start_date": "2024-12-01",
  "end_date": "2025-03-01"
}'

curl -X POST "http://localhost:3000/api/projects" \
  -H "Content-Type: application/json" \
  -d "$PROJECT_DATA" 2>/dev/null && echo "✅ Proyecto creado"

echo ""

# Crear propuesta
echo "📝 Creando propuesta..."
PROPOSAL_DATA='{
  "title": "Expansión Sistema E-commerce: Módulo B2B y Analytics Avanzados",
  "description": "Propuesta para la segunda fase del proyecto de e-commerce con módulo B2B empresarial, analytics e inteligencia de negocio, y optimizaciones adicionales.",
  "services": [
    {
      "name": "Módulo B2B Empresarial",
      "description": "Portal dedicado para clientes corporativos",
      "price": 12000
    },
    {
      "name": "Analytics e Inteligencia de Negocio", 
      "description": "Dashboard ejecutivo con KPIs en tiempo real",
      "price": 8500
    }
  ],
  "total_amount": 28500,
  "status": "pending"
}'

curl -X POST "http://localhost:3000/api/proposals" \
  -H "Content-Type: application/json" \
  -d "$PROPOSAL_DATA" 2>/dev/null && echo "✅ Propuesta creada"

echo ""
echo "🎉 ¡Datos de prueba creados!"
echo ""
echo "🚀 Ve a http://localhost:3000/dashboard/ai-automations para probar las automatizaciones"
