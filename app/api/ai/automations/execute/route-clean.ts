import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/src/lib/supabase-admin';
import { 
    analyzeFeedback, 
    optimizeCommunication, 
    analyzeProposal, 
    generateContent, 
    detectProjectRisks, 
    analyzePerformance, 
    analyzePricing 
} from '@/lib/openai';

// Tipos para la request
interface AutomationRequest {
    type: string;
    data: any;
    userId: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: AutomationRequest = await request.json();
        const { type, data, userId: userEmail } = body;

        console.log('🤖 Executing AI automation:', { type, userEmail });

        const supabase = createSupabaseAdmin();
        
        // Obtener el ID del usuario desde el email
        console.log('📧 Looking up user by email:', userEmail);
        
        const { data: userId, error: userError } = await supabase
            .rpc('get_user_id_by_email', { user_email: userEmail });

        console.log('🔍 User lookup result:', { userId, userError });

        if (userError || !userId) {
            console.error('❌ User not found for email:', userEmail, userError);
            return NextResponse.json({ 
                error: 'Usuario no encontrado. Verifica que estés autenticado.' 
            }, { status: 404 });
        }

        console.log('✅ User ID found:', userId);
        let result: any = null;

        console.log('🔀 Processing automation type:', type);

        switch (type) {
            case 'sentiment_analysis':
                result = await executeSentimentAnalysis(data, userId, supabase);
                break;
            
            case 'communication_optimization':
                result = await executeCommunicationOptimization(data, userId, supabase);
                break;
            
            case 'proposal_analysis':
                result = await executeProposalAnalysis(data, userId, supabase);
                break;
            
            case 'content_generation':
                result = await executeContentGeneration(data, userId, supabase);
                break;
            
            case 'risk_detection':
                result = await executeRiskDetection(data, userId, supabase);
                break;
            
            case 'performance_analysis':
                result = await executePerformanceAnalysis(data, userId, supabase);
                break;
            
            case 'pricing_optimization':
                result = await executePricingOptimization(data, userId, supabase);
                break;
            
            default:
                return NextResponse.json({ 
                    error: 'Tipo de automatización no soportado' 
                }, { status: 400 });
        }

        console.log('✅ Automation completed successfully');
        return NextResponse.json({ 
            success: true, 
            data: result 
        });

    } catch (error) {
        console.error('❌ Error in automation endpoint:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Error interno del servidor'
        }, { status: 500 });
    }
}

// Funciones de automatización

async function executeSentimentAnalysis(data: any, userId: string, supabase: any) {
    try {
        console.log('🎭 Starting sentiment analysis for user:', userId);
        const { text, clientId, source = 'manual' } = data;
        console.log('📝 Analysis data:', { text: text?.substring(0, 50) + '...', clientId, source });
        
        // Analizar sentimiento con OpenAI
        console.log('🤖 Calling OpenAI analyzeFeedback...');
        const analysis = await analyzeFeedback(text);
        console.log('✅ OpenAI analysis complete:', analysis);
        
        // Buscar información del cliente si existe
        let clientData = null;
        if (clientId) {
            console.log('👤 Looking up client:', clientId);
            const { data: client } = await supabase
                .from('clients')
                .select('name, email, company')
                .eq('id', clientId)
                .eq('user_id', userId)
                .single();
            clientData = client;
            console.log('👤 Client data:', clientData);
        }
        
        // Preparar datos para inserción
        const insertData = {
            user_id: userId,
            insight_type: 'sentiment_analysis',
            category: 'client_feedback',
            title: `Análisis de Sentimiento - ${clientData?.name || 'Cliente'}`,
            description: `Análisis automático de feedback: ${analysis.sentiment.toUpperCase()}`,
            data_points: {
                original_text: text,
                sentiment: analysis.sentiment,
                confidence: analysis.confidence,
                emotions: analysis.emotions,
                urgency: analysis.urgency,
                client_data: clientData,
                source
            },
            confidence_score: analysis.confidence,
            impact_score: analysis.sentiment === 'negative' ? 9 : analysis.sentiment === 'positive' ? 7 : 5,
            actionability_score: analysis.urgency === 'high' ? 10 : analysis.urgency === 'medium' ? 7 : 4,
            recommendations: analysis.recommendations,
            suggested_actions: analysis.suggested_actions
        };
        
        console.log('💾 Saving to ai_insights...');
        console.log('📊 Insert data:', insertData);
        
        const { data: savedAnalysis, error } = await supabase
            .from('ai_insights')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error('❌ Error saving sentiment analysis:', error);
            throw new Error('Error guardando análisis de sentimiento: ' + error.message);
        }
        
        console.log('✅ Saved to database:', savedAnalysis.id);

        // Si es negativo y urgente, crear tarea automática
        if (analysis.sentiment === 'negative' && analysis.urgency === 'high') {
            console.log('🚨 Creating urgent task...');
            await supabase
                .from('tasks')
                .insert({
                    user_id: userId,
                    client_id: clientId,
                    title: `🚨 URGENTE: Atender feedback negativo de ${clientData?.name || 'cliente'}`,
                    description: `Análisis IA detectó feedback muy negativo que requiere atención inmediata.\n\nTexto original: "${text}"\n\nRecomendaciones IA: ${analysis.recommendations.join(', ')}`,
                    priority: 'high',
                    status: 'pending',
                    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    category: 'client_management'
                });
        }

        return {
            success: true,
            analysis,
            saved_id: savedAnalysis.id,
            message: `Análisis de sentimiento completado: ${analysis.sentiment.toUpperCase()} (${Math.round(analysis.confidence * 100)}% confianza)`
        };
        
    } catch (error) {
        console.error('❌ Error in executeSentimentAnalysis:', error);
        throw error;
    }
}

