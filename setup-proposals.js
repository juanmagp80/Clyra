// Script para ejecutar la migración de propuestas en Supabase
import { readFileSync } from 'fs';
import { join } from 'path';
import { createSupabaseClient } from '../src/lib/supabase-client';

async function runProposalsMigration() {
    const supabase = createSupabaseClient();

    try {
        console.log('🚀 Ejecutando migración de propuestas...');

        const migrationSQL = readFileSync(
            join(process.cwd(), 'database/proposals_migration_ultra_simple.sql'),
            'utf-8'
        );

        const { data, error } = await supabase.rpc('exec_sql', {
            sql: migrationSQL
        });

        if (error) {
            console.error('❌ Error en migración:', error);
            return false;
        }

        console.log('✅ Migración de propuestas completada exitosamente');
        console.log('📊 Datos:', data);

        // Verificar que las tablas se crearon
        const { data: tables, error: tablesError } = await supabase
            .from('proposals')
            .select('count', { count: 'exact', head: true });

        if (tablesError) {
            console.error('❌ Error verificando tabla proposals:', tablesError);
        } else {
            console.log('✅ Tabla proposals verificada correctamente');
        }

        return true;

    } catch (error) {
        console.error('💥 Error crítico en migración:', error);
        return false;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runProposalsMigration().then(success => {
        process.exit(success ? 0 : 1);
    });
}

export { runProposalsMigration };
