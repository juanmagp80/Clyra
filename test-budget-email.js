// Script para probar el envío de emails de presupuestos
// Ejecutar desde la consola del navegador en la página de presupuestos

async function testBudgetEmail() {
    try {
        console.log('🧪 Iniciando prueba de envío de email...');
        
        // Obtener el primer presupuesto en estado 'draft'
        const budgetCards = document.querySelectorAll('[data-budget-id]');
        if (budgetCards.length === 0) {
            console.error('❌ No se encontraron presupuestos para probar');
            return;
        }
        
        const firstBudgetCard = budgetCards[0];
        const budgetId = firstBudgetCard.getAttribute('data-budget-id');
        
        console.log('📋 Probando con presupuesto ID:', budgetId);
        
        const response = await fetch('/api/budgets/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ budgetId }),
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Email enviado exitosamente!');
            console.log('📧 ID del email:', result.emailId);
            console.log('📊 Resultado completo:', result);
        } else {
            console.error('❌ Error al enviar email:', result.error);
            console.error('📊 Respuesta completa:', result);
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
}

// Información sobre cómo usar este script
console.log(`
🚀 Script de prueba de emails cargado!

Para probar el envío de emails:
1. Asegúrate de tener presupuestos creados
2. Configura las variables RESEND_API_KEY y FROM_EMAIL en .env.local
3. Ejecuta: testBudgetEmail()

Requisitos:
- Al menos un presupuesto en la lista
- Cliente asociado con email válido
- Configuración de Resend completa
`);

// Hacer la función disponible globalmente para testing
window.testBudgetEmail = testBudgetEmail;
