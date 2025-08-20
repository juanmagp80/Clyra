// Script para ejecutar manualmente el sistema de recordatorios
const { exec } = require('child_process');

// Usar el endpoint de la API que ya está configurado
console.log('🔍 EJECUTANDO SISTEMA DE RECORDATORIOS MANUALMENTE');
console.log('=================================================');

// Hacer una petición al endpoint local
const url = 'http://localhost:3000/api/meeting-reminder';

fetch(url, { method: 'POST' })
  .then(response => response.json())
  .then(data => {
    console.log('✅ Respuesta del sistema:', data);
    process.exit(0);
  })
  .catch(error => {
    console.log('❌ El servidor no está ejecutándose en localhost:3000');
    console.log('💡 Necesitas tener el servidor Next.js corriendo');
    console.log('');
    console.log('Ejecuta en otra terminal:');
    console.log('npm run dev');
    console.log('');
    console.log('Luego ejecuta este script de nuevo');
    process.exit(1);
  });
