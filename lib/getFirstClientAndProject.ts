import { createSupabaseClient } from '@/src/lib/supabase';

export async function getFirstClientForUser(user_id: string) {
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      console.error('❌ Cliente Supabase no disponible');
      return null;
    }

    console.log('🔍 Buscando clientes para usuario:', user_id);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user_id)
      .limit(1);
    
    if (error) {
      console.error('❌ Error buscando clientes:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No se encontraron clientes para el usuario');
      return null;
    }
    
    console.log('✅ Cliente encontrado:', data[0].name);
    return data[0];
  } catch (error) {
    console.error('❌ Error en getFirstClientForUser:', error);
    return null;
  }
}

export async function getFirstProjectForUser(user_id: string) {
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      console.error('❌ Cliente Supabase no disponible');
      return null;
    }

    console.log('🔍 Buscando proyectos para usuario:', user_id);

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user_id)
      .limit(1);
    
    if (error) {
      console.error('❌ Error buscando proyectos:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No se encontraron proyectos para el usuario');
      return null;
    }
    
    console.log('✅ Proyecto encontrado:', data[0].name);
    return data[0];
  } catch (error) {
    console.error('❌ Error en getFirstProjectForUser:', error);
    return null;
  }
}

export async function getFirstInvoiceForUser(user_id: string) {
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      console.error('❌ Cliente Supabase no disponible');
      return null;
    }

    console.log('🔍 Buscando facturas para usuario:', user_id);

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user_id)
      .limit(1);
    
    if (error) {
      console.error('❌ Error buscando facturas:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No se encontraron facturas para el usuario');
      return null;
    }
    
    console.log('✅ Factura encontrada:', data[0].invoice_number);
    return data[0];
  } catch (error) {
    console.error('❌ Error en getFirstInvoiceForUser:', error);
    return null;
  }
}

// Función para verificar si el usuario tiene datos
export async function checkUserEntities(user_id: string) {
  const [client, project, invoice] = await Promise.all([
    getFirstClientForUser(user_id),
    getFirstProjectForUser(user_id),
    getFirstInvoiceForUser(user_id)
  ]);

  console.log('📊 Resumen de entidades del usuario:');
  console.log('- Clientes:', client ? '✅' : '❌');
  console.log('- Proyectos:', project ? '✅' : '❌');
  console.log('- Facturas:', invoice ? '✅' : '❌');

  return {
    client,
    project,
    invoice,
    hasEntities: !!(client || project || invoice)
  };
}
