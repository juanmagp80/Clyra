// Script para probar la API de envío de emails
// Ejecutar con: node test-email-api.js [puerto] (desde la carpeta del proyecto)
// Ejemplo: node test-email-api.js 3001

const testEmailAPI = async (port = 3000) => {
    try {
        console.log(`🧪 Probando API de envío de emails en puerto ${port}...`);

        const response = await fetch(`http://localhost:${port}/api/client-communications/send-token-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Host': `localhost:${port}` // Añadir header Host para que la API detecte el puerto correcto
            },
            body: JSON.stringify({
                clientId: 'test-client-id',
                message: 'Este es un mensaje de prueba',
                freelancerName: 'Test Freelancer'
            }),
        });

        console.log('📡 Respuesta del servidor:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            url: response.url
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Respuesta exitosa:', result);
        } else {
            const error = await response.text();
            console.log('❌ Error:', error);
        }

    } catch (error) {
        console.error('💥 Error de conexión:', error.message);
        console.log('\n🔍 Posibles causas:');
        console.log('1. El servidor no está ejecutándose (npm run dev)');
        console.log(`2. El puerto ${port} no está disponible`);
        console.log('3. La ruta de la API no existe');
        console.log('\n💡 Usa: node test-email-api.js [puerto]');
        console.log('Ejemplo: node test-email-api.js 3001');
    }
};

// Detectar puerto desde argumentos de línea de comandos
const port = process.argv[2] ? parseInt(process.argv[2]) : 3000;

// Ejecutar test solo si este archivo se ejecuta directamente
if (require.main === module) {
    testEmailAPI(port);
}

module.exports = testEmailAPI;
