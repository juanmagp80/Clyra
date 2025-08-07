import { createBrowserClient } from '@supabase/ssr';

// Variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente singleton para componentes de cliente
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export const createSupabaseClient = () => {
    if (!supabaseInstance) {
        supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseInstance;
};

// Para compatibilidad hacia atrás
export const supabase = createSupabaseClient();
