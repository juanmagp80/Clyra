// Script de prueba para Workflows Automáticos con IA
// Ejecutar con: node test-ai-workflows.js

async function testWorkflows() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('🔄 Probando Workflows Automáticos con IA...\n');
    
    // Prueba 1: Email Inteligente - Contrato Firmado
    console.log('📧 Prueba 1: Email Inteligente - Contrato Firmado');
    try {
        const emailData = {
            type: 'smart_email',
            data: {
                trigger: 'contract_signed',
                context: {
                    client: {
                        name: 'María González',
                        company: 'TechStart SA'
                    },
                    contract: {
                        value: 8500,
                        project: 'Desarrollo de App Móvil',
                        startDate: '2024-09-10'
                    }
                }
            },
            userId: 'test@example.com'
        };
        
        const response = await fetch(`${baseUrl}/api/ai/automations/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });
        
        const result = await response.json();
        console.log('✅ Email generado exitosamente:');
        console.log('   📬 Asunto:', result.email?.subject);
        console.log('   🎯 Tono:', result.email?.tone);
        console.log('   📋 Próximos pasos:', result.email?.next_steps?.slice(0, 2).join(', '));
        console.log('');
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('');
    }
    
    // Prueba 2: Formulario Dinámico - Brief de Proyecto
    console.log('📋 Prueba 2: Formulario Dinámico - Brief de Proyecto');
    try {
        const formData = {
            type: 'dynamic_form',
            data: {
                purpose: 'project_brief',
                context: {
                    projectType: 'Ecommerce',
                    budget: 15000,
                    timeline: '4 meses',
                    clientIndustry: 'Retail Fashion'
                }
            },
            userId: 'test@example.com'
        };
        
        const response = await fetch(`${baseUrl}/api/ai/automations/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        console.log('✅ Formulario generado exitosamente:');
        console.log('   📝 Título:', result.form?.title);
        console.log('   ⏱️ Tiempo estimado:', result.form?.estimated_time);
        console.log('   📊 Campos generados:', result.form?.fields?.length || 0);
        console.log('');
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('');
    }
    
    // Prueba 3: Reunión Inteligente - Kickoff de Proyecto
    console.log('🗓️ Prueba 3: Reunión Inteligente - Kickoff de Proyecto');
    try {
        const meetingData = {
            type: 'smart_meeting',
            data: {
                purpose: 'project_kickoff',
                participants: [
                    { name: 'Carlos López', role: 'PM' },
                    { name: 'Ana Martín', role: 'Designer' },
                    { name: 'Luis Pérez', role: 'Developer' }
                ],
                context: {
                    project: 'Desarrollo de Dashboard Analytics',
                    timeline: '3 meses',
                    budget: 12000,
                    technologies: ['React', 'Node.js', 'PostgreSQL']
                }
            },
            userId: 'test@example.com'
        };
        
        const response = await fetch(`${baseUrl}/api/ai/automations/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meetingData)
        });
        
        const result = await response.json();
        console.log('✅ Reunión programada exitosamente:');
        console.log('   🎯 Título:', result.meeting?.meeting_title);
        console.log('   ⏰ Duración:', result.meeting?.duration_minutes, 'minutos');
        console.log('   📋 Puntos de agenda:', result.meeting?.agenda?.length || 0);
        console.log('');
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('');
    }
    
    // Prueba 4: Enlace de Calendario - Consulta Inicial
    console.log('🔗 Prueba 4: Enlace de Calendario - Consulta Inicial');
    try {
        const calendarData = {
            type: 'calendar_link',
            data: {
                event_type: 'consultation',
                duration: 60,
                context: {
                    clientInquiry: 'Rediseño completo de sitio web corporativo',
                    industry: 'Consultoría Legal',
                    estimatedBudget: '€5,000 - €10,000',
                    urgency: 'alta'
                }
            },
            userId: 'test@example.com'
        };
        
        const response = await fetch(`${baseUrl}/api/ai/automations/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(calendarData)
        });
        
        const result = await response.json();
        console.log('✅ Enlace de calendario configurado:');
        console.log('   📅 Evento:', result.calendar?.event_title);
        console.log('   📝 Descripción personalizada:', result.calendar?.description?.slice(0, 80) + '...');
        console.log('   🎯 Objetivos:', result.calendar?.meeting_objectives?.slice(0, 2).join(', '));
        console.log('');
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('');
    }
    
    console.log('🎉 Pruebas de workflows completadas!');
    console.log('💡 Estos workflows pueden activarse automáticamente con eventos reales como:');
    console.log('   • Firma de contratos → Email de bienvenida');
    console.log('   • Nuevo cliente → Formulario de onboarding');
    console.log('   • Proyecto aprobado → Reunión de kickoff');
    console.log('   • Lead calificado → Enlace de calendario personalizado');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    testWorkflows().catch(console.error);
}

module.exports = { testWorkflows };
