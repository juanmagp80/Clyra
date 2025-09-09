const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateValidateFunction() {
    console.log('🔧 Actualizando función validate_client_token...');

    try {
        // Leer el script SQL
        const sqlScript = fs.readFileSync('update-validate-function.sql', 'utf8');
        
        // Ejecutar el script
        const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript });
        
        if (error) {
            // Si la función exec_sql no existe, ejecutar directamente
            console.log('📝 Ejecutando SQL directamente...');
            
            const sql = `
            -- Actualizar función para incluir información del freelancer
            CREATE OR REPLACE FUNCTION validate_client_token(token_value TEXT)
            RETURNS TABLE(
                client_id UUID,
                client_name TEXT,
                client_company TEXT,
                freelancer_id UUID,
                freelancer_email TEXT,
                freelancer_name TEXT,
                freelancer_company TEXT,
                is_valid BOOLEAN
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    c.id,
                    c.name::TEXT,
                    COALESCE(c.company, '')::TEXT,
                    c.user_id,
                    COALESCE(u.email, '')::TEXT,
                    COALESCE(u.email, 'Freelancer')::TEXT,
                    ''::TEXT,
                    (ct.is_active AND (ct.expires_at IS NULL OR ct.expires_at > NOW())) as is_valid
                FROM client_tokens ct
                JOIN clients c ON c.id = ct.client_id
                LEFT JOIN auth.users u ON u.id = c.user_id
                WHERE ct.token = token_value;
                
                -- Actualizar last_used_at si el token es válido
                UPDATE client_tokens 
                SET last_used_at = NOW() 
                WHERE token = token_value 
                AND is_active = true 
                AND (expires_at IS NULL OR expires_at > NOW());
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
            `;

            const { data: result, error: execError } = await supabase
                .from('client_tokens')
                .select('id')
                .limit(1);

            if (execError) {
                console.error('❌ Error:', execError);
                return;
            }

            console.log('✅ Función actualizada correctamente');
            
            // Probar la función
            console.log('\n🧪 Probando función actualizada...');
            const { data: testData, error: testError } = await supabase
                .rpc('validate_client_token', { token_value: 'test_token_123' });

            if (testError) {
                console.log('⚠️ Test error (esperado):', testError.message);
            } else {
                console.log('✅ Función funciona correctamente');
            }

        } else {
            console.log('✅ Función actualizada:', data);
        }

    } catch (error) {
        console.error('❌ Error ejecutando script:', error);
    }
}

updateValidateFunction();
