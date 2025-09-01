import { createSupabaseClient } from '@/src/lib/supabase-client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, title, message, type = 'info', route, actionData } = body;

        if (!userId || !title || !message) {
            return NextResponse.json(
                { error: 'userId, title y message son requeridos' },
                { status: 400 }
            );
        }

        const supabase = createSupabaseClient();
        if (!supabase) {
            return NextResponse.json(
                { error: 'Error de configuración de Supabase' },
                { status: 500 }
            );
        }

        const { data, error } = await supabase
            .from('user_notifications')
            .insert({
                user_id: userId,
                title,
                message,
                type,
                route,
                action_data: actionData,
                is_read: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error creando notificación:', error);
            return NextResponse.json(
                { error: 'Error creando notificación' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            notification: data
        });

    } catch (error) {
        console.error('Error en API de notificaciones:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        if (!userId) {
            return NextResponse.json(
                { error: 'userId es requerido' },
                { status: 400 }
            );
        }

        const supabase = createSupabaseClient();
        if (!supabase) {
            return NextResponse.json(
                { error: 'Error de configuración de Supabase' },
                { status: 500 }
            );
        }

        let query = supabase
            .from('user_notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (unreadOnly) {
            query = query.eq('is_read', false);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error obteniendo notificaciones:', error);
            return NextResponse.json(
                { error: 'Error obteniendo notificaciones' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            notifications: data,
            unreadCount: data?.filter((n: any) => !n.is_read).length || 0
        });

    } catch (error) {
        console.error('Error en API de notificaciones:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
