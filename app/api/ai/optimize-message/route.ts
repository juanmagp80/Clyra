import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase-server';

// Analizar conversación completa con un cliente
export async function POST(request: NextRequest) {
  try {
    const { clientId, action } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: 'clientId es requerido' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Obtener información del cliente
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('name, company, email')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Obtener todos los mensajes de la conversación
    const { data: messages, error: messagesError } = await supabase
      .from('client_messages')
      .select('message, sender_type, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      return NextResponse.json({ error: 'Error al obtener mensajes' }, { status: 500 });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No hay mensajes en esta conversación' }, { status: 400 });
    }

    // Formatear conversación para OpenAI
    const conversationText = messages.map((msg: any) => 
      `[${msg.sender_type.toUpperCase()}]: ${msg.message}`
    ).join('\n\n');

    // Prompt específico según la acción
    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'analyze') {
      systemPrompt = `Eres un experto consultor en comunicación y relaciones cliente-freelancer. Analiza conversaciones completas y proporciona insights valiosos para mejorar la comunicación profesional.`;
      
      userPrompt = `Analiza esta conversación completa con el cliente "${client.name}" de "${client.company || 'su empresa'}":

${conversationText}

IMPORTANTE: Responde SOLO con un JSON válido en el siguiente formato exacto:

{
  "overallTone": "positive|negative|neutral",
  "confidence": 0.85,
  "satisfactionLevel": "high|medium|low",
  "satisfactionScore": 8,
  "strengths": [
    "Comunicación clara y profesional",
    "Respuesta rápida a consultas"
  ],
  "improvementAreas": [
    "Podría ser más proactivo en el seguimiento",
    "Agregar más detalles técnicos"
  ],
  "recommendations": [
    "Enviar actualizaciones de progreso semanalmente",
    "Ofrecer una llamada de seguimiento"
  ],
  "nextMessage": "Hola [nombre], espero que estés bien. Quería darte una actualización sobre el progreso del proyecto..."
}

Analiza:
1. **Tono general**: positive/negative/neutral con nivel de confianza
2. **Satisfacción del cliente**: high/medium/low con puntuación 1-10  
3. **Puntos fuertes**: Lo que estás haciendo bien
4. **Áreas de mejora**: Lo que puedes mejorar
5. **Recomendaciones**: Acciones específicas a tomar
6. **Próximo mensaje**: Mensaje optimizado para enviar ahora

Responde SOLO el JSON, sin texto adicional.`;

    } else if (action === 'suggest_response') {
      systemPrompt = `Eres un experto en comunicación profesional freelancer-cliente. Genera respuestas perfectas basadas en el contexto completo de la conversación.`;
      
      userPrompt = `Basándote en esta conversación completa con "${client.name}":

${conversationText}

Sugiere una respuesta profesional y efectiva que:
- Responda adecuadamente al último mensaje del cliente
- Mantenga un tono profesional pero cercano
- Avance la conversación de manera constructiva
- Demuestre proactividad y profesionalismo

Responde solo con el mensaje sugerido, listo para enviar.`;
    }

    // Llamar a OpenAI
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: action === 'analyze' ? 1000 : 300,
        temperature: 0.7
      })
    });

    if (!openaiRes.ok) {
      const error = await openaiRes.text();
      return NextResponse.json({ error: 'Error al contactar OpenAI', detail: error }, { status: 500 });
    }

    const data = await openaiRes.json();
    const result = data.choices?.[0]?.message?.content || '';

    // Si es análisis, intentar parsear JSON
    if (action === 'analyze') {
      try {
        const analysis = JSON.parse(result);
        return NextResponse.json({ 
          action: 'analyze',
          client: client.name,
          messagesCount: messages.length,
          analysis 
        });
      } catch (parseError) {
        // Si no es JSON válido, crear estructura fallback con el texto raw
        console.warn('JSON parsing failed, using fallback structure:', parseError);
        
        const fallbackAnalysis = {
          overallTone: 'neutral',
          confidence: 0.5,
          satisfactionLevel: 'medium',
          satisfactionScore: 5,
          strengths: ['Análisis disponible en formato raw'],
          improvementAreas: ['El formato de respuesta de IA necesita ajustes'],
          recommendations: [
            'Revisar el resultado completo en la sección raw',
            'Contactar soporte si este problema persiste'
          ],
          nextMessage: 'Hola, espero que estés bien. ¿Hay algo en lo que pueda ayudarte hoy?',
          raw: result // Incluir el texto original de OpenAI
        };

        return NextResponse.json({ 
          action: 'analyze',
          client: client.name,
          messagesCount: messages.length,
          analysis: fallbackAnalysis,
          parseError: true,
          originalResponse: result.substring(0, 500) + '...' // Muestra truncada
        });
      }
    }

    return NextResponse.json({ 
      action: 'suggest_response',
      client: client.name,
      suggested_message: result
    });

  } catch (error) {
    console.error('Error en optimize-message:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      detail: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}
