import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tipos para las automatizaciones
export interface EmailGenerationRequest {
  type: 'follow_up' | 'meeting_reminder' | 'project_update' | 'invoice_reminder' | 'welcome' | 'feedback_request';
  clientName: string;
  projectName?: string;
  context?: string;
  dueDate?: string;
  invoiceAmount?: number;
  tone?: 'professional' | 'friendly' | 'urgent';
}

export interface ProjectAnalysisRequest {
  projectName: string;
  description: string;
  currentStatus: string;
  deadlineDate: string;
  tasksCompleted?: number;
  totalTasks?: number;
}

// Función principal para generar emails
export async function generateEmail(request: EmailGenerationRequest): Promise<string> {
  const prompts = {
    follow_up: `Genera un email de seguimiento profesional para el cliente ${request.clientName}${request.projectName ? ` sobre el proyecto "${request.projectName}"` : ''}. 
    ${request.context ? `Contexto: ${request.context}` : ''}
    Tono: ${request.tone || 'professional'}. 
    Debe ser cordial, específico y motivar una respuesta. Máximo 150 palabras.`,

    meeting_reminder: `Genera un email recordatorio de reunión para ${request.clientName}${request.projectName ? ` sobre "${request.projectName}"` : ''}. 
    ${request.dueDate ? `Fecha: ${request.dueDate}` : ''}
    ${request.context ? `Detalles: ${request.context}` : ''}
    Debe ser amigable, incluir la fecha/hora y pedir confirmación. Máximo 100 palabras.`,

    project_update: `Genera un email de actualización de proyecto para ${request.clientName} sobre "${request.projectName}". 
    ${request.context ? `Estado actual: ${request.context}` : ''}
    Debe incluir progreso, próximos pasos y ser transparente. Tono ${request.tone || 'professional'}. Máximo 200 palabras.`,

    invoice_reminder: `Genera un email recordatorio de factura para ${request.clientName}. 
    ${request.invoiceAmount ? `Importe: €${request.invoiceAmount}` : ''}
    ${request.dueDate ? `Vencimiento: ${request.dueDate}` : ''}
    Debe ser respetuoso pero firme, incluir detalles de pago. Máximo 120 palabras.`,

    welcome: `Genera un email de bienvenida para el nuevo cliente ${request.clientName}. 
    ${request.context ? `Proyecto: ${request.context}` : ''}
    Debe ser cálido, explicar próximos pasos y establecer expectativas. Máximo 180 palabras.`,

    feedback_request: `Genera un email solicitando feedback para ${request.clientName}${request.projectName ? ` sobre "${request.projectName}"` : ''}. 
    Debe ser amigable, específico sobre qué feedback necesitas y fácil de responder. Máximo 130 palabras.`
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo más económico
      messages: [
        {
          role: "system",
          content: "Eres un asistente especializado en escribir emails profesionales para freelancers. Tus emails son claros, concisos y efectivos. Siempre incluyes un asunto sugerido al final entre []. Escribes en español de España."
        },
        {
          role: "user",
          content: prompts[request.type]
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Error generando email';
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error('Error al generar email con IA');
  }
}

// Función para analizar proyectos
export async function analyzeProject(request: ProjectAnalysisRequest): Promise<{
  status: 'on_track' | 'at_risk' | 'delayed';
  recommendations: string[];
  summary: string;
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un analista de proyectos experto. Analizas el estado de proyectos freelance y das recomendaciones específicas y accionables."
        },
        {
          role: "user",
          content: `Analiza este proyecto:
          Nombre: ${request.projectName}
          Descripción: ${request.description}
          Estado actual: ${request.currentStatus}
          Fecha límite: ${request.deadlineDate}
          ${request.tasksCompleted && request.totalTasks ? `Progreso: ${request.tasksCompleted}/${request.totalTasks} tareas` : ''}
          
          Proporciona:
          1. Estado: on_track, at_risk, o delayed
          2. 2-3 recomendaciones específicas
          3. Resumen en 50 palabras
          
          Formato JSON: {"status": "...", "recommendations": ["...", "..."], "summary": "..."}`
        }
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing project:', error);
    return {
      status: 'at_risk',
      recommendations: ['Error en el análisis, revisar manualmente'],
      summary: 'No se pudo analizar el proyecto'
    };
  }
}

// Función para generar contenido de automatizaciones
export async function generateAutomationContent(
  type: string, 
  context: Record<string, any>
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un asistente de automatizaciones para freelancers. Generas contenido útil y profesional."
        },
        {
          role: "user",
          content: `Genera contenido para automatización tipo "${type}" con contexto: ${JSON.stringify(context)}`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Contenido generado';
  } catch (error) {
    console.error('Error generating automation content:', error);
    throw new Error('Error al generar contenido');
  }
}
