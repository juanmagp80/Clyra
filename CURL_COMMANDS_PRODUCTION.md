# 🚀 COMANDOS CURL PARA PROBAR PRODUCCIÓN

## PASO 1: Crear cliente nuevo (usando Supabase directamente)
curl -X POST "https://joyhaxtpmrmndmifsihn.supabase.co/rest/v1/clients" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODA5NzUsImV4cCI6MjA2OTU1Njk3NX0.VfDfOG7TFvLXDdNnJlFo8zT1qf1O8gJu0UpHb_LUJAY" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Cliente Curl Test",
    "email": "appcartama@hotmail.com",
    "company": "Empresa Curl SL",
    "phone": "+34 123 456 789",
    "user_id": "e7ed7c8d-229a-42d1-8a44-37bcc64c440c"
  }'

## PASO 2: Ejecutar automatización (CAMBIA LA URL POR LA TUYA)
curl -X POST "https://TU_DOMINIO_AQUI/api/ai/workflows/auto" \
  -H "Content-Type: application/json" \
  -d '{
    "autoDetect": true,
    "userId": "e7ed7c8d-229a-42d1-8a44-37bcc64c440c"
  }'

## PASO 3: Enviar emails automáticos (CAMBIA LA URL POR LA TUYA)
curl -X POST "https://TU_DOMINIO_AQUI/api/ai/send-auto-emails" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "e7ed7c8d-229a-42d1-8a44-37bcc64c440c"
  }'

## URLs COMUNES DE PRODUCCIÓN:
# https://taskelio.app
# https://taskelio.vercel.app
# https://clyra.vercel.app
# https://tudominio.com

## PARA VERIFICAR QUE ENDPOINT FUNCIONA:
curl -I https://TU_DOMINIO_AQUI/api/ai/workflows/auto

## PARA VER LOGS EN TIEMPO REAL:
# 1. Ve a Vercel Dashboard
# 2. Selecciona tu proyecto
# 3. Ve a "Functions" tab
# 4. Ejecuta el curl y verifica los logs
