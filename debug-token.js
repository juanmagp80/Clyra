// Script para debuggear el problema del token
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Debugging token validation...');
console.log('Supabase URL:', supabaseUrl ? '✅ Configurado' : '❌ No configurado');
console.log('Service Key:', supabaseServiceKey ? '✅ Configurado' : '❌ No configurado');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Faltan variables de entorno');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugToken() {
    try {
        const token = 'jKe1b9c5sXh5R4TnYlocyxs7SWD4TBtc'; // Token del error

        console.log('🔍 Buscando token:', token);

        // 1. Verificar si la tabla client_tokens existe
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .like('table_name', '%token%');

        if (tablesError) {
            console.error('❌ Error consultando tablas:', tablesError);
        } else {
            console.log('📋 Tablas con "token":', tables?.map(t => t.table_name));
        }

        // 2. Verificar directamente en client_tokens
        const { data: tokenData, error: tokenError } = await supabase
            .from('client_tokens')
            .select('*')
            .eq('token', token);

        if (tokenError) {
            console.error('❌ Error consultando client_tokens:', tokenError);
        } else {
            console.log('🎯 Token encontrado:', tokenData);
        }

        // 3. Verificar si la función RPC existe
        try {
            const { data: rpcData, error: rpcError } = await supabase
                .rpc('validate_client_token', { token_value: token });

            if (rpcError) {
                console.error('❌ Error en RPC validate_client_token:', rpcError);
            } else {
                console.log('✅ RPC validate_client_token funciona:', rpcData);
            }
        } catch (err) {
            console.error('❌ Error ejecutando RPC:', err);
        }

        // 4. Verificar todos los tokens existentes
        const { data: allTokens, error: allTokensError } = await supabase
            .from('client_tokens')
            .select('token, client_id, is_active, expires_at, created_at')
            .limit(5);

        if (allTokensError) {
            console.error('❌ Error consultando todos los tokens:', allTokensError);
        } else {
            console.log('📋 Tokens existentes:', allTokens);
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

debugToken();
