const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://joyhaxtpmrmndmifsihn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A'
);

async function checkUserAndCreateClient() {
  console.log('🔍 Buscando usuarios existentes...');
  
  // Obtener un usuario existente de la tabla profiles
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, email, company, phone')
    .limit(1);
    
  if (usersError || !users || users.length === 0) {
    console.error('❌ No se encontraron usuarios:', usersError);
    return;
  }
  
  const user = users[0];
  console.log('👤 Usuario encontrado:', user);
  
  // Crear cliente de prueba con user_id válido
  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      name: 'Cliente Automatización Test ' + Date.now(),
      email: 'appcartama@hotmail.com',
      company: 'Test Company',
      user_id: user.id
    })
    .select()
    .single();
    
  if (error) {
    console.error('❌ Error creando cliente:', error);
    return;
  }
  
  console.log('✅ Cliente creado exitosamente:', client);
  console.log('⏰ El detector automático debería detectar este evento en unos segundos...');
}

checkUserAndCreateClient();
