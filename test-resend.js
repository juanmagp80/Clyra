// Test rápido de Resend
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
    console.log('🔑 RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Configurada' : 'NO CONFIGURADA');
    console.log('📧 FROM_EMAIL:', process.env.FROM_EMAIL);
    
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY no configurada');
        return;
    }

    try {
        console.log('🧪 Enviando email de prueba...');
        
        const result = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'noreply@resend.dev',
            to: 'appcartama@hotmail.com', // Email de prueba
            reply_to: 'juan@example.com', // Email de prueba
            subject: 'Test Resend - Reply-To',
            html: '<h1>Email de prueba</h1><p>Este es un email de prueba para verificar el reply-to.</p>'
        });

        if (result.error) {
            console.error('❌ Error:', result.error);
        } else {
            console.log('✅ Email enviado exitosamente!');
            console.log('📧 ID:', result.data?.id);
        }
    } catch (error) {
        console.error('❌ Error enviando email:', error);
    }
}

testResend();
