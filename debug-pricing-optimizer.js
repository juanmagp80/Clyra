const fetch = require('node-fetch');

async function testPricingOptimizer() {
    try {
        console.log('🧪 PROBANDO OPTIMIZADOR DE PRECIOS...\n');

        const response = await fetch('http://localhost:3000/api/ai/optimize-pricing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                budgetId: 'ada4baf7-0d6c-46a1-98ff-2e53d8bdb867' // ID del presupuesto E-commerce
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('❌ Error en la respuesta:', result);
            return;
        }

        console.log('✅ RESPUESTA EXITOSA:');
        console.log('📋 Presupuesto:', result.budget?.title);
        console.log('💰 Total:', `€${result.budget?.total_amount}`);
        console.log('📊 Items:', result.budget?.items?.length);

        console.log('\n🔍 ANÁLISIS GENERADO:');
        console.log('• Puntuación actual:', result.analysis?.pricing_assessment?.current_pricing_score || 'N/A');
        console.log('• Probabilidad aceptación:', `${result.analysis?.risk_assessment?.client_acceptance_probability || 'N/A'}%`);
        console.log('• Total optimizado:', `€${result.analysis?.financial_impact?.optimized_total || 'N/A'}`);
        console.log('• Mejora:', `${result.analysis?.financial_impact?.percentage_improvement || 'N/A'}%`);

        console.log('\n📈 RECOMENDACIONES:');
        if (result.analysis?.optimization_recommendations?.length > 0) {
            result.analysis.optimization_recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. ${rec.item_name}: €${rec.current_price} → €${rec.suggested_price} (${rec.adjustment_percentage.toFixed(1)}%)`);
            });
        } else {
            console.log('Sin recomendaciones específicas');
        }

        console.log('\n🎯 ANÁLISIS FUNCIONANDO CORRECTAMENTE');

    } catch (error) {
        console.error('❌ Error probando optimizador:', error.message);
    }
}

testPricingOptimizer();
