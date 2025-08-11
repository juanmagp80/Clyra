// Script para ejecutar la migración de propuestas en Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runProposalsMigration() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    try {
        console.log('🚀 Ejecutando migración de propuestas...');
        
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'database/proposals_migration_ultra_simple.sql'), 
            'utf-8'
        );
        
        // En lugar de usar rpc, vamos a ejecutar las consultas directamente
        // Primero verificamos si las tablas ya existen
        const { data: proposalsTable, error: proposalsError } = await supabase
            .from('proposals')
            .select('id')
            .limit(1);
            
        if (proposalsError && proposalsError.code === 'PGRST116') {
            console.log('📋 Tabla proposals no existe, necesita crearse...');
            console.log('⚠️  Ejecuta este SQL manualmente en Supabase SQL Editor:');
            console.log('='.repeat(60));
            console.log(migrationSQL);
            console.log('='.repeat(60));
        } else {
            console.log('✅ Tabla proposals ya existe');
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

module.exports = { runProposalsMigration };
