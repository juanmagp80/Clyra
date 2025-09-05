// Ver los insights guardados recientemente
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

async function showRecentInsights() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL, 
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    console.log('📊 INSIGHTS RECIENTES');
    console.log('====================');

    const { data: insights, error } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.log('❌ Error:', error.message);
        return;
    }

    insights.forEach((insight, index) => {
        console.log(`\n${index + 1}. ${insight.title}`);
        console.log(`   📅 Creado: ${new Date(insight.created_at).toLocaleString()}`);
        console.log(`   🏷️  Tipo: ${insight.insight_type}`);
        console.log(`   📊 Confianza: ${insight.confidence_score * 100}%`);
        console.log(`   💡 Descripción: ${insight.description}`);
        
        if (insight.data_points) {
            console.log(`   📋 Datos:`);
            const data = insight.data_points;
            if (data.sentiment) {
                console.log(`      - Sentimiento: ${data.sentiment}`);
                console.log(`      - Texto original: "${data.original_text?.substring(0, 50)}..."`);
            }
            if (data.optimized_message) {
                console.log(`      - Mensaje optimizado disponible`);
            }
        }
        
        if (insight.recommendations) {
            console.log(`   💭 Recomendaciones: ${insight.recommendations.slice(0, 2).join(', ')}`);
        }
    });
}

showRecentInsights();
