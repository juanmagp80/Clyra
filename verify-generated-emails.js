const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function verifyEmails() {
    console.log('🔍 Verificando emails generados...\n');
    
    // Usar las variables de entorno correctas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Variables de entorno faltantes:');
        console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ Faltante');
        console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Configurado' : '❌ Faltante');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // Obtener los últimos emails generados
        const { data: emails, error } = await supabase
            .from('ai_insights')
            .select('*')
            .eq('type', 'email')
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (error) {
            console.error('❌ Error:', error.message);
            return;
        }
        
        if (!emails || emails.length === 0) {
            console.log('📭 No se encontraron emails en ai_insights');
            return;
        }
        
        console.log(`📧 ${emails.length} emails encontrados:\n`);
        
        emails.forEach((email, index) => {
            console.log(`${index + 1}. 📩 ${email.subject || 'Sin asunto'}`);
            console.log(`   📅 ${new Date(email.created_at).toLocaleString()}`);
            console.log(`   🎯 Tipo: ${email.event_type || 'No especificado'}`);
            console.log(`   👤 Cliente: ${email.client_name || 'No especificado'}`);
            console.log(`   📄 Contenido: ${email.content?.substring(0, 100)}...`);
            console.log('   ─────────────────────────────────────\n');
        });
        
        // Estadísticas rápidas
        const eventTypes = emails.reduce((acc, email) => {
            acc[email.event_type || 'unknown'] = (acc[email.event_type || 'unknown'] || 0) + 1;
            return acc;
        }, {});
        
        console.log('📊 Estadísticas por tipo de evento:');
        Object.entries(eventTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} emails`);
        });
        
    } catch (error) {
        console.error('❌ Error verificando emails:', error.message);
    }
}

verifyEmails();
