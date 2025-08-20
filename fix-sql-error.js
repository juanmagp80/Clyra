console.log('🔧 SQL CORREGIDO PARA SUPABASE');
console.log('===============================');

console.log('\n⚠️  PROBLEMA IDENTIFICADO:');
console.log('La sintaxis "IF NOT EXISTS" no funciona con CREATE POLICY en Supabase');

console.log('\n✅ SOLUCIÓN:');
console.log('Ejecuta estos comandos UNO POR UNO en el SQL Editor de Supabase:');

console.log('\n📋 PASO 1 - Crear tabla:');
console.log(`
CREATE TABLE public.company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    nif TEXT NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    country TEXT DEFAULT 'España',
    phone TEXT,
    email TEXT,
    website TEXT,
    registration_number TEXT,
    social_capital DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);

console.log('\n📋 PASO 2 - Crear índice:');
console.log(`
CREATE UNIQUE INDEX idx_company_settings_user_id ON public.company_settings(user_id);`);

console.log('\n📋 PASO 3 - Habilitar RLS:');
console.log(`
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;`);

console.log('\n📋 PASO 4 - Política SELECT:');
console.log(`
CREATE POLICY "Users can view own company settings" ON public.company_settings
    FOR SELECT USING (auth.uid() = user_id);`);

console.log('\n📋 PASO 5 - Política INSERT:');
console.log(`
CREATE POLICY "Users can insert own company settings" ON public.company_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);`);

console.log('\n📋 PASO 6 - Política UPDATE:');
console.log(`
CREATE POLICY "Users can update own company settings" ON public.company_settings
    FOR UPDATE USING (auth.uid() = user_id);`);

console.log('\n📋 PASO 7 - Verificación:');
console.log(`
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'company_settings' 
ORDER BY ordinal_position;`);

console.log('\n🎯 IMPORTANTE:');
console.log('- Ejecuta cada paso POR SEPARADO');
console.log('- Espera a que cada comando se complete antes del siguiente');
console.log('- Si algún paso da error, contáctame con el mensaje exacto');

console.log('\n✅ RESULTADO ESPERADO:');
console.log('Después de ejecutar todos los pasos, la página de configuración fiscal funcionará correctamente.');

console.log('\n===============================');
