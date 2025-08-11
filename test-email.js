// Script de prueba directo para Resend
const { Resend } = require('resend');

async function testEmail() {
    try {
        console.log('🧪 Probando envío directo con Resend...');
        
        const resend = new Resend('re_4ny5JgzZ_8mZzEy1ACkcbX8db6yVtYAM6');
        
        const { data, error } = await resend.emails.send({
            from: 'Clyra <onboarding@resend.dev>',
            to: ['juanmagp80@gmail.com'], // Cambia por tu email
            subject: 'Test directo desde Clyra',
            html: '<p>Este es un test directo de Resend</p><p>Si recibes este email, Resend funciona correctamente</p>',
        });

        if (error) {
            console.error('❌ Error:', error);
        } else {
            console.log('✅ Email enviado:', data);
        }
        
    } catch (error) {
        console.error('💥 Error crítico:', error);
    }
}

testEmail();
