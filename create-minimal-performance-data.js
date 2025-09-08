const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno de Supabase no encontradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMinimalPerformanceData() {
    console.log('📊 Creando datos mínimos para prueba de rendimiento...');

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

        // 2. Crear eventos básicos respetando restricciones
        const calendarEvents = [];
        const now = new Date();
        
        for (let i = 0; i < 15; i++) { // Solo 15 eventos para probar
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            const startHour = 10 + Math.floor(Math.random() * 6); // 10-16h
            const duration = [1, 2][Math.floor(Math.random() * 2)]; // 1-2 horas
            
            const eventTypes = ['meeting', 'work', 'development'];
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            
            const startTime = new Date(date);
            startTime.setHours(startHour, 0, 0, 0);
            
            const endTime = new Date(startTime);
            endTime.setHours(endTime.getHours() + duration);

            // Productividad 1-10 (sin decimales)
            const productivity = Math.floor(Math.random() * 5) + 6; // 6-10
            
            // Revenue muy simple
            const isBillable = eventType === 'development' || eventType === 'work';
            const hourlyRate = 50; // Tarifa fija
            const actualRevenue = isBillable ? duration * hourlyRate : 0;
            
            calendarEvents.push({
                user_id: user.id,
                title: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} ${i + 1}`,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                type: eventType,
                is_billable: isBillable,
                hourly_rate: isBillable ? hourlyRate : null,
                actual_revenue: actualRevenue,
                productivity_score: productivity,
                status: 'completed'
            });
        }

        console.log(`📅 Insertando ${calendarEvents.length} eventos simples...`);
        
        // Insertar uno por uno para manejar errores
        let successCount = 0;
        
        for (let i = 0; i < calendarEvents.length; i++) {
            const event = calendarEvents[i];
            
            const { data: insertedEvent, error: eventError } = await supabase
                .from('calendar_events')
                .insert([event])
                .select('id');

            if (eventError) {
                console.log(`❌ Error evento ${i + 1}:`, eventError.message);
            } else {
                successCount++;
                console.log(`✅ Evento ${i + 1} creado exitosamente`);
            }
        }

        console.log(`🎉 Total eventos creados: ${successCount}/${calendarEvents.length}`);

        // 3. Crear insight básico de IA
        const aiInsight = {
            user_id: user.id,
            insight_type: 'performance_analysis',
            category: 'productivity',
            title: 'Análisis de Rendimiento',
            description: 'Datos básicos de rendimiento disponibles',
            confidence_score: 8.5, // Usar decimal válido
            impact_score: 7.8,
            actionability_score: 9.2,
            status: 'active',
            auto_generated: true,
            created_at: new Date().toISOString()
        };

        console.log(`🤖 Insertando insight de IA...`);
        
        const { data: insertedInsight, error: insightError } = await supabase
            .from('ai_insights')
            .insert([aiInsight])
            .select('id');

        if (insightError) {
            console.error('Error insertando insight:', insightError);
        } else {
            console.log(`✅ Insight de IA creado exitosamente`);
        }

        // 4. Resumen
        console.log('\n🎉 ¡Datos mínimos listos!');
        console.log('📊 Resumen:');
        console.log(`  • ${successCount} eventos de calendario`);
        console.log(`  • 1 insight de IA`);
        console.log('\n✨ Puedes probar el Análisis de Rendimiento en:');
        console.log('   🌐 http://localhost:3000/dashboard/ai-automations');
        console.log('\n📝 Nota: Si necesitas más datos, podemos crearlos después de verificar que funcione');

    } catch (error) {
        console.error('❌ Error creando datos de prueba:', error);
    }
}

// Ejecutar el script
createMinimalPerformanceData();
