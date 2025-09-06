import { detectRecentEvents, getEventDataAutomatically } from '@/lib/event-detectors';
import { generateSmartEmail } from '@/lib/openai';
import emailService from '@/src/lib/email-service';
import { createSupabaseAdmin } from '@/src/lib/supabase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, hours = 24, sendEmails = true } = body;

        console.log('🤖 Processing auto-email system:', { userId, hours, sendEmails });

        const supabase = createSupabaseAdmin();

        let actualUserId = null;

        // Determinar si userId es UUID o email
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

        if (isUUID) {
            actualUserId = userId;
            console.log('✅ Using UUID directly:', actualUserId);
        } else {
            // userId es un email, obtener el ID usando función SQL si existe
            try {
                const { data: userIdFromEmail, error: userError } = await supabase
                    .rpc('get_user_id_by_email', { user_email: userId });

                if (userError || !userIdFromEmail) {
                    // Si la función SQL no existe, buscar en auth.users
                    console.log('⚠️ Función SQL no encontrada, buscando en auth.users...');
                    const { data: userData, error: authError } = await supabase.auth.admin.listUsers();

                    if (authError) {
                        throw new Error('No se pudo obtener usuarios de auth');
                    }

                    const foundUser = userData.users.find(u => u.email === userId);
                    if (!foundUser) {
                        throw new Error('Usuario no encontrado por email');
                    }

                    actualUserId = foundUser.id;
                } else {
                    actualUserId = userIdFromEmail;
                }
            } catch (error) {
                return NextResponse.json({
                    error: `Usuario no encontrado por email: ${error instanceof Error ? error.message : 'Error desconocido'}`
                }, { status: 404 });
            }
        }

        // Obtener información del usuario para envío de emails
        let userData = null;

        // Intentar obtener de profiles primero
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email, full_name, company_name')
            .eq('id', actualUserId)
            .single();

        if (profileData) {
            userData = profileData;
            console.log('✅ Usuario encontrado en profiles:', userData.email);
        } else {
            // Si no existe en profiles, obtener de auth.users
            console.log('⚠️ Usuario no encontrado en profiles, buscando en auth...');
            const { data: authUserData, error: authUserError } = await supabase.auth.admin.getUserById(actualUserId);

            if (authUserError || !authUserData.user) {
                return NextResponse.json({
                    error: 'No se pudo obtener información del usuario'
                }, { status: 404 });
            }

            userData = {
                email: authUserData.user.email,
                full_name: authUserData.user.user_metadata?.full_name || authUserData.user.user_metadata?.name || 'Usuario',
                company_name: authUserData.user.user_metadata?.company_name || null
            };
            console.log('✅ Usuario encontrado en auth:', userData.email);
        }

        // Detectar eventos recientes
        const recentEvents = await detectRecentEvents(actualUserId, hours);
        console.log(`🔍 Found ${recentEvents.length} recent events`);

        const results = [];
        let emailsSent = 0;

        for (const event of recentEvents) {
            try {
                // ⚡ DEDUPLICACIÓN: Verificar si ya se envió un email para este cliente recientemente
                const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
                const { data: recentEmails } = await supabase
                    .from('ai_insights')
                    .select('*')
                    .eq('user_id', actualUserId)
                    .eq('insight_type', 'smart_email_auto')
                    .gte('created_at', twoHoursAgo)
                    .contains('data_points', { event: { entityId: event.entityId } });

                if (recentEmails && recentEmails.length > 0) {
                    console.log(`⏭️ Saltando evento ${event.type} para entidad ${event.entityId} - Email ya enviado recientemente`);
                    continue;
                }

                // Obtener datos automáticamente
                const eventData = await getEventDataAutomatically(event.type, event.entityId, actualUserId);

                // Generar email inteligente automáticamente
                let email;
                if (eventData.trigger === 'client_onboarding') {
                    // Obtener datos reales del usuario y empresa
                    const { data: userProfile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', actualUserId)
                        .single();
                        
                    const { data: companySettings } = await supabase
                        .from('company_settings')
                        .select('*')
                        .eq('user_id', actualUserId)
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

                // Determinar email del destinatario según el tipo de evento
                let recipientEmail = null;
                let recipientName = null;

                if (eventData.context.client?.email) {
                    recipientEmail = eventData.context.client.email;
                    recipientName = eventData.context.client.name || 'Cliente';
                } else {
                    console.log('⚠️ No se encontró email del cliente para el evento:', event.type);
                    continue;
                }

                // Enviar email si está habilitado
                let emailResult = null;
                if (sendEmails && recipientEmail) {
                    try {
                        emailResult = await emailService.sendEmail({
                            to: recipientEmail,
                            subject: email.subject,
                            html: email.body,
                            from: `${userData.full_name || userData.company_name || 'Taskelio'} <noreply@taskelio.app>`,
                            userId: actualUserId
                        });

                        if (emailResult.success) {
                            emailsSent++;
                            console.log(`✅ Email enviado a ${recipientEmail}: ${email.subject}`);
                        } else {
                            console.error(`❌ Error enviando email a ${recipientEmail}:`, emailResult.error);
                        }
                    } catch (emailError) {
                        console.error('❌ Error crítico enviando email:', emailError);
                    }
                }

                // Guardar en base de datos
                const { data: savedEmail, error } = await supabase
                    .from('ai_insights')
                    .insert({
                        user_id: actualUserId,
                        insight_type: 'smart_email_auto',
                        category: 'workflow',
                        title: `Email Automático - ${event.description}`,
                        description: `${email.subject}`,
                        data_points: {
                            event: event,
                            email: email,
                            context: eventData.context,
                            emailSent: emailResult?.success || false,
                            recipient: recipientEmail,
                            emailResult: emailResult
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
                        recipient: recipientEmail,
                        emailSent: emailResult?.success || false,
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
            emailsSent: emailsSent,
            events: results,
            userInfo: {
                userId: actualUserId,
                email: userData.email,
                name: userData.full_name
            }
        });

    } catch (error: any) {
        console.error('Error processing auto-email system:', error);
        return NextResponse.json({
            error: error?.message || 'Error procesando sistema de emails automáticos',
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

        // Llamar al POST sin enviar emails (solo detección)
        const response = await POST(new NextRequest(request.url, {
            method: 'POST',
            body: JSON.stringify({
                userId: userInput,
                hours: hours,
                sendEmails: false
            }),
            headers: { 'Content-Type': 'application/json' }
        }));

        return response;

    } catch (error: any) {
        console.error('Error in GET auto-email system:', error);
        return NextResponse.json({
            error: error?.message || 'Error consultando sistema de emails automáticos'
        }, { status: 500 });
    }
}
