import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/src/lib/supabase-admin';
import { getEventDataAutomatically, detectRecentEvents } from '@/lib/event-detectors';
import { generateSmartEmail } from '@/lib/openai';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventType, entityId, userId: userInput, autoDetect } = body;

        console.log('🔄 Processing automatic event:', { eventType, entityId, userInput, autoDetect });

        const supabase = createSupabaseAdmin();
        
        let userId = null;
        
        // Determinar si userInput es UUID o email
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userInput);
        
        if (isUUID) {
            // userInput es un UUID, usarlo directamente
            userId = userInput;
            console.log('✅ Using UUID directly:', userId);
        } else {
            // userInput es un email, obtener el ID
            const { data: userIdFromEmail, error: userError } = await supabase
                .rpc('get_user_id_by_email', { user_email: userInput });

            if (userError || !userIdFromEmail) {
                return NextResponse.json({ 
                    error: 'Usuario no encontrado por email' 
                }, { status: 404 });
            }
            
            userId = userIdFromEmail;
            console.log('✅ Found user ID from email:', userId);
        }

        let results = [];

        if (autoDetect) {
            // Modo detección automática: buscar eventos recientes
            console.log('🔍 Auto-detecting recent events...');
            
            const recentEvents = await detectRecentEvents(userId, 24); // Últimas 24 horas
            
            for (const event of recentEvents) {
                try {
                    // Obtener datos automáticamente
                    const eventData = await getEventDataAutomatically(event.type, event.entityId, userId);
                    
                    // Generar email inteligente automáticamente
                    const email = await generateSmartEmail(eventData.trigger, eventData.context);
                    
                    // Guardar en base de datos
                    const { data: savedEmail, error } = await supabase
                        .from('ai_insights')
                        .insert({
                            user_id: userId,
                            insight_type: 'smart_email_auto',
                            category: 'workflow',
                            title: `Email Automático - ${event.description}`,
                            description: `${email.subject}`,
                            data_points: {
                                event: event,
                                email: email,
                                context: eventData.context
                            },
                            confidence_score: 0.95,
                            impact_score: 8,
                            actionability_score: 10,
                            recommendations: email.next_steps || []
                        })
                        .select()
                        .single();

                    if (!error) {
                        results.push({
                            event: event,
                            email: email,
                            saved_insight_id: savedEmail.id
                        });
                    }
                } catch (eventError) {
                    console.error(`Error processing event ${event.type}:`, eventError);
                }
            }

            return NextResponse.json({
                success: true,
                message: `Procesados ${results.length} eventos automáticamente`,
                processedEvents: results.length,
                events: results
            });

        } else {
            // Modo manual: procesar evento específico
            console.log('📧 Processing specific event:', eventType, entityId);
            
            // Obtener datos automáticamente del evento
            const eventData = await getEventDataAutomatically(eventType, entityId, userId);
            
            // Generar email inteligente
            const email = await generateSmartEmail(eventData.trigger, eventData.context);
            
            // Guardar en base de datos
            const { data: savedEmail, error } = await supabase
                .from('ai_insights')
                .insert({
                    user_id: userId,
                    insight_type: 'smart_email_auto',
                    category: 'workflow',
                    title: `Email Automático - ${eventType}`,
                    description: `${email.subject}`,
                    data_points: {
                        eventData: eventData,
                        email: email
                    },
                    confidence_score: 0.95,
                    impact_score: 8,
                    actionability_score: 10,
                    recommendations: email.next_steps || []
                })
                .select()
                .single();

            if (error) throw new Error('Error guardando email automático');

            return NextResponse.json({
                success: true,
                message: 'Email automático generado exitosamente',
                eventData: eventData,
                email: email,
                saved_insight_id: savedEmail.id
            });
        }

    } catch (error: any) {
        console.error('Error processing automatic event:', error);
        return NextResponse.json({
            error: error?.message || 'Error procesando evento automático',
            details: error
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userInput = searchParams.get('userId');
        const hours = parseInt(searchParams.get('hours') || '24');

        if (!userInput) {
            return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
        }

        const supabase = createSupabaseAdmin();
        
        let userId = null;
        
        // Determinar si userInput es UUID o email
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userInput);
        
        if (isUUID) {
            // userInput es un UUID, usarlo directamente
            userId = userInput;
            console.log('✅ GET: Using UUID directly:', userId);
        } else {
            // userInput es un email, obtener el ID
            const { data: userIdFromEmail, error: userError } = await supabase
                .rpc('get_user_id_by_email', { user_email: userInput });

            if (userError || !userIdFromEmail) {
                return NextResponse.json({ error: 'Usuario no encontrado por email' }, { status: 404 });
            }
            
            userId = userIdFromEmail;
            console.log('✅ GET: Found user ID from email:', userId);
        }

        // Detectar eventos recientes
        const recentEvents = await detectRecentEvents(userId, hours);

        return NextResponse.json({
            success: true,
            eventsFound: recentEvents.length,
            events: recentEvents,
            period: `${hours} horas`,
            userId: userId
        });

    } catch (error: any) {
        console.error('Error detecting events:', error);
        return NextResponse.json({
            error: error?.message || 'Error detectando eventos'
        }, { status: 500 });
    }
}
