const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Supabase Connection...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📋 Environment Variables:');
console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('- SUPABASE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
console.log('- URL Valid:', supabaseUrl?.startsWith('https://') ? '✅ Yes' : '❌ No');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('\n🔐 Testing authentication status...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.log('⚠️ Session error:', sessionError.message);
        } else {
            console.log('✅ Auth check passed');
            console.log('👤 Current session:', session ? 'Logged in' : 'Not logged in');
            if (session) {
                console.log('📧 User email:', session.user?.email);
            }
        }

        console.log('\n📊 Testing table access...');

        // Test básico de conexión
        const { data: testData, error: testError } = await supabase
            .from('clients')
            .select('count', { count: 'exact', head: true });

        if (testError) {
            console.error('❌ Database connection failed:', testError.message);
            console.error('- Error code:', testError.code);
            console.error('- Error details:', testError.details);
        } else {
            console.log('✅ Database connection successful');
            console.log('📊 Clients table access: OK');
        }

        // Test de otros tables
        const tables = ['projects', 'tasks', 'invoices', 'time_entries'];

        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('count', { count: 'exact', head: true });

                if (error) {
                    console.log(`❌ ${table}: ${error.message}`);
                } else {
                    console.log(`✅ ${table}: OK`);
                }
            } catch (err) {
                console.log(`❌ ${table}: ${err.message}`);
            }
        }

    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
    }
}

testConnection().then(() => {
    console.log('\n🏁 Connection test completed');
    process.exit(0);
});
