import { detectRecentEvents, getEventDataAutomatically } from '@/lib/event-detectors';
import { generateSmartEmail } from '@/lib/openai';
import { createSupabaseAdmin } from '@/src/lib/supabase-admin';
import { NextRequest, NextResponse } from 'next/server';

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

        const results = [];

        if (autoDetect) {
            // Modo detección automática: buscar eventos recientes
            console.log('🔍 Auto-detecting recent events...');

            const recentEvents = await detectRecentEvents(userId, 24); // Últimas 24 horas

            for (const event of recentEvents) {
                try {
                    // ⚡ DEDUPLICACIÓN: Verificar si ya se envió un email para este cliente recientemente
                    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
                    const { data: recentEmails } = await supabase
                        .from('ai_insights')
                        .select('*')
                        .eq('user_id', userId)
                        .eq('insight_type', 'smart_email_auto')
                        .gte('created_at', twoHoursAgo)
                        .contains('data_points', { event: { entityId: event.entityId } });

                    if (recentEmails && recentEmails.length > 0) {
                        console.log(`⏭️ Saltando evento ${event.type} para entidad ${event.entityId} - Email ya enviado recientemente`);
                        continue;
                    }

                    // Obtener datos automáticamente
                    const eventData = await getEventDataAutomatically(event.type, event.entityId, userId);

                    // Generar email inteligente automáticamente
                    let email;
                    if (eventData.trigger === 'client_onboarding') {
                        // Obtener datos reales del usuario y empresa
                        const { data: userProfile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', userId)
                            .single();
                            
                        const { data: companySettings } = await supabase
                            .from('company_settings')
                            .select('*')
                            .eq('user_id', userId)
                            .single();
                            
                        const companyName = companySettings?.company_name || 'Nuestra Empresa';
                        const contactEmail = userProfile?.email || 'contacto@empresa.com';
                        const contactPhone = companySettings?.phone || '+34 900 000 000';
                        const userFullName = userProfile?.full_name || userProfile?.email?.split('@')[0] || 'Equipo';
                        
                        // Limpiar nombre del cliente si contiene "prueba"
                        let clientName = eventData.context.client?.name || 'Cliente';
                        if (clientName.toLowerCase().includes('prueba')) {
                            clientName = 'Cliente';
                        }
                        
                        // Usar plantilla profesional con datos reales
                        email = {
                            subject: `¡Bienvenido/a a ${companyName}!`,
                            body: `
<p>Estimado/a ${clientName},</p>
<p>Nos complace darle la bienvenida a ${companyName}. Estamos emocionados de comenzar esta colaboración y de ayudarle a alcanzar sus objetivos.</p>
<p>Para asegurarnos de que su incorporación sea lo más fluida posible, hemos preparado algunos pasos iniciales:</p>
<ol>
  <li><strong>Programar una llamada de bienvenida:</strong> Nos gustaría conocer más sobre sus necesidades y responder cualquier pregunta que pueda tener.</li>
  <li><strong>Revisar nuestra documentación:</strong> Le recomendamos que consulte nuestra documentación en línea para que pueda comprender mejor nuestros servicios y procesos.</li>
</ol>
<p>Si tiene alguna pregunta o necesita asistencia adicional, no dude en contactarse conmigo directamente a ${contactEmail} o al teléfono <b>${contactPhone}</b>.</p>
<p>¡Esperamos colaborar con usted!</p>
<p>Saludos cordiales,<br>${userFullName}<br>Director de Proyectos<br>${companyName}</p>
`,
                            tone: 'professional',
                            next_steps: ['Programar llamada de bienvenida', 'Revisar documentación'],
                            schedule_followup: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        };
                    } else {
                        email = await generateSmartEmail(eventData.trigger, eventData.context);
                    }

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
            let email;
            if (eventData.trigger === 'client_onboarding') {
                // Usar plantilla profesional fija para onboarding
                email = {
                    subject: '¡Bienvenido/a a Clyra Solutions!',
                    body: `
<p>Estimado/a ${eventData.context.client?.name || 'Cliente'},</p>
<p>Nos complace darle la bienvenida a Clyra Solutions. Estamos emocionados de comenzar esta colaboración y de ayudarle a alcanzar sus objetivos.</p>
<p>Para asegurarnos de que su incorporación sea lo más fluida posible, hemos preparado algunos pasos iniciales:</p>
<ol>
  <li><strong>Programar una llamada de bienvenida:</strong> Nos gustaría conocer más sobre sus necesidades y responder cualquier pregunta que pueda tener.</li>
  <li><strong>Revisar nuestra documentación:</strong> Le recomendamos que consulte nuestra documentación en línea para que pueda comprender mejor nuestros servicios y procesos.</li>
</ol>
<p>Si tiene alguna pregunta o necesita asistencia adicional, no dude en contactarse conmigo directamente a juanmagpdev@gmail.com o al teléfono <b>+34 123 456 789</b>.</p>
<p>¡Esperamos colaborar con usted!</p>
<p>Saludos cordiales,<br>Juan<br>Director de Proyectos<br>Clyra Solutions</p>
`,
                    tone: 'professional',
                    next_steps: ['Programar llamada de bienvenida', 'Revisar documentación'],
                    schedule_followup: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                };
            } else {
                email = await generateSmartEmail(eventData.trigger, eventData.context);
            }

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
