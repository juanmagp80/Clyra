console.log('🔧 CONFIGURACIÓN AUTOMÁTICA DE TABLA company_settings');
console.log('==================================================');

// Este script NO puede ejecutarse directamente porque require acceso a las variables de entorno
// Es solo una referencia de los comandos que necesitas ejecutar en Supabase SQL Editor

console.log('\n📋 INSTRUCCIONES PARA CONFIGURAR LA BASE DE DATOS:');
console.log('');
console.log('1. Ve a tu dashboard de Supabase: https://app.supabase.com');
console.log('2. Selecciona tu proyecto: joyhaxtpmrmndmifsihn.supabase.co');
console.log('3. Ve a "SQL Editor" en el menú lateral');
console.log('4. Crea una nueva consulta');
console.log('5. Copia y pega el siguiente SQL:');
console.log('');

const sql = `-- Crear tabla company_settings
CREATE TABLE IF NOT EXISTS public.company_settings (
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
);

-- Crear índice único
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_settings_user_id ON public.company_settings(user_id);

-- Habilitar RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY IF NOT EXISTS "Users can view own company settings" ON public.company_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own company settings" ON public.company_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own company settings" ON public.company_settings
    FOR UPDATE USING (auth.uid() = user_id);`;

console.log(sql);

console.log('\n');
console.log('6. Haz clic en "Run" para ejecutar el script');
console.log('7. Verifica que no hay errores');
console.log('8. Refresca la aplicación y prueba la página de configuración fiscal');

console.log('\n✅ VERIFICACIÓN:');
console.log('Después de ejecutar el SQL, puedes verificar con esta consulta:');
console.log('');
console.log('SELECT * FROM information_schema.tables WHERE table_name = \'company_settings\';');

console.log('\n🎯 RESULTADO ESPERADO:');
console.log('- La tabla company_settings debe aparecer en tu base de datos');
console.log('- Debe tener todas las columnas: id, user_id, company_name, nif, address, etc.');
console.log('- Las políticas RLS deben estar activas');

console.log('\n🚨 IMPORTANTE:');
console.log('Si ya tienes facturas creadas, también necesitarás ejecutar estos comandos:');

const invoicesSQL = `-- Añadir columnas españolas a la tabla invoices existente
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS series TEXT DEFAULT 'FAC';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS issue_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS service_date DATE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_nif TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_address TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_postal_code TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_city TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_country TEXT DEFAULT 'España';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 21;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS retention_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS retention_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Transferencia bancaria';`;

console.log(invoicesSQL);

console.log('\n==================================================');
console.log('📞 SOPORTE:');
console.log('Si tienes problemas, revisa los mensajes de error en la consola del navegador');
console.log('y verifica que las variables de entorno NEXT_PUBLIC_SUPABASE_URL y');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY estén configuradas correctamente.');
console.log('==================================================');
