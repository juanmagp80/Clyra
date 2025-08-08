import { createSupabaseClient } from '@/src/lib/supabase-client';
import { predefinedAutomations } from './predefinedAutomations';

export async function ensurePredefinedAutomationsForUser(user_id: string) {
  const supabase = createSupabaseClient();
  // Verifica si ya existen automaciones predefinidas para el usuario
  const { data: existing, error } = await supabase
    .from('automations')
    .select('id')
    .eq('user_id', user_id);

  if (error) return;
  if (existing && existing.length > 0) return; // Ya existen

  // Inserta las predefinidas para el usuario
  const automationsToInsert = predefinedAutomations.map(a => ({
    ...a,
    user_id,
    is_active: true,
    execution_count: 0,
    success_rate: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    trigger_conditions: JSON.stringify([]),
    actions: JSON.stringify([]),
  }));
  await supabase.from('automations').insert(automationsToInsert);
}
