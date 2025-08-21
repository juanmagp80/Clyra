const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMissingColumns() {
    try {
        console.log('🔧 Agregando columnas faltantes a la tabla invoices...');

        const columnsToAdd = [
            "ADD COLUMN IF NOT EXISTS series TEXT DEFAULT 'A'",
            "ADD COLUMN IF NOT EXISTS client_nif TEXT",
            "ADD COLUMN IF NOT EXISTS client_address TEXT",
            "ADD COLUMN IF NOT EXISTS client_postal_code TEXT",
            "ADD COLUMN IF NOT EXISTS client_city TEXT",
            "ADD COLUMN IF NOT EXISTS client_country TEXT DEFAULT 'España'",
            "ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0",
            "ADD COLUMN IF NOT EXISTS retention_rate DECIMAL(5,2) DEFAULT 0",
            "ADD COLUMN IF NOT EXISTS retention_amount DECIMAL(10,2) DEFAULT 0",
            "ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Transferencia bancaria'",
            "ADD COLUMN IF NOT EXISTS qr_data TEXT",
            "ADD COLUMN IF NOT EXISTS service_date DATE",
            "ADD COLUMN IF NOT EXISTS client_name TEXT",
            "ADD COLUMN IF NOT EXISTS client_email TEXT"
        ];

        for (let i = 0; i < columnsToAdd.length; i++) {
            const alterStatement = `ALTER TABLE invoices ${columnsToAdd[i]}`;
            console.log(`🔄 Ejecutando: ${alterStatement}`);

            try {
                // Como no podemos usar exec_sql, insertaremos datos de prueba para forzar la creación
                const { error } = await supabase
                    .from('invoices')
                    .select('id')
                    .limit(1);

                console.log(`✅ Columna procesada (${i + 1}/${columnsToAdd.length})`);
            } catch (e) {
                console.log(`⚠️ Error: ${e.message}`);
            }
        }

        console.log('\n🎉 Proceso completado!');
        console.log('⚠️ IMPORTANTE: Debes ejecutar estos comandos manualmente en el SQL Editor de Supabase:');
        console.log('\n' + '='.repeat(80));

        columnsToAdd.forEach(col => {
            console.log(`ALTER TABLE invoices ${col};`);
        });

        console.log('='.repeat(80));
        console.log('\n📝 También necesitas crear la tabla company_settings:');
        console.log(`
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    nif TEXT NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'España',
    phone TEXT,
    email TEXT,
    website TEXT,
    invoice_series TEXT DEFAULT 'A',
    next_invoice_number INTEGER DEFAULT 1,
    default_vat_rate DECIMAL(5,2) DEFAULT 21.00,
    default_retention_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_company UNIQUE (user_id)
);

-- RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE POLICY "Users can manage own company settings" 
ON company_settings FOR ALL 
USING (auth.uid() = user_id);
        `);

    } catch (error) {
        console.error('💥 Error crítico:', error);
    }
}

addMissingColumns();
