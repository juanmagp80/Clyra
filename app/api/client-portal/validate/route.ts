import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar configuración
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration:');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
}

// Cliente con permisos de service role para bypassing RLS cuando sea necesario
const supabaseService = supabaseUrl && supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export async function POST(request: NextRequest) {
    try {
        // Verificar configuración de Supabase
        if (!supabaseService) {
            console.error('❌ Supabase not configured for client portal');
            return NextResponse.json(
                { 
                    error: 'Servicio no disponible',
                    details: 'Configuración de Supabase incompleta. Necesitas configurar SUPABASE_SERVICE_ROLE_KEY en tu archivo .env.local' 
                },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { token } = body;

        console.log('🔍 Validating token:', token?.substring(0, 8) + '...');

        if (!token) {
            return NextResponse.json(
                { error: 'Token requerido' },
                { status: 400 }
            );
        }

        // Validar token usando la función SQL
        console.log('🔧 Calling validate_client_token RPC...');
        const { data, error } = await supabaseService
            .rpc('validate_client_token', { token_value: token });

        if (error) {
            console.error('❌ Error validating token:', error);
            
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

        console.log('📋 Token validation result:', data);

        if (!data || data.length === 0) {
            return NextResponse.json(
                { error: 'Token no encontrado o inválido' },
                { status: 404 }
            );
        }

        const clientInfo = data[0];

        // Obtener información del freelancer desde auth.users
        console.log('🔍 Getting freelancer info for client_id:', clientInfo.client_id);
        
        // Primero obtener el user_id del cliente
        const { data: clientData, error: clientError } = await supabaseService
            .from('clients')
            .select('user_id')
            .eq('id', clientInfo.client_id)
            .single();

        console.log('📋 Client data result:', { clientData, clientError });

        let freelancerInfo = {
            name: 'Freelancer',
            company: '',
            email: ''
        };

        if (clientData && !clientError) {
            // Ahora obtener la información del usuario/freelancer
            const { data: userData, error: userError } = await supabaseService
                .from('auth.users')
                .select('email, raw_user_meta_data')
                .eq('id', clientData.user_id)
                .single();

            console.log('👤 User data result:', { userData, userError });

            if (userData && !userError) {
                freelancerInfo = {
                    name: userData.raw_user_meta_data?.full_name || 
                          userData.raw_user_meta_data?.name || 
                          userData.email?.split('@')[0] || 
                          'Freelancer',
                    company: userData.raw_user_meta_data?.company_name || 
                            userData.raw_user_meta_data?.business_name || 
                            '',
                    email: userData.email || ''
                };
                console.log('✅ Final freelancer info:', freelancerInfo);
            } else {
                console.log('❌ Failed to get user info:', userError);
                
                // Fallback: usar datos básicos del email
                try {
                    const { data: basicUserData, error: basicError } = await supabaseService.auth.admin.getUserById(clientData.user_id);
                    console.log('🔄 Fallback user data:', { basicUserData, basicError });
                    
                    if (basicUserData.user && !basicError) {
                        freelancerInfo = {
                            name: basicUserData.user.email?.split('@')[0] || 'Freelancer',
                            company: '',
                            email: basicUserData.user.email || ''
                        };
                    }
                } catch (fallbackError) {
                    console.log('❌ Fallback also failed:', fallbackError);
                }
            }
        } else {
            console.log('❌ Failed to get client data:', clientError);
        }

        return NextResponse.json({
            success: true,
            client: {
                id: clientInfo.client_id,
                name: clientInfo.client_name,
                company: clientInfo.client_company,
                is_valid: clientInfo.is_valid
            },
            freelancer: freelancerInfo
        });
    } catch (error: any) {
        console.error('❌ Unexpected error in token validation:', error);
        return NextResponse.json(
            { 
                error: 'Error interno del servidor',
                details: error.message 
            },
            { status: 500 }
        );
    }
}
