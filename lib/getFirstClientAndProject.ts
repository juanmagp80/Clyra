import { createSupabaseClient } from '@/src/lib/supabase-client';

export async function getFirstClientForUser(user_id: string) {
  const supabase = createSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user_id)
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function getFirstProjectForUser(user_id: string) {
  const supabase = createSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user_id)
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return data[0];
}
