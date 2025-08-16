import { createSupabaseClient } from '@/src/lib/supabase-client';
import { predefinedAutomations } from './predefinedAutomations';

export async function ensurePredefinedAutomationsForUser(user_id: string) {
  const supabase = createSupabaseClient();
  
  if (!supabase) {
    console.warn('Supabase no configurado, no se pueden insertar automatizaciones predefinidas');
    return;
  }
  
  console.log('🔄 INICIANDO verificación de automatizaciones predefinidas para usuario:', user_id);
  
  // Obtener los trigger_types de las automatizaciones predefinidas
  const predefinedTriggerTypes = predefinedAutomations.map(a => a.trigger_type);
  console.log('📋 Total de automatizaciones predefinidas disponibles:', predefinedTriggerTypes.length);
  console.log('🏷️ Tipos de trigger:', predefinedTriggerTypes.slice(0, 5), '... y más');
  
  // Verifica cuáles automaciones predefinidas ya existen para el usuario
  const { data: existing, error } = await supabase
    .from('automations')
    .select('trigger_type, name, is_public')
    .eq('user_id', user_id)
    .in('trigger_type', predefinedTriggerTypes);

  if (error) {
    console.error('❌ Error checking existing automations:', error);
    return;
  }
  
  console.log('📊 Automatizaciones existentes del usuario:', existing?.length || 0);
  if (existing && existing.length > 0) {
    console.log('📋 Existentes:');
    existing.forEach((a: any) => console.log(`  - ${a.name} (${a.trigger_type}) - Público: ${a.is_public}`));
  }

  // Determinar qué automatizaciones necesitan ser insertadas (TODAS las que falten)
  const existingTriggerTypes = existing?.map((a: any) => a.trigger_type) || [];
  const automationsToInsert = predefinedAutomations
    .filter(a => !existingTriggerTypes.includes(a.trigger_type))
    .map(a => ({
      ...a,
      user_id,
      is_active: true,
      is_public: true, // Marcar como públicas/predefinidas
      execution_count: 0,
      success_rate: 1, // Añadir de nuevo - se creará la columna automáticamente
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      trigger_conditions: JSON.stringify([]),
      actions: JSON.stringify([]),
    }));

  console.log('➕ Automatizaciones que faltan y serán insertadas:', automationsToInsert.length);
  if (automationsToInsert.length > 0) {
    console.log('📝 Lista de nuevas automatizaciones:');
    automationsToInsert.forEach(a => console.log(`  + ${a.name} (${a.trigger_type})`));
  }

  // SIEMPRE insertar las automatizaciones que falten (sin importar si es usuario nuevo o existente)
  if (automationsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('automations')
      .insert(automationsToInsert);
    
    if (insertError) {
      console.error('❌ Error insertando automatizaciones predefinidas:', insertError);
      console.error('📝 Detalles del error:', JSON.stringify(insertError, null, 2));
    } else {
      console.log(`✅ ÉXITO: Insertadas ${automationsToInsert.length} automatizaciones predefinidas para el usuario ${user_id}`);
      console.log('🎉 El usuario ahora puede ver todas las automatizaciones predefinidas');
    }
  } else {
    console.log('ℹ️ Todas las automatizaciones predefinidas ya existen para este usuario');
    console.log(`📊 Total de automatizaciones del usuario: ${(existing?.length || 0)} de ${predefinedAutomations.length} disponibles`);
  }
  
  console.log('✅ FINALIZANDO verificación de automatizaciones predefinidas');
}

// Función para forzar la actualización de TODAS las automatizaciones predefinidas
export async function forceUpdatePredefinedAutomations(user_id: string) {
  const supabase = createSupabaseClient();
  
  if (!supabase) {
    console.warn('Supabase no configurado');
    return;
  }
  
  console.log('🔄 FORZANDO actualización de automatizaciones para:', user_id);
  
  // Eliminar todas las automatizaciones públicas/predefinidas del usuario
  const { error: deleteError } = await supabase
    .from('automations')
    .delete()
    .eq('user_id', user_id)
    .eq('is_public', true);
  
  if (deleteError) {
    console.error('Error eliminando automatizaciones predefinidas:', deleteError);
    return;
  }
  
  console.log('🗑️ Automatizaciones predefinidas eliminadas');
  
  // Insertar TODAS las automatizaciones predefinidas
  const automationsToInsert = predefinedAutomations.map(a => ({
    ...a,
    user_id,
    is_active: true,
    is_public: true,
    execution_count: 0,
    success_rate: 1, // Añadir de nuevo
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    trigger_conditions: JSON.stringify([]),
    actions: JSON.stringify([]),
  }));
  
  const { error: insertError } = await supabase
    .from('automations')
    .insert(automationsToInsert);
  
  if (insertError) {
    console.error('Error insertando automatizaciones:', insertError);
  } else {
    console.log(`✅ Insertadas ${automationsToInsert.length} automatizaciones predefinidas actualizadas`);
  }
}
