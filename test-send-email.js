// test-send-email.js
// Script para probar el envío de email real usando la API local de Next.js

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function sendTestEmail() {
    const response = await fetch('http://localhost:3000/api/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            subject: 'Prueba de envío desde Clyra',
            html: '<h2>¡Funciona el envío real!</h2><p>Este es un correo de prueba enviado desde la API de Clyra.</p>',
            from: 'noreply@taskelio.app'
        })
    });

    const result = await response.json();
    console.log('Resultado:', result);
}

sendTestEmail().catch(console.error);
