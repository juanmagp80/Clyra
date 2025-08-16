# ESTRATEGIA HÍBRIDA DE RECORDATORIOS DE REUNIONES
# ================================================

# Vercel (Producción): Una vez al día a las 9:00 AM
# - Se ejecuta automáticamente en producción
# - Configurado en vercel.json: "0 9 * * *"

# Cron Local (Desarrollo): Cada hora
# - Para desarrollo y testing local
# - Configurado en crontab: "0 * * * *"

# CONFIGURACIÓN:
# 1. Vercel: El cron job se ejecuta automáticamente en producción
# 2. Local: Mantener el cron job local para desarrollo frecuente

# Para activar el cron local:
# crontab -e
# Agregar: 0 * * * * /home/juan/Documentos/clyra/run-meeting-monitoring.sh >> /home/juan/Documentos/clyra/logs/meeting-monitor.log 2>&1

# Para desactivar el cron local (si solo quieres el de Vercel):
# crontab -r
