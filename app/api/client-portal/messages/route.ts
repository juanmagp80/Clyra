import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: 'Token requerido' },
                { status: 400 }
            );
        }

        // Primero validar el token
        const { data: tokenData, error: tokenError } = await supabaseService
            .rpc('validate_client_token', { token_value: token });

        if (tokenError || !tokenData || tokenData.length === 0 || !tokenData[0].is_valid) {
            return NextResponse.json(
                { error: 'Token inválido' },
                { status: 401 }
            );
        }

        const clientId = tokenData[0].client_id;

        // Obtener mensajes del cliente
        const { data: messages, error: messagesError } = await supabaseService
            .from('client_messages')
            .select(`
                id,
                message,
                sender_type,
                attachments,
                is_read,
                created_at,
                project_id,
                projects(name)
            `)
            .eq('client_id', clientId)
            .order('created_at', { ascending: true });

        if (messagesError) {
            console.error('Error loading messages:', messagesError);
            return NextResponse.json(
                { error: 'Error cargando mensajes' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            messages: messages || []
        });

    } catch (error) {
        console.error('Error in messages API:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
