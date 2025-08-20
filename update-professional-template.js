require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltan variables de entorno');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const professionalSurveyTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Encuesta de Satisfacción - {COMPANY_NAME}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            margin-bottom: 25px;
        }
        
        .greeting h2 {
            color: #2d3748;
            font-size: 22px;
            margin-bottom: 10px;
        }
        
        .message {
            margin-bottom: 30px;
            line-height: 1.7;
            font-size: 16px;
            color: #4a5568;
        }
        
        .survey-section {
            background-color: #f7fafc;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #667eea;
        }
        
        .survey-question {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
        }
        
        .rating-scale {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }
        
        .rating-item {
            text-align: center;
            flex: 1;
            min-width: 80px;
            margin: 5px;
        }
        
        .rating-number {
            display: inline-block;
            width: 45px;
            height: 45px;
            line-height: 45px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .rating-label {
            font-size: 12px;
            color: #666;
            font-weight: 500;
        }
        
        .scale-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            font-size: 14px;
            color: #666;
        }
        
        .scale-labels .start {
            color: #e53e3e;
            font-weight: 600;
        }
        
        .scale-labels .end {
            color: #38a169;
            font-weight: 600;
        }
        
        .cta-section {
            text-align: center;
            margin: 35px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 35px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
        }
        
        .additional-questions {
            background-color: #edf2f7;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .additional-questions h3 {
            color: #2d3748;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .additional-questions ul {
            list-style: none;
            padding-left: 0;
        }
        
        .additional-questions li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
            color: #4a5568;
        }
        
        .additional-questions li:before {
            content: "→";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
        }
        
        .footer {
            background-color: #2d3748;
            color: white;
            padding: 25px 30px;
            text-align: center;
        }
        
        .footer p {
            margin-bottom: 10px;
            opacity: 0.8;
        }
        
        .company-info {
            border-top: 1px solid #4a5568;
            padding-top: 20px;
            margin-top: 20px;
            font-size: 14px;
            opacity: 0.7;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header, .content, .footer {
                padding: 25px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .rating-scale {
                justify-content: center;
            }
            
            .rating-item {
                min-width: 60px;
            }
            
            .rating-number {
                width: 40px;
                height: 40px;
                line-height: 40px;
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Encuesta de Satisfacción</h1>
            <p>Su opinión es muy importante para nosotros</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                <h2>Estimado/a {CLIENT_NAME},</h2>
            </div>
            
            <div class="message">
                <p>Esperamos que se encuentre bien. En <strong>{COMPANY_NAME}</strong> nos esforzamos constantemente por brindar el mejor servicio posible a nuestros clientes.</p>
                
                <p>Su experiencia reciente con nuestros servicios es muy valiosa para nosotros, y nos gustaría conocer su opinión para seguir mejorando.</p>
            </div>
            
            <div class="survey-section">
                <div class="survey-question">
                    ¿Cómo calificaría su experiencia general con nuestros servicios?
                </div>
                
                <div class="rating-scale">
                    <div class="rating-item">
                        <div class="rating-number">1</div>
                        <div class="rating-label">Muy insatisfecho</div>
                    </div>
                    <div class="rating-item">
                        <div class="rating-number">2</div>
                        <div class="rating-label">Insatisfecho</div>
                    </div>
                    <div class="rating-item">
                        <div class="rating-number">3</div>
                        <div class="rating-label">Neutral</div>
                    </div>
                    <div class="rating-item">
                        <div class="rating-number">4</div>
                        <div class="rating-label">Satisfecho</div>
                    </div>
                    <div class="rating-item">
                        <div class="rating-number">5</div>
                        <div class="rating-label">Muy satisfecho</div>
                    </div>
                </div>
                
                <div class="scale-labels">
                    <span class="start">Necesita mejorar</span>
                    <span class="end">Excelente</span>
                </div>
            </div>
            
            <div class="additional-questions">
                <h3>También nos encantaría conocer su opinión sobre:</h3>
                <ul>
                    <li>La calidad del servicio recibido</li>
                    <li>La atención y profesionalismo de nuestro equipo</li>
                    <li>Los tiempos de respuesta y entrega</li>
                    <li>La comunicación durante el proceso</li>
                    <li>Sugerencias para mejorar</li>
                </ul>
            </div>
            
            <div class="cta-section">
                <a href="mailto:juangpdev@gmail.com?subject=Encuesta de Satisfacción - {COMPANY_NAME}&body=Estimado equipo de {COMPANY_NAME},%0A%0AMi calificación general es: [Escriba su calificación del 1 al 5]%0A%0AComentarios adicionales:%0A%0A" class="cta-button">
                    Responder Encuesta
                </a>
            </div>
            
            <div class="message">
                <p><strong>¿Prefiere responder por teléfono?</strong><br>
                No dude en contactarnos directamente. Su tiempo es valioso y queremos facilitarle el proceso de retroalimentación.</p>
                
                <p>Agradecemos sinceramente el tiempo que dedique a completar esta encuesta. Sus comentarios nos ayudan a seguir creciendo y mejorando.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Gracias por confiar en {COMPANY_NAME}</strong></p>
            <p>Esperamos seguir brindándole un servicio excepcional</p>
            
            <div class="company-info">
                <p>Este email fue enviado por {USER_NAME} desde {COMPANY_NAME}</p>
                <p>Puede responder directamente a este correo para contactarnos</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

async function updateTemplate() {
    try {
        console.log('🔄 Actualizando template de encuesta profesional...');

        const { data, error } = await supabase
            .from('email_templates')
            .update({
                subject: 'Encuesta de Satisfacción - {COMPANY_NAME}',
                content: professionalSurveyTemplate.trim(),
                updated_at: new Date().toISOString()
            })
            .eq('name', 'satisfaction_survey')
            .select();

        if (error) {
            console.error('❌ Error actualizando template:', error);
        } else {
            console.log('✅ Template profesional actualizado exitosamente');
            console.log('📄 Registros afectados:', data?.length || 0);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

updateTemplate();
