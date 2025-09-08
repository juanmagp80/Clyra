const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODA5NzUsImV4cCI6MjA2OTU1Njk3NX0.77Si27sIxzCtJqmw3Z81dJDejKcgaX9pm8eZMldPr4I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBudgetsStructure() {
    try {
        // Obtener algunos presupuestos existentes para ver la estructura
        const { data: budgets, error } = await supabase
            .from('budgets')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error:', error);
            return;
        }

        console.log('🔍 ESTRUCTURA DE TABLA BUDGETS:');
        if (budgets && budgets.length > 0) {
            console.log('Columnas disponibles:', Object.keys(budgets[0]));
            console.log('\nEjemplo de presupuesto:');
            console.log(JSON.stringify(budgets[0], null, 2));
        } else {
            console.log('No hay presupuestos en la tabla');
        }

        // También revisar budget_items
        const { data: items, error: itemsError } = await supabase
            .from('budget_items')
            .select('*')
            .limit(1);

        if (!itemsError && items && items.length > 0) {
            console.log('\n🔍 ESTRUCTURA DE TABLA BUDGET_ITEMS:');
            console.log('Columnas disponibles:', Object.keys(items[0]));
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkBudgetsStructure();
