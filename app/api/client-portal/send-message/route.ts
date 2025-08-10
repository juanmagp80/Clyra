import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar que las variables de entorno estén disponibles
if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL no está configurada');
}

if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY no está configurada');
}

const supabaseService = supabaseUrl && supabaseServiceKey ? 
    createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(request: NextRequest) {
    try {
        // Verificar que supabaseService esté disponible
        if (!supabaseService) {
            console.error('Supabase service no disponible - verificar variables de entorno');
            return NextResponse.json(
                { error: 'Servicio no disponible' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { token, message, project_id, attachments = [] } = body;

        if (!token || !message?.trim()) {
            return NextResponse.json(
                { error: 'Token y mensaje son requeridos' },
                { status: 400 }
            );
        }

        // Usar la función SQL para enviar el mensaje
        const { data: messageId, error } = await supabaseService
            .rpc('send_client_message', {
                token_value: token,
                message_text: message.trim(),
                project_uuid: project_id || null,
                attachments_json: attachments
            });

        if (error) {
            console.error('Error sending message:', error);
            
            if (error.message.includes('Token inválido')) {
                return NextResponse.json(
                    { error: 'Token inválido o expirado' },
                    { status: 401 }
                );
            }
            
            return NextResponse.json(
                { error: 'Error enviando mensaje' },
                { status: 500 }
            );
        }

        // TODO: Aquí se puede añadir lógica para notificar al freelancer
        // Por ejemplo, enviar email o push notification

        return NextResponse.json({
            success: true,
            message_id: messageId
        });

    } catch (error) {
        console.error('Error in send-message API:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
