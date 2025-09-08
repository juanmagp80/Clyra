const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBudgetData() {
    try {
        console.log('🔍 VERIFICANDO DATOS DE PRESUPUESTO...\n');

        // Obtener todos los presupuestos con sus items
        const { data: budgets, error: budgetsError } = await supabase
            .from('budgets')
            .select(`
                *,
                client:clients(*),
                budget_items(*)
            `)
            .order('created_at', { ascending: false })
            .limit(3);

        if (budgetsError) {
            console.error('❌ Error obteniendo presupuestos:', budgetsError);
            return;
        }

        if (!budgets || budgets.length === 0) {
            console.log('❌ No se encontraron presupuestos');
            return;
        }

        console.log(`✅ Encontrados ${budgets.length} presupuesto(s):\n`);

        budgets.forEach((budget, index) => {
            console.log(`${index + 1}. 📋 PRESUPUESTO: ${budget.title}`);
            console.log(`   ID: ${budget.id}`);
            console.log(`   Cliente: ${budget.client?.name || 'Sin cliente'}`);
            console.log(`   Total BD: €${budget.total_amount || 0}`);
            console.log(`   Items: ${budget.budget_items?.length || 0}`);
            
            if (budget.budget_items && budget.budget_items.length > 0) {
                console.log('   📊 ITEMS:');
                let manualTotal = 0;
                budget.budget_items.forEach((item, itemIndex) => {
                    const itemTotal = parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0);
                    manualTotal += itemTotal;
                    console.log(`     ${itemIndex + 1}. ${item.title}`);
                    console.log(`        Cantidad: ${item.quantity}, Precio: €${item.unit_price}, Total: €${itemTotal}`);
                });
                console.log(`   💰 TOTAL CALCULADO MANUALMENTE: €${manualTotal}`);
                console.log(`   🔄 DIFERENCIA: €${(budget.total_amount || 0) - manualTotal}`);
            }
            console.log('');
        });

        // Verificar si existe la función update_budget_total
        console.log('🔍 VERIFICANDO TRIGGERS...');
        const { data: triggers, error: triggersError } = await supabase
            .from('information_schema.triggers')
            .select('*')
            .eq('event_object_table', 'budget_items');

        if (!triggersError && triggers) {
            console.log(`✅ Encontrados ${triggers.length} trigger(s) en budget_items`);
            triggers.forEach(trigger => {
                console.log(`   - ${trigger.trigger_name}: ${trigger.action_statement}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkBudgetData();
