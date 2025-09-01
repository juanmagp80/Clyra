import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    console.log('🔍 [VALIDATE] Starting token validation...');
    
    try {
        console.log('📥 [VALIDATE] Reading environment variables...');
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        console.log('📥 [VALIDATE] Environment check:', {
            url: !!supabaseUrl,
            key: !!supabaseServiceKey
        });

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('❌ Missing Supabase configuration:');
            console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
            console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
            
            return NextResponse.json(
                { 
                    error: 'Servicio no disponible',
                    details: 'Configuración de Supabase incompleta. Necesitas configurar SUPABASE_SERVICE_ROLE_KEY en tu archivo .env.local' 
                },
                { status: 503 }
            );
        }

        console.log('📥 [VALIDATE] Creating Supabase client...');
        const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

        console.log('📥 [VALIDATE] Parsing request body...');
        const body = await request.json();
        const { token } = body;

        console.log('🔍 [VALIDATE] Token received:', token?.substring(0, 8) + '...');

        if (!token) {
            return NextResponse.json(
                { error: 'Token requerido' },
                { status: 400 }
            );
        }

        // Validar token usando la función SQL
        console.log('🔧 [VALIDATE] Calling validate_client_token RPC...');
        const { data, error } = await supabaseService
            .rpc('validate_client_token', { token_value: token });

        console.log('📋 [VALIDATE] RPC result:', { data, error });

        if (error) {
            console.error('❌ [VALIDATE] Error validating token:', error);
            
            // Si la función no existe, dar instrucciones claras
            if (error.message.includes('function validate_client_token') || 
                error.message.includes('does not exist')) {
                return NextResponse.json(
                    { 
                        error: 'Función de validación no disponible',
                        details: 'Necesitas ejecutar la migración client_communication_migration.sql en tu base de datos de Supabase' 
                    },
                    { status: 503 }
                );
            }
            
            return NextResponse.json(
                { 
                    error: 'Error validando token',
                    details: error.message 
                },
                { status: 500 }
            );
        }

        console.log('📋 [VALIDATE] Token validation result:', data);

        if (!data || data.length === 0) {
            return NextResponse.json(
                { error: 'Token no encontrado o inválido' },
                { status: 404 }
            );
        }

        const clientInfo = data[0];

        console.log('✅ [VALIDATE] Validation successful for client:', clientInfo.client_name);

        return NextResponse.json({
            success: true,
            client: {
                id: clientInfo.client_id,
                name: clientInfo.client_name,
                company: clientInfo.client_company,
                is_valid: clientInfo.is_valid
            }
        });
        
    } catch (error: any) {
        console.error('❌ [VALIDATE] Unexpected error in token validation:', error);
        console.error('❌ [VALIDATE] Error stack:', error.stack);
        return NextResponse.json(
            { 
                error: 'Error interno del servidor',
                details: error.message,
                debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
