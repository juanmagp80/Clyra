const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno de Supabase no encontradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSimplePerformanceData() {
    console.log('📊 Creando datos de rendimiento con columnas existentes...');

    try {
        // 1. Obtener usuario actual
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) throw usersError;

        const user = users.find(u => u.email);
        if (!user) {
            console.error('❌ No se encontró ningún usuario');
            return;
        }

        console.log(`👤 Usuario encontrado: ${user.email}`);

        // 2. Crear eventos de calendario para los últimos 30 días usando columnas existentes
        const calendarEvents = [];
        const now = new Date();
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // 2-3 eventos por día
            const eventsPerDay = Math.floor(Math.random() * 2) + 2;
            
            for (let j = 0; j < eventsPerDay; j++) {
                const startHour = 9 + Math.floor(Math.random() * 8); // 9-17h
                const duration = [1, 2, 3][Math.floor(Math.random() * 3)]; // 1-3 horas
                
                const eventTypes = ['meeting', 'work', 'focus', 'development', 'admin'];
                const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                
                const startTime = new Date(date);
                startTime.setHours(startHour, 0, 0, 0);
                
                const endTime = new Date(startTime);
                endTime.setHours(endTime.getHours() + duration);

                // Productividad basada en tipo de evento (1-10)
                const productivityScores = {
                    focus: [8, 9, 10],
                    development: [7, 8, 9],
                    work: [6, 7, 8],
                    meeting: [5, 6, 7],
                    admin: [4, 5, 6]
                };
                
                const productivity = productivityScores[eventType][Math.floor(Math.random() * 3)];
                
                // Revenue basado en si es facturable
                const isBillable = eventType === 'development' || eventType === 'work' || eventType === 'focus';
                const hourlyRate = 50 + Math.floor(Math.random() * 50); // €50-100/hora
                const actualRevenue = isBillable ? duration * hourlyRate : 0;
                
                calendarEvents.push({
                    user_id: user.id,
                    title: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Session ${j + 1}`,
                    description: `Trabajo de ${eventType} - ${duration}h`,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    type: eventType,
                    is_billable: isBillable,
                    hourly_rate: isBillable ? hourlyRate : null,
                    estimated_revenue: isBillable ? duration * hourlyRate : 0,
                    actual_revenue: actualRevenue,
                    productivity_score: productivity,
                    efficiency_rating: productivity,
                    satisfaction_rating: Math.floor(Math.random() * 3) + 8, // 8-10
                    status: 'completed',
                    energy_level: Math.floor(Math.random() * 3) + 8, // 8-10
                    created_at: new Date().toISOString()
                });
            }
        }

        console.log(`📅 Insertando ${calendarEvents.length} eventos de calendario...`);
        
        // Insertar en lotes más pequeños
        const batchSize = 10;
        let totalInserted = 0;
        
        for (let i = 0; i < calendarEvents.length; i += batchSize) {
            const batch = calendarEvents.slice(i, i + batchSize);
            
            const { data: insertedBatch, error: batchError } = await supabase
                .from('calendar_events')
                .insert(batch)
                .select('id');

            if (batchError) {
                console.error(`Error insertando lote ${i/batchSize + 1}:`, batchError);
            } else {
                totalInserted += insertedBatch.length;
                console.log(`✅ Lote ${i/batchSize + 1}: ${insertedBatch.length} eventos insertados`);
            }
        }

        console.log(`🎉 Total eventos creados: ${totalInserted}`);

        // 3. Crear algunos insights previos de IA usando la estructura existente
        const aiInsights = [
            {
                user_id: user.id,
                insight_type: 'performance_analysis',
                category: 'productivity',
                title: 'Análisis de Productividad Semanal',
                description: 'Análisis automático del rendimiento de la última semana',
                confidence_score: 85,
                impact_score: 78,
                actionability_score: 92,
                recommendations: ['Optimizar horarios matutinos', 'Reducir reuniones en bloques de focus'],
                suggested_actions: ['Implementar time blocking', 'Configurar do-not-disturb'],
                status: 'active',
                time_period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                time_period_end: new Date().toISOString(),
                auto_generated: true,
                generation_algorithm: 'performance_analyzer_v1',
                created_at: new Date().toISOString()
            },
            {
                user_id: user.id,
                insight_type: 'revenue_optimization',
                category: 'financial',
                title: 'Oportunidades de Optimización de Ingresos',
                description: 'Identificación de patrones para incrementar revenue por hora',
                confidence_score: 78,
                impact_score: 95,
                actionability_score: 88,
                recommendations: ['Incrementar tarifas en desarrollo', 'Reducir tiempo administrativo'],
                suggested_actions: ['Revisar pricing', 'Automatizar admin tasks'],
                status: 'active',
                time_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                time_period_end: new Date().toISOString(),
                auto_generated: true,
                generation_algorithm: 'revenue_optimizer_v1',
                created_at: new Date().toISOString()
            }
        ];

        console.log(`🤖 Insertando ${aiInsights.length} insights de IA...`);
        
        const { data: insertedInsights, error: insightsError } = await supabase
            .from('ai_insights')
            .insert(aiInsights)
            .select('id');

        if (insightsError) {
            console.error('Error insertando insights:', insightsError);
        } else {
            console.log(`✅ ${insertedInsights.length} insights de IA creados`);
        }

        // 4. Resumen final
        console.log('\n🎉 ¡Datos de prueba listos!');
        console.log('📊 Resumen:');
        console.log(`  • ${totalInserted} eventos de calendario con métricas de productividad`);
        console.log(`  • ${insertedInsights?.length || 0} insights de IA existentes`);
        console.log('\n✨ Ya puedes probar el Análisis de Rendimiento en:');
        console.log('   🌐 http://localhost:3000/dashboard/ai-automations');

    } catch (error) {
        console.error('❌ Error creando datos de prueba:', error);
    }
}

// Ejecutar el script
createSimplePerformanceData();
