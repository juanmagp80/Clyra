#!/bin/bash

# Test del sistema de emails IA usando curl
echo "🧪 Probando Sistema de Emails IA"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Verificar servidor
echo "1️⃣ Verificando servidor..."
PING_RESPONSE=$(curl -s "$BASE_URL/api/test/ping")
if [[ $? -eq 0 ]]; then
    echo "✅ Servidor funcionando: $PING_RESPONSE"
else
    echo "❌ Servidor no disponible"
    exit 1
fi

echo ""
echo "=================================================="
echo ""

# Test 2: Probar detección automática de eventos
echo "2️⃣ Probando detección automática de eventos..."
AUTO_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai/workflows/auto" \
    -H "Content-Type: application/json" \
    -d '{
        "autoDetect": true,
        "userId": "test@taskelio.app"
    }')

echo "Respuesta de detección automática:"
echo "$AUTO_RESPONSE" | jq . 2>/dev/null || echo "$AUTO_RESPONSE"

echo ""
echo "=================================================="
echo ""

# Test 3: Probar generación de email específico
echo "3️⃣ Probando generación de email específico..."
SPECIFIC_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai/workflows/auto" \
    -H "Content-Type: application/json" \
    -d '{
        "eventType": "contract_signed",
        "entityId": "test-contract-id",
        "userId": "test@taskelio.app"
    }')

echo "Respuesta de email específico:"
echo "$SPECIFIC_RESPONSE" | jq . 2>/dev/null || echo "$SPECIFIC_RESPONSE"

echo ""
echo "=================================================="
echo ""

# Test 4: Probar endpoint de automatizaciones IA
echo "4️⃣ Probando endpoint de automatizaciones IA..."
AI_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai/automations/execute" \
    -H "Content-Type: application/json" \
    -d '{
        "type": "smart_email",
        "data": {
            "trigger": "test",
            "context": "Prueba del sistema",
            "clientId": "test-client"
        },
        "userId": "test@taskelio.app"
    }')

echo "Respuesta de automatización IA:"
echo "$AI_RESPONSE" | jq . 2>/dev/null || echo "$AI_RESPONSE"

echo ""
echo "=================================================="
echo ""

# Test 5: Consultar eventos recientes
echo "5️⃣ Consultando eventos recientes..."
EVENTS_RESPONSE=$(curl -s "$BASE_URL/api/ai/workflows/auto?userId=test@taskelio.app&hours=24")

echo "Eventos recientes:"
echo "$EVENTS_RESPONSE" | jq . 2>/dev/null || echo "$EVENTS_RESPONSE"

echo ""
echo "🏁 Pruebas completadas"
