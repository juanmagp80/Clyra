const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno de Supabase no encontradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSchema() {
    console.log('🔍 Verificando esquema de base de datos...');

    try {
        // Verificar tablas existentes
        const { data: tables, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .like('table_name', '%event%,%tracking%,%pattern%');

        if (error) {
            console.log('Info: No se pudo obtener info del esquema, probando tablas directamente...');
        }

        // Probar calendar_events
        console.log('\n📅 Verificando tabla calendar_events...');
        const { data: events, error: eventsError } = await supabase
            .from('calendar_events')
            .select('*')
            .limit(1);

        if (eventsError) {
            console.log('❌ Error con calendar_events:', eventsError.message);
        } else {
            console.log('✅ calendar_events existe');
            if (events && events.length > 0) {
                console.log('📝 Columnas disponibles:', Object.keys(events[0]).join(', '));
            }
        }

        // Probar time_tracking_sessions
        console.log('\n⏱️ Verificando tabla time_tracking_sessions...');
        const { data: sessions, error: sessionsError } = await supabase
            .from('time_tracking_sessions')
            .select('*')
            .limit(1);

        if (sessionsError) {
            console.log('❌ Error con time_tracking_sessions:', sessionsError.message);
        } else {
            console.log('✅ time_tracking_sessions existe');
            if (sessions && sessions.length > 0) {
                console.log('📝 Columnas disponibles:', Object.keys(sessions[0]).join(', '));
            }
        }

        // Probar productivity_patterns
        console.log('\n📈 Verificando tabla productivity_patterns...');
        const { data: patterns, error: patternsError } = await supabase
            .from('productivity_patterns')
            .select('*')
            .limit(1);

        if (patternsError) {
            console.log('❌ Error con productivity_patterns:', patternsError.message);
        } else {
            console.log('✅ productivity_patterns existe');
            if (patterns && patterns.length > 0) {
                console.log('📝 Columnas disponibles:', Object.keys(patterns[0]).join(', '));
            }
        }

        // Verificar si ai_insights existe
        console.log('\n🤖 Verificando tabla ai_insights...');
        const { data: insights, error: insightsError } = await supabase
            .from('ai_insights')
            .select('*')
            .limit(1);

        if (insightsError) {
            console.log('❌ Error con ai_insights:', insightsError.message);
        } else {
            console.log('✅ ai_insights existe');
            if (insights && insights.length > 0) {
                console.log('📝 Columnas disponibles:', Object.keys(insights[0]).join(', '));
            }
        }

    } catch (error) {
        console.error('❌ Error verificando esquema:', error);
    }
}

// Ejecutar el script
checkDatabaseSchema();
