// src/lib/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr';

// Nota: Estas variables se acceden directamente en el navegador.
// Asegúrate de que estén prefijadas con NEXT_PUBLIC_ en tu archivo .env.local
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

// Cliente de Supabase para componentes de cliente (navegador)
export const createSupabaseClient = () => {
    if (!isSupabaseConfigured()) {
        console.warn('⚠️ Supabase no está configurado. La funcionalidad estará limitada.');
        // Devolvemos un objeto mock para evitar errores de 'null'
        return {
            from: () => ({
                select: async () => ({ data: [], error: { message: 'Supabase not configured' } }),
                insert: async () => ({ data: [], error: { message: 'Supabase not configured' } }),
                update: async () => ({ data: [], error: { message: 'Supabase not configured' } }),
                delete: async () => ({ data: [], error: { message: 'Supabase not configured' } }),
            }),
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
                signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
                signOut: async () => ({ error: null }),
            },
        } as any; // Usamos 'as any' para el mock
    }
    return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
};

// Exportamos una instancia singleton para uso general si es necesario,
// pero se prefiere usar createSupabaseClient() en componentes.
export const supabase = createSupabaseClient();
