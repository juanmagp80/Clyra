import { NextRequest, NextResponse } from 'next/server';
import { generateEmail, EmailGenerationRequest } from '@/lib/openai';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { type, clientName, projectName, context, dueDate, invoiceAmount, tone } = body;

    if (!type || !clientName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: type y clientName' }, 
        { status: 400 }
      );
    }

    const emailRequest: EmailGenerationRequest = {
      type,
      clientName,
      projectName,
      context,
      dueDate,
      invoiceAmount,
      tone: tone || 'professional'
    };

    // Generar email con IA
    const generatedEmail = await generateEmail(emailRequest);

    // Registrar uso en la nueva tabla ai_usage
    const { error: usageError } = await supabase
      .from('ai_usage')
      .insert({
        user_id: user.id,
        automation_type: 'email_generation',
        prompt_tokens: 150, // Estimación para emails
        completion_tokens: 100, // Estimación para emails
        total_tokens: 250,
        cost_usd: 0.001, // Costo aproximado con gpt-4o-mini
        model: 'gpt-4o-mini',
        success: true,
        metadata: {
          email_type: type,
          client_name: clientName,
          project_name: projectName,
          tone: tone
        }
      });

    if (usageError) {
      console.error('Error registrando uso de IA:', usageError);
    }

    return NextResponse.json({
      success: true,
      email: generatedEmail,
      usage: 'email_generation'
    });

  } catch (error) {
    console.error('Error generating email:', error);
    
    // Registrar error en la base de datos
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('ai_usage')
        .insert({
          user_id: user.id,
          automation_type: 'email_generation',
          success: false,
          error_message: error instanceof Error ? error.message : 'Error desconocido',
          cost_usd: 0
        });
    }

    return NextResponse.json({
      success: false,
      error: 'Error al generar email'
    }, { status: 500 });
  }
}
