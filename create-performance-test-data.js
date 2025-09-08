// Script para crear datos de prueba para análisis de rendimiento
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno faltantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPerformanceTestData() {
    console.log('🔧 Creando datos de prueba para análisis de rendimiento...');

    try {
        // 1. Obtener el usuario de prueba
        const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, email')
            .limit(1);

        if (usersError || !users || users.length === 0) {
            console.error('❌ No se encontraron usuarios:', usersError);
            return;
        }

        const userId = users[0].id;
        console.log(`👤 Usuario seleccionado: ${users[0].email} (${userId})`);

        // 2. Crear eventos de calendario de los últimos 30 días
        const calendarEvents = [];
        const now = new Date();
        
        for (let i = 0; i < 30; i++) {
            const eventDate = new Date(now);
            eventDate.setDate(now.getDate() - i);
            
            // 2-4 eventos por día
            const eventsPerDay = Math.floor(Math.random() * 3) + 2;
            
            for (let j = 0; j < eventsPerDay; j++) {
                const startHour = 9 + Math.floor(Math.random() * 8); // 9-17h
                const duration = [30, 60, 90, 120][Math.floor(Math.random() * 4)];
                
                const startTime = new Date(eventDate);
                startTime.setHours(startHour, 0, 0, 0);
                
                const endTime = new Date(startTime);
                endTime.setMinutes(startTime.getMinutes() + duration);
                
                const eventTypes = ['work', 'meeting', 'development', 'design', 'planning', 'client_call'];
                const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                
                calendarEvents.push({
                    user_id: userId,
                    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Session`,
                    type: type,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    duration_minutes: duration,
                    productivity_score: Math.floor(Math.random() * 4) + 7, // 7-10
                    actual_revenue: type === 'client_call' || type === 'work' ? Math.floor(Math.random() * 200) + 50 : 0,
                    status: 'completed',
                    created_at: eventDate.toISOString()
                });
            }
        }

        console.log(`📅 Insertando ${calendarEvents.length} eventos de calendario...`);
        const { error: eventsError } = await supabase
            .from('calendar_events')
            .insert(calendarEvents);

        if (eventsError) {
            console.error('❌ Error insertando eventos:', eventsError);
        } else {
            console.log('✅ Eventos de calendario creados');
        }

        // 3. Crear sesiones de time tracking
        const trackingSessions = [];
        
        for (let i = 0; i < 45; i++) { // 45 sesiones en 30 días
            const sessionDate = new Date(now);
            sessionDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
            
            const startHour = 9 + Math.floor(Math.random() * 8);
            const duration = [60, 90, 120, 180, 240][Math.floor(Math.random() * 5)];
            const billablePercentage = 0.7 + Math.random() * 0.3; // 70-100%
            const billableDuration = Math.floor(duration * billablePercentage);
            
            const startTime = new Date(sessionDate);
            startTime.setHours(startHour, 0, 0, 0);
            
            const endTime = new Date(startTime);
            endTime.setMinutes(startTime.getMinutes() + duration);
            
            const taskTypes = ['development', 'design', 'planning', 'documentation', 'client_work'];
            
            trackingSessions.push({
                user_id: userId,
                task_type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                duration_minutes: duration,
                billable_minutes: billableDuration,
                productivity_score: Math.floor(Math.random() * 3) + 7, // 7-9
                break_duration_minutes: Math.floor(Math.random() * 15), // 0-15 min
                energy_level_before: Math.floor(Math.random() * 3) + 7, // 7-9
                energy_level_after: Math.floor(Math.random() * 4) + 6, // 6-9
                created_at: sessionDate.toISOString()
            });
        }

        console.log(`⏱️ Insertando ${trackingSessions.length} sesiones de tracking...`);
        const { error: trackingError } = await supabase
            .from('time_tracking_sessions')
            .insert(trackingSessions);

        if (trackingError) {
            console.error('❌ Error insertando sesiones de tracking:', trackingError);
        } else {
            console.log('✅ Sesiones de time tracking creadas');
        }

        // 4. Crear algunos patrones de productividad
        const productivityPatterns = [];
        
        for (let hour = 9; hour <= 17; hour++) {
            productivityPatterns.push({
                user_id: userId,
                hour_of_day: hour,
                day_of_week: Math.floor(Math.random() * 5) + 1, // Lunes-Viernes
                average_productivity: 6 + Math.random() * 4, // 6-10
                session_count: Math.floor(Math.random() * 10) + 5, // 5-15
                created_at: new Date().toISOString()
            });
        }

        console.log(`📊 Insertando ${productivityPatterns.length} patrones de productividad...`);
        const { error: patternsError } = await supabase
            .from('productivity_patterns')
            .insert(productivityPatterns);

        if (patternsError) {
            console.error('❌ Error insertando patrones:', patternsError);
        } else {
            console.log('✅ Patrones de productividad creados');
        }

        console.log('\n🎉 ¡Datos de prueba para análisis de rendimiento creados exitosamente!');
        console.log(`📈 Resumen:`);
        console.log(`   • ${calendarEvents.length} eventos de calendario`);
        console.log(`   • ${trackingSessions.length} sesiones de tracking`);
        console.log(`   • ${productivityPatterns.length} patrones de productividad`);
        console.log('\n✨ Ya puedes probar el Analizador de Rendimiento!');

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

createPerformanceTestData();
