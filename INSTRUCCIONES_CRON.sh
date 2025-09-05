# 🚀 CONFIGURACIÓN CRON JOB - DETECTOR AUTOMÁTICO DE EVENTOS
# 
# Para activar la automatización 24/7, ejecuta estos comandos:

# 1. Abrir crontab del usuario
# crontab -e

# 2. Agregar esta línea para ejecutar cada hora
# 0 * * * * /home/juan/Documentos/clyra/auto-detector-hourly.sh

# 3. Verificar que el cron job está activo
# crontab -l

# 📋 EXPLICACIÓN DEL CRON JOB:
# 0 * * * *  = Ejecutar en el minuto 0 de cada hora
# 
# Formato: minuto hora día mes día_semana comando
# 0 * * * * = cada hora en punto (10:00, 11:00, 12:00, etc.)

# 🔧 ALTERNATIVAS DE FRECUENCIA:
# */30 * * * *  = Cada 30 minutos
# 0 */2 * * *   = Cada 2 horas
# 0 9-18 * * *  = Cada hora de 9 AM a 6 PM
# 0 * * * 1-5   = Cada hora solo días laborables

# 📊 MONITOREO:
# Los logs se guardan en: /home/juan/Documentos/clyra/logs/auto-detector.log
# Para ver los logs en tiempo real: tail -f /home/juan/Documentos/clyra/logs/auto-detector.log

echo "📋 Instrucciones para activar automatización 24/7:"
echo ""
echo "1. Ejecuta: crontab -e"
echo "2. Agrega esta línea:"
echo "   0 * * * * /home/juan/Documentos/clyra/auto-detector-hourly.sh"
echo "3. Guarda y sale (Ctrl+X, Y, Enter en nano)"
echo "4. Verifica: crontab -l"
echo ""
echo "¡Tu sistema detectará eventos automáticamente cada hora!"
