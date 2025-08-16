#!/bin/bash

# Script para monitorear reuniones desde producción
# Hace una llamada HTTP al API de producción para ejecutar el monitoreo

PRODUCTION_URL="https://clyra.vercel.app"  # Cambiar por tu URL real de producción
API_ENDPOINT="/api/meeting-reminder"

echo "$(date): Ejecutando monitoreo de reuniones en producción..."

# Hacer llamada al API de producción
response=$(curl -s -X POST "${PRODUCTION_URL}${API_ENDPOINT}" -H "Content-Type: application/json")
status=$?

if [ $status -eq 0 ]; then
    echo "$(date): ✅ Monitoreo en producción completado"
    echo "$(date): Respuesta: $response"
else
    echo "$(date): ❌ Error en monitoreo de producción: $response"
fi

echo "$(date): Monitoreo de producción finalizado"
echo "---"
