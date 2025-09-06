#!/bin/bash

# 🚀 Script para probar automatización de emails en PRODUCCIÓN
# Crea un cliente nuevo y verifica si se envía el email automático

# CONFIGURACIÓN - URL de producción real
PROD_URL="https://www.taskelio.app"  # URL real de producción
USER_ID="e7ed7c8d-229a-42d1-8a44-37bcc64c440c"  # Tu user ID real

echo "🌐 Probando automatización en PRODUCCIÓN: $PROD_URL"
echo "👤 Usuario: $USER_ID"
echo "==============================================="

# 1. Crear cliente nuevo directamente en Supabase
echo "📝 1. Creando cliente nuevo..."
CLIENT_DATA='{
  "name": "Cliente Producción Test",
  "email": "appcartama@hotmail.com",
  "company": "Empresa Producción SL",
  "phone": "+34 666 777 888",
  "address": "Calle Test Producción, 123",
  "user_id": "'$USER_ID'"
}'

# Crear cliente usando la API de Supabase directamente
echo "Enviando datos del cliente..."
curl -X POST "https://joyhaxtpmrmndmifsihn.supabase.co/rest/v1/clients" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "$CLIENT_DATA"

echo ""
echo "⏳ Esperando 5 segundos para que se procese..."
sleep 5

# 2. Probar endpoint de automatización manual
echo ""
echo "🤖 2. Ejecutando automatización manual..."
curl -X POST "$PROD_URL/api/ai/workflows/auto" \
  -H "Content-Type: application/json" \
  -d '{
    "autoDetect": true,
    "userId": "'$USER_ID'"
  }' \
  | python3 -m json.tool 2>/dev/null || echo "Respuesta recibida (no JSON válido)"

echo ""
echo "⏳ Esperando 5 segundos más..."
sleep 5

# 3. Probar endpoint de envío de emails
echo ""
echo "📧 3. Ejecutando envío de emails automáticos..."
curl -X POST "$PROD_URL/api/ai/send-auto-emails" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'"
  }' \
  | python3 -m json.tool 2>/dev/null || echo "Respuesta recibida (no JSON válido)"

echo ""
echo "✅ PRUEBA COMPLETADA"
echo "==============================================="
echo "📧 Verifica tu email: appcartama@hotmail.com"
echo "🔍 Si no recibes email, revisa:"
echo "   - Variables de entorno en Vercel"
echo "   - Logs de la aplicación en Vercel"
echo "   - Estado del servicio Resend"
