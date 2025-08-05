
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
export const runtime = 'nodejs';

// Variables de entorno con validación
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Función para verificar si Supabase está configurado
export const isSupabaseConfigured = () => {
    return !!(supabaseUrl && 
              supabaseAnonKey && 
              supabaseUrl !== 'your_supabase_project_url_here' && 
              supabaseAnonKey !== 'your_supabase_anon_key_here' &&
              supabaseUrl.startsWith('https://'));
};

// Cliente básico de Supabase (solo si está configurado)
export const supabase = isSupabaseConfigured() 
    ? createClient(supabaseUrl!, supabaseAnonKey!)
    : null;

// Cliente de Supabase para componentes de cliente (navegador)
export const createSupabaseClient = () => {
    if (!isSupabaseConfigured()) {
        console.warn('⚠️ Supabase no está configurado. Los botones de autenticación no funcionarán.');
        return null;
    }
    return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
};
