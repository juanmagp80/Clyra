// Test de conexión OpenAI
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verificando configuración OpenAI...');
console.log('OPENAI_API_KEY configurada:', !!process.env.OPENAI_API_KEY);
console.log('API Key empieza con:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');

// Intentar importar y usar OpenAI
async function testOpenAI() {
    try {
        const { OpenAI } = await import('openai');
        
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        console.log('✅ Cliente OpenAI creado correctamente');
        
        // Test simple de conexión
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: "Di 'Hola' si puedes leer esto"
                }
            ],
            max_tokens: 10
        });

        console.log('✅ Respuesta de OpenAI:', response.choices[0].message.content);
        console.log('🎉 Conexión OpenAI funcionando correctamente!');
        
    } catch (error) {
        console.error('❌ Error al conectar con OpenAI:', error.message);
        
        if (error.code === 'invalid_api_key') {
            console.error('💡 La API key parece ser inválida');
        } else if (error.code === 'insufficient_quota') {
            console.error('💡 Cuota insuficiente en la cuenta de OpenAI');
        }
    }
}

testOpenAI();
