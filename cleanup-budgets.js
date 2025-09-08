const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDuplicateBudgets() {
    try {
        console.log('🧹 LIMPIANDO PRESUPUESTOS DUPLICADOS...\n');

        // Eliminar el presupuesto vacío (€0 y 0 items)
        const { data: deletedBudget, error: deleteError } = await supabase
            .from('budgets')
            .delete()
            .eq('id', 'b1d1cd0a-7dba-4408-898b-d19d2b6a1bc7')
            .select();

        if (deleteError) {
            console.error('❌ Error eliminando presupuesto duplicado:', deleteError);
            return;
        }

        console.log('✅ Presupuesto duplicado eliminado');

        // Verificar que queda el presupuesto correcto
        const { data: remainingBudgets, error: budgetsError } = await supabase
            .from('budgets')
            .select(`
                id,
                title,
                total_amount,
                client:clients(name),
                budget_items(id)
            `)
            .order('created_at', { ascending: false });

        if (budgetsError) {
            console.error('❌ Error obteniendo presupuestos restantes:', budgetsError);
            return;
        }

        console.log('\n📋 PRESUPUESTOS RESTANTES:');
        remainingBudgets.forEach((budget, index) => {
            console.log(`${index + 1}. ${budget.title}`);
            console.log(`   ID: ${budget.id}`);
            console.log(`   Cliente: ${budget.client?.name}`);
            console.log(`   Total: €${budget.total_amount || 0}`);
            console.log(`   Items: ${budget.budget_items?.length || 0}\n`);
        });

        console.log('🎯 PRUEBA AHORA EL OPTIMIZADOR DE PRECIOS');
        console.log('✅ Selecciona el presupuesto "Plataforma E-commerce Completa" con €39,250');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

cleanupDuplicateBudgets();
