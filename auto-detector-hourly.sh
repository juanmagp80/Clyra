#!/bin/bash

# 🚀 Script de automatización 24/7 para detección de eventos
# Este script se ejecuta cada hora para detectar y procesar eventos automáticamente

# Configuración
USER_ID="2478a228-7db8-48e2-b58d-66368b15cf01"
API_URL="http://localhost:3000/api/ai/workflows/auto"
LOG_FILE="/home/juan/Documentos/clyra/logs/auto-detector.log"

# Crear directorio de logs si no existe
mkdir -p "$(dirname "$LOG_FILE")"

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🤖 Iniciando detección automática de eventos..."

# Ejecutar detección automática
response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"autoDetect\": true, \"userId\": \"$USER_ID\"}")

# Verificar respuesta
if echo "$response" | grep -q '"success":true'; then
    events_processed=$(echo "$response" | grep -o '"processedEvents":[0-9]*' | grep -o '[0-9]*')
    emails_generated=$(echo "$response" | grep -o '"generatedEmails":\[[^]]*\]' | wc -c)
    
    log "✅ Éxito: $events_processed eventos procesados"
    log "📧 Emails generados automáticamente"
else
    log "❌ Error en detección automática: $response"
fi

log "🏁 Detección automática completada"
