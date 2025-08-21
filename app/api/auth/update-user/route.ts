export const runtime = 'nodejs';

import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        console.log('🔄 Iniciando actualización de usuario');
        const supabase = await createServerSupabaseClient();
        
        const body = await request.json();
        console.log('📦 Datos recibidos:', {
            ...body,
            password: body.password ? '[REDACTED]' : undefined
        });

        const { email, newEmail, password } = body;

        // Verificar la sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            console.error('Error de sesión:', sessionError);
            return NextResponse.json(
                { error: 'No se encontró una sesión activa' },
                { status: 401 }
            );
        }

        // Verificar que el email coincida con el usuario actual
        if (email !== session.user.email) {
            console.error('Email no coincide:', { 
                requestEmail: email, 
                sessionEmail: session.user.email 
            });
            return NextResponse.json(
                { error: 'Email no autorizado' },
                { status: 403 }
            );
        }

        try {
            let updateData: any = {};

            // Preparar datos para actualización
            if (newEmail && newEmail !== email) {
                updateData.email = newEmail;
            }
            if (password) {
                updateData.password = password;
            }

            // Si no hay datos para actualizar, retornar error
            if (Object.keys(updateData).length === 0) {
                return NextResponse.json(
                    { error: 'No se proporcionaron datos para actualizar' },
                    { status: 400 }
                );
            }

            // Realizar la actualización
            const { error: updateError } = await supabase.auth.updateUser(updateData);

            if (updateError) {
                console.error('Error al actualizar:', updateError);
                return NextResponse.json(
                    { error: updateError.message },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { 
                    message: 'Usuario actualizado correctamente',
                    updated: Object.keys(updateData)
                },
                { status: 200 }
            );

        } catch (error: any) {
            console.error('Error inesperado:', error);
            return NextResponse.json(
                { error: 'Error interno del servidor: ' + error.message },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('Error al actualizar usuario:', error);
        return NextResponse.json(
            { error: 'Error al procesar la solicitud: ' + error.message },
            { status: 500 }
        );
    }
}
