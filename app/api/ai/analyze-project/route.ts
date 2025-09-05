import { NextRequest, NextResponse } from 'next/server';
import { analyzeProject, ProjectAnalysisRequest } from '@/lib/openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { projectName, description, currentStatus, deadlineDate, tasksCompleted, totalTasks } = body;

    if (!projectName || !description || !currentStatus || !deadlineDate) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' }, 
        { status: 400 }
      );
    }

    const analysisRequest: ProjectAnalysisRequest = {
      projectName,
      description,
      currentStatus,
      deadlineDate,
      tasksCompleted,
      totalTasks
    };

    // Analizar proyecto con IA
    const analysis = await analyzeProject(analysisRequest);

    // Registrar uso
    await supabase.from('ai_usage').insert({
      user_id: user.id,
      type: 'project_analysis',
      input_tokens: JSON.stringify(analysisRequest).length,
      success: true,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      analysis,
      usage: 'project_analysis'
    });

  } catch (error) {
    console.error('Error analyzing project:', error);
    
    // Registrar error
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('ai_usage').insert({
          user_id: user.id,
          type: 'project_analysis',
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          created_at: new Date().toISOString()
        });
      }
    } catch (logError) {
      console.error('Error logging failure:', logError);
    }

    return NextResponse.json(
      { error: 'Error al analizar proyecto con IA' }, 
      { status: 500 }
    );
  }
}
