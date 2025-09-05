// Cargar variables de entorno explícitamente
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 VERIFICACIÓN Y CREACIÓN DE TABLA USERS');
console.log('=========================================');

async function checkAndCreateUsersTable() {
    try {
        if (!supabaseUrl || !supabaseServiceKey) {
            console.log('❌ Variables de entorno faltantes');
            return;
        }

        // Crear cliente administrativo
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        console.log('\n1. VERIFICANDO TABLAS EXISTENTES:');
        
        // Verificar si existe la tabla users
        const { data: tables, error: tablesError } = await supabaseAdmin
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

        if (tablesError) {
            console.log('❌ Error verificando tablas:', tablesError.message);
        } else {
            console.log('✅ Tablas existentes:');
            tables.forEach(table => {
                console.log(`- ${table.table_name}`);
            });
        }

        // Verificar usuarios de auth.users (tabla de autenticación de Supabase)
        console.log('\n2. VERIFICANDO USUARIOS DE AUTENTICACIÓN:');
        
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) {
            console.log('❌ Error obteniendo usuarios auth:', authError.message);
        } else {
            console.log('✅ Usuarios de autenticación encontrados:');
            authUsers.users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
                console.log(`   - Creado: ${new Date(user.created_at).toLocaleString()}`);
                console.log(`   - Último login: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Nunca'}`);
            });
        }

        // Crear tabla users si no existe
        console.log('\n3. CREANDO TABLA USERS (SI NO EXISTE):');
        
        const createUsersTableSQL = `
        CREATE TABLE IF NOT EXISTS public.users (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            avatar_url TEXT,
            trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
            subscription_status TEXT DEFAULT 'trial',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Crear política RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        -- Política para que los usuarios solo puedan ver/editar sus propios datos
        DROP POLICY IF EXISTS "Users can view own data" ON public.users;
        CREATE POLICY "Users can view own data" ON public.users
            FOR SELECT USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update own data" ON public.users;
        CREATE POLICY "Users can update own data" ON public.users
            FOR UPDATE USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
        CREATE POLICY "Users can insert own data" ON public.users
            FOR INSERT WITH CHECK (auth.uid() = id);

        -- Función para crear automáticamente el perfil cuando se registra un usuario
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO public.users (id, email, full_name)
            VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Trigger para crear automáticamente el perfil
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        `;

        const { error: createError } = await supabaseAdmin.rpc('exec_sql', { 
            sql: createUsersTableSQL 
        });

        if (createError) {
            console.log('❌ Error creando tabla users:', createError.message);
            
            // Intentar crear usando método alternativo
            console.log('\n4. INTENTANDO MÉTODO ALTERNATIVO:');
            try {
                // Crear tabla básica primero
                const { error: basicError } = await supabaseAdmin
                    .from('users')
                    .select('*')
                    .limit(0);
                
                if (basicError && basicError.message.includes('does not exist')) {
                    console.log('Tabla users confirmada como inexistente. Necesitas crear la tabla en Supabase Dashboard.');
                    console.log('\nSQL para crear la tabla:');
                    console.log(createUsersTableSQL);
                }
            } catch (altError) {
                console.log('Error alternativo:', altError.message);
            }
        } else {
            console.log('✅ Tabla users creada exitosamente');
        }

        // Si ya existen usuarios auth, crear registros en users
        if (authUsers && authUsers.users.length > 0) {
            console.log('\n5. SINCRONIZANDO USUARIOS AUTH CON TABLA USERS:');
            
            for (const authUser of authUsers.users) {
                const { error: insertError } = await supabaseAdmin
                    .from('users')
                    .upsert({
                        id: authUser.id,
                        email: authUser.email,
                        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
                        created_at: authUser.created_at
                    });

                if (insertError) {
                    console.log(`❌ Error sincronizando ${authUser.email}:`, insertError.message);
                } else {
                    console.log(`✅ Usuario sincronizado: ${authUser.email}`);
                }
            }
        }

    } catch (error) {
        console.log('❌ Error general:', error.message);
        console.log('Stack:', error.stack);
    }
}

checkAndCreateUsersTable();
