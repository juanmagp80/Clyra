// Test directo de envío de emails para debugging
const { Resend } = require('resend');

async function testEmailDirect() {
    console.log('🧪 TEST: Probando envío directo con dominio taskelio.app...');

    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('🔧 CONFIG:', {
        hasApiKey: !!process.env.RESEND_API_KEY,
        domain: process.env.RESEND_DOMAIN,
        apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 8) + '...',
    });

    try {
        const result = await resend.emails.send({
            from: 'Taskelio <noreply@taskelio.app>',
            to: ['clyracrm@gmail.com'], // Tu email para verificar
            subject: 'TEST: Prueba desde taskelio.app',
            html: `
                <h2>🎉 Test de Email desde Taskelio</h2>
                <p>Este es un email de prueba desde <strong>noreply@taskelio.app</strong></p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Dominio:</strong> taskelio.app</p>
                <p>Si recibes este email, ¡el dominio funciona correctamente!</p>
            `
        });

        console.log('✅ SUCCESS: Email enviado correctamente');
        console.log('📧 RESULT:', result);

    } catch (error) {
        console.error('❌ ERROR: Falló el envío');
        console.error('🔍 DETAILS:', error);

        if (error.message) {
            console.error('💬 MESSAGE:', error.message);
        }

        if (error.statusCode) {
            console.error('📊 STATUS:', error.statusCode);
        }
    }
}

// Ejecutar test
testEmailDirect();