async function executeCommunicationOptimization(data: any, userId: string, supabase: any) {
    const { originalMessage, context, clientId } = data;
    
    // Optimizar comunicación con OpenAI
    const optimization = await optimizeCommunication(originalMessage, context);
    
    // Buscar información del cliente si existe
    let clientData = null;
    if (clientId) {
        const { data: client } = await supabase
            .from('clients')
            .select('name, email, company')
            .eq('id', clientId)
            .eq('user_id', userId)
            .single();
        clientData = client;
    }
    
    // Guardar resultado en base de datos
    const { data: savedOptimization, error } = await supabase
        .from('ai_insights')
        .insert({
            user_id: userId,
            insight_type: 'communication_optimization',
            category: 'communication',
            title: `Optimización de Comunicación - ${clientData?.name || 'Cliente'}`,
            description: `Mensaje optimizado para mejorar claridad y profesionalismo`,
            data_points: {
                original_message: originalMessage,
                optimized_message: optimization.optimizedMessage,
                context,
                improvements: optimization.improvements,
                tone_analysis: optimization.toneAnalysis,
                client_data: clientData
            },
            confidence_score: optimization.confidence,
            impact_score: 8,
            actionability_score: 9,
            recommendations: optimization.suggestions,
            suggested_actions: [{
                action: 'use_optimized_message',
                description: 'Usar el mensaje optimizado para mejorar la comunicación',
                priority: 'high'
            }]
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving communication optimization:', error);
        throw new Error('Error guardando optimización de comunicación');
    }

    return {
        optimization,
        saved_insight_id: savedOptimization.id
    };
}

// Implementar las demás funciones de manera similar...
async function executeProposalAnalysis(data: any, userId: string, supabase: any) {
    const { proposalText, clientId, projectType } = data;
    const analysis = await analyzeProposal(proposalText, projectType);
    
    const { data: savedAnalysis, error } = await supabase
        .from('ai_insights')
        .insert({
            user_id: userId,
            insight_type: 'proposal_analysis',
            category: 'sales',
            title: `Análisis de Propuesta - ${projectType}`,
            description: `Análisis detallado de propuesta comercial`,
            data_points: analysis,
            confidence_score: analysis.confidence,
            impact_score: 8,
            actionability_score: 8,
            recommendations: analysis.recommendations
        })
        .select()
        .single();

    if (error) throw new Error('Error guardando análisis de propuesta');
    return { analysis, saved_insight_id: savedAnalysis.id };
}

async function executeContentGeneration(data: any, userId: string, supabase: any) {
    const { contentType, topic, targetAudience, tone } = data;
    const content = await generateContent(contentType, topic, targetAudience, tone);
    
    const { data: savedContent, error } = await supabase
        .from('ai_insights')
        .insert({
            user_id: userId,
            insight_type: 'content_generation',
            category: 'productivity',
            title: `Contenido Generado - ${contentType}`,
            description: `Contenido automático sobre: ${topic}`,
            data_points: content,
            confidence_score: content.confidence,
            impact_score: 7,
            actionability_score: 9
        })
        .select()
        .single();

    if (error) throw new Error('Error guardando contenido generado');
    return { content, saved_insight_id: savedContent.id };
}

async function executeRiskDetection(data: any, userId: string, supabase: any) {
    const { projectId } = data;
    const risks = await detectProjectRisks(projectId);
    
    const { data: savedRisks, error } = await supabase
        .from('ai_insights')
        .insert({
            user_id: userId,
            insight_type: 'risk_detection',
            category: 'project_management',
            title: `Detección de Riesgos - Proyecto`,
            description: `Análisis de riesgos del proyecto`,
            data_points: risks,
            confidence_score: risks.confidence,
            impact_score: 9,
            actionability_score: 8,
            recommendations: risks.recommendations
        })
        .select()
        .single();

    if (error) throw new Error('Error guardando detección de riesgos');
    return { risks, saved_insight_id: savedRisks.id };
}

async function executePerformanceAnalysis(data: any, userId: string, supabase: any) {
    const { period } = data;
    const performance = await analyzePerformance(userId, period);
    
    const { data: savedPerformance, error } = await supabase
        .from('ai_insights')
        .insert({
            user_id: userId,
            insight_type: 'performance_analysis',
            category: 'analytics',
            title: `Análisis de Rendimiento - ${period}`,
            description: `Análisis detallado de rendimiento`,
            data_points: performance,
            confidence_score: performance.confidence,
            impact_score: 8,
            actionability_score: 7,
            recommendations: performance.recommendations
        })
        .select()
        .single();

    if (error) throw new Error('Error guardando análisis de rendimiento');
    return { performance, saved_insight_id: savedPerformance.id };
}

async function executePricingOptimization(data: any, userId: string, supabase: any) {
    const { projectType, scope, currentPrice } = data;
    const pricing = await analyzePricing(projectType, scope, currentPrice);
    
    const { data: savedPricing, error } = await supabase
        .from('ai_insights')
        .insert({
            user_id: userId,
            insight_type: 'pricing_optimization',
            category: 'sales',
            title: `Optimización de Precios - ${projectType}`,
            description: `Análisis y optimización de precios`,
            data_points: pricing,
            confidence_score: pricing.confidence,
            impact_score: 9,
            actionability_score: 8,
            recommendations: pricing.recommendations
        })
        .select()
        .single();

    if (error) throw new Error('Error guardando optimización de precios');
    return { pricing, saved_insight_id: savedPricing.id };
}
