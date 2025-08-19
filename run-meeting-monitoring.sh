#!/bin/bash

# Script para ejecutar el monitoreo de reuniones automáticamente
# Este script se puede agregar al crontab para ejecución automática

echo "$(date): Iniciando monitoreo automático de reuniones..."

# Cambiar al directorio del proyecto
cd /home/juan/Documentos/clyra

# Ejecutar el API de monitoreo
response=$(curl -s -X POST http://localhost:3000/api/meeting-reminder)
status=$?

if [ $status -eq 0 ]; then
    echo "$(date): ✅ Monitoreo completado exitosamente"
    echo "$(date): Respuesta: $response"
else
    echo "$(date): ❌ Error en monitoreo: $response"
fi

echo "$(date): Monitoreo automático finalizado"
echo "---"
