
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
export const runtime = 'nodejs';

// Variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente básico de Supabase (solo para operaciones simples sin auth)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente de Supabase para componentes de cliente (navegador)
export const createSupabaseClient = () => {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
