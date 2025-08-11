
// Script para restaurar políticas normales después del testing
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function restoreNormalPolicies() {
    try {
        console.log('🔒 Restaurando políticas normales...');
        
        // Eliminar políticas temporales
        const cleanupSQL = `
            DROP POLICY IF EXISTS temp_public_tasks_select ON tasks;
            DROP POLICY IF EXISTS temp_public_tasks_insert ON tasks;
            DROP POLICY IF EXISTS temp_public_tasks_update ON tasks;
            DROP POLICY IF EXISTS temp_public_tasks_delete ON tasks;
            
            DROP POLICY IF EXISTS temp_public_projects_select ON projects;
            DROP POLICY IF EXISTS temp_public_projects_insert ON projects;
            DROP POLICY IF EXISTS temp_public_projects_update ON projects;
            DROP POLICY IF EXISTS temp_public_projects_delete ON projects;
            
            -- Crear políticas normales basadas en user_id
            CREATE POLICY tasks_user_policy ON tasks FOR ALL USING (auth.uid() = user_id);
            CREATE POLICY projects_user_policy ON projects FOR ALL USING (auth.uid() = user_id);
        `;
        
        console.log('✅ Políticas restauradas');
        
    } catch (error) {
        console.error('❌ Error restaurando:', error);
    }
}

restoreNormalPolicies();
