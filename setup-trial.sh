#!/bin/bash

# Script para configurar el sistema de trial completo
echo "🚀 Configurando sistema de trial al 100%..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Verificando configuración de Supabase...${NC}"

# Verificar que las variables de entorno están configuradas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Error: Variables de Supabase no configuradas en .env.local${NC}"
    echo "Necesitas:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo -e "${GREEN}✅ Variables de Supabase configuradas${NC}"

echo -e "${YELLOW}🗃️ Ejecutando migración de base de datos...${NC}"

# Ejecutar la migración SQL
node -e "
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        console.log('📖 Leyendo archivo de migración...');
        const sqlFile = path.join(__dirname, 'database/subscription_trial_migration.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        console.log('⚡ Ejecutando migración SQL...');
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
            console.error('❌ Error ejecutando migración:', error);
            process.exit(1);
        }

        console.log('✅ Migración ejecutada exitosamente');
        console.log('📊 Verificando tablas creadas...');

        // Verificar que las tablas existan
        const { data: tables } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .in('table_name', ['subscription_plans', 'user_usage', 'trial_activities']);

        console.log('📋 Tablas encontradas:', tables?.map(t => t.table_name) || []);
        
    } catch (err) {
        console.error('💥 Error:', err);
        process.exit(1);
    }
}

runMigration();
"

echo -e "${GREEN}🎉 Sistema de trial configurado al 100%!${NC}"
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo "1. Reinicia el servidor: npm run dev"
echo "2. Ve a /dashboard para ver el banner de trial"
echo "3. El trial durará 14 días desde ahora"

echo -e "${GREEN}✨ ¡Listo para usar!${NC}"
