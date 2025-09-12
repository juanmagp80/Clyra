import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        console.log('🚀 Iniciando proceso de envío de contrato...');

        const { contractId } = await request.json();

        if (!contractId) {
            return NextResponse.json(
                { error: 'Contract ID is required' },
                { status: 400 }
            );
        }

        console.log('📋 Contract ID recibido:', contractId);

        // Verificar autenticación
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('❌ Error de autenticación:', authError);
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('✅ Usuario autenticado:', user.email);

        // Obtener el contrato completo con cliente
        console.log('🔍 Buscando contrato...');
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .select(`
                *,
                clients:client_id (
                    id,
                    name,
                    email,
                    company
                )
            `)
            .eq('id', contractId)
            .eq('user_id', user.id)
            .single();

        if (contractError || !contract) {
            console.error('❌ Error obteniendo contrato:', contractError);
            return NextResponse.json(
                { error: 'Contract not found' },
                { status: 404 }
            );
        }

        console.log('✅ Contrato encontrado:', contract.title);
        console.log('📧 Email del cliente:', contract.clients?.email);

        if (!contract.clients?.email) {
            return NextResponse.json(
                { error: 'Client email not found' },
                { status: 400 }
            );
        }

        // Obtener información del perfil del usuario
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, company, email, phone, website')
            .eq('id', user.id)
            .single();

        console.log('👤 Perfil usuario:', profile?.full_name || user.email);
        console.log('🏢 Empresa:', profile?.company || 'No configurada');

        // Verificar configuración de Resend
        console.log('🔑 Verificando configuración de Resend...');
        console.log('🔑 RESEND_API_KEY presente:', !!process.env.RESEND_API_KEY);
        console.log('🔑 FROM_EMAIL:', process.env.FROM_EMAIL);

        if (!process.env.RESEND_API_KEY) {
            console.log('⚠️ RESEND_API_KEY no configurada, enviando simulado...');
            return sendSimulatedEmail(contract, supabase, contractId, user.id);
        }

        // Configurar email
        const fromEmail = process.env.FROM_EMAIL || 'noreply@resend.dev';
        const freelancerName = profile?.full_name || user.email?.split('@')[0] || 'Freelancer';
        const companyName = profile?.company || 'Servicios Profesionales';
        const formattedFrom = `${freelancerName} <${fromEmail}>`;
        const replyToEmail = profile?.email || user.email;

        // Generar HTML del email
        const emailHtml = generateContractEmailHtml(contract, profile);

        // Generar PDF del contrato
        console.log('� Generando PDF del contrato...');
        const pdfBuffer = await generateContractPDF(contract, profile);
        console.log('✅ PDF generado exitosamente');

        console.log('�📧 Enviando email real a:', contract.clients.email);
        console.log('📤 Desde:', formattedFrom);
        console.log('↩️ Responder a:', replyToEmail);

        try {
            // Enviar email con Resend incluyendo el PDF como adjunto
            console.log('🔄 Intentando enviar email con PDF adjunto...');

            const cleanTitle = contract.title
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .toLowerCase();

            const emailResult = await resend.emails.send({
                from: formattedFrom,
                to: contract.clients.email,
                replyTo: replyToEmail,
                subject: `Contrato: ${contract.title}`,
                html: emailHtml,
                attachments: [
                    {
                        filename: `contrato-${cleanTitle}-${contract.id.substring(0, 8)}.pdf`,
                        content: pdfBuffer
                    }
                ],
                headers: {
                    'X-Entity-Ref-ID': contractId,
                    'X-Mailer': 'Taskelio Contract System',
                    'X-Priority': '3',
                    'X-MSMail-Priority': 'Normal',
                    'Importance': 'Normal',
                    'Reply-To': replyToEmail
                }
            });

            console.log('📬 Resultado de Resend:', emailResult);

            if (emailResult.error) {
                console.error('❌ Error enviando email:', emailResult.error);
                return NextResponse.json(
                    { error: 'Failed to send email: ' + emailResult.error.message },
                    { status: 500 }
                );
            }

            console.log('✅ Email enviado exitosamente, ID:', emailResult.data?.id);

            // Actualizar el estado del contrato
            const { error: updateError } = await supabase
                .from('contracts')
                .update({
                    status: 'sent',
                    sent_at: new Date().toISOString()
                })
                .eq('id', contractId)
                .eq('user_id', user.id);

            if (updateError) {
                console.error('❌ Error actualizando contrato:', updateError);
                return NextResponse.json(
                    { error: 'Email sent but failed to update contract status' },
                    { status: 500 }
                );
            }

            console.log('✅ Contrato actualizado exitosamente');

            return NextResponse.json({
                success: true,
                message: '📧 Contrato enviado por email exitosamente',
                contractTitle: contract.title,
                clientEmail: contract.clients.email,
                emailId: emailResult.data?.id,
                sentAt: new Date().toISOString()
            });

        } catch (emailError) {
            console.error('❌ Error en Resend (catch):', emailError);
            console.log('🔄 Fallback a modo simulación...');
            return sendSimulatedEmail(contract, supabase, contractId, user.id);
        }

    } catch (error) {
        console.error('❌ Error general:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Función de fallback para envío simulado
async function sendSimulatedEmail(contract: any, supabase: any, contractId: string, userId: string) {
    console.log('📧 Modo simulación - enviando email a:', contract.clients.email);
    console.log('📄 Contrato:', contract.title, '- Valor:', contract.contract_value);

    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Actualizar estado
    const { error: updateError } = await supabase
        .from('contracts')
        .update({
            status: 'sent',
            sent_at: new Date().toISOString()
        })
        .eq('id', contractId)
        .eq('user_id', userId);

    if (updateError) {
        console.error('❌ Error actualizando contrato:', updateError);
        return NextResponse.json(
            { error: 'Failed to update contract status' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        message: '📧 Contrato enviado exitosamente (simulado)',
        contractTitle: contract.title,
        clientEmail: contract.clients.email,
        emailId: 'simulated-' + Date.now(),
        sentAt: new Date().toISOString(),
        simulated: true
    });
}

// Generar HTML del email
function generateContractEmailHtml(contract: any, profile: any): string {
    const freelancerName = profile?.full_name || 'Tu Freelancer';
    const companyName = profile?.company || '';
    const contactEmail = profile?.email || '';
    const contactPhone = profile?.phone || '';
    const website = profile?.website || '';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato: ${contract.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            color: #1a202c;
        }
        .container {
            max-width: 700px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 0;
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
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .company-info {
            background-color: #f7fafc;
            padding: 25px 30px;
            border-bottom: 1px solid #e2e8f0;
        }
        .company-name {
            font-size: 22px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 8px;
        }
        .contact-info {
            color: #4a5568;
            font-size: 16px;
        }
        .contract-info {
            padding: 30px;
        }
        .info-section {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }
        .info-section h3 {
            margin: 0 0 15px 0;
            color: #2d3748;
            font-size: 18px;
            font-weight: 600;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-item:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #4a5568;
            min-width: 120px;
        }
        .info-value {
            color: #2d3748;
            font-weight: 500;
        }
        .contract-value {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .contract-value .amount {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        .contract-value .label {
            font-size: 14px;
            opacity: 0.9;
        }
        .next-steps {
            background-color: #fef5e7;
            border: 1px solid #f6e05e;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .next-steps h4 {
            color: #744210;
            margin: 0 0 10px 0;
            font-size: 16px;
        }
        .next-steps p {
            color: #744210;
            margin: 5px 0;
            font-size: 14px;
        }
        .footer {
            background-color: #2d3748;
            color: #e2e8f0;
            padding: 25px 30px;
            text-align: center;
        }
        .footer p {
            margin: 8px 0;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .container { margin: 10px; }
            .header { padding: 30px 20px; }
            .contract-info { padding: 20px; }
            .info-item { flex-direction: column; align-items: flex-start; }
            .info-label { margin-bottom: 5px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 CONTRATO DE SERVICIOS</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Propuesta contractual profesional</p>
        </div>

        <div class="company-info">
            <div class="company-name">${freelancerName}</div>
            ${companyName ? `<div style="font-size: 16px; color: #4a5568; margin-bottom: 8px;">${companyName}</div>` : ''}
            <div class="contact-info">
                ${contactEmail ? `📧 ${contactEmail}` : ''}
                ${contactPhone ? ` • 📞 ${contactPhone}` : ''}
                ${website ? ` • 🌐 ${website}` : ''}
            </div>
        </div>

        <div class="contract-info">
            <div class="info-section">
                <h3>👤 Información del Cliente</h3>
                <div class="info-item">
                    <span class="info-label">Cliente:</span>
                    <span class="info-value">${contract.clients?.name || 'Cliente'}</span>
                </div>
                ${contract.clients?.company ? `
                <div class="info-item">
                    <span class="info-label">Empresa:</span>
                    <span class="info-value">${contract.clients.company}</span>
                </div>` : ''}
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${contract.clients?.email}</span>
                </div>
            </div>

            <div class="info-section">
                <h3>📊 Detalles del Contrato</h3>
                <div class="info-item">
                    <span class="info-label">Título:</span>
                    <span class="info-value">${contract.title}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Estado:</span>
                    <span class="info-value">📧 Enviado</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha de Inicio:</span>
                    <span class="info-value">${new Date(contract.start_date).toLocaleDateString('es-ES')}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha de Fin:</span>
                    <span class="info-value">${new Date(contract.end_date).toLocaleDateString('es-ES')}</span>
                </div>
                ${contract.payment_terms ? `
                <div class="info-item">
                    <span class="info-label">Términos de Pago:</span>
                    <span class="info-value">${contract.payment_terms}</span>
                </div>` : ''}
            </div>

            <div class="contract-value">
                <div class="amount">${contract.contract_value.toLocaleString('es-ES')} ${contract.currency}</div>
                <div class="label">Valor Total del Contrato</div>
            </div>

            <div class="info-section">
                <h3>📄 Descripción del Servicio</h3>
                <p style="color: #4a5568; line-height: 1.6; margin: 0;">
                    ${contract.description || 'Servicios profesionales según especificaciones acordadas.'}
                </p>
            </div>

            <div class="next-steps">
                <h4>📋 Próximos Pasos</h4>
                <p>• 📄 <strong>Revisar el contrato adjunto en PDF</strong></p>
                <p>• Confirmar la aceptación de los servicios propuestos</p>
                <p>• Coordinar fecha de inicio del proyecto</p>
                <p>• Establecer canales de comunicación del proyecto</p>
            </div>

            <div style="background-color: #e0f2fe; border: 1px solid #0288d1; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #01579b; font-weight: 600;">
                    📎 Se adjunta el contrato completo en formato PDF para tu revisión y archivo.
                </p>
            </div>
        </div>

        <div class="footer">
            <p><strong>Contrato generado por ${freelancerName}</strong></p>
            ${companyName ? `<p>${companyName}</p>` : ''}
            <p>Este es un email automático generado por nuestro sistema de gestión.</p>
            <p style="margin-bottom: 0;">💬 ¿Tienes preguntas? Responde directamente a este email.</p>
        </div>
    </div>
</body>
</html>
    `;
}

// Función para generar PDF del contrato compatible con Next.js
async function generateContractPDF(contract: any, profile: any): Promise<Buffer> {
    // Usar jsPDF que es más compatible con entornos serverless
    const { jsPDF } = await import('jspdf');
    
    return new Promise((resolve, reject) => {
        try {
            // Crear documento PDF con configuración básica sin cargar fuentes externas
            const doc = new PDFDocument({ 
                margin: 50,
                bufferPages: true,
                autoFirstPage: true,
                compress: false,
                info: {
                    Title: 'Contrato de Servicios',
                    Author: 'Taskelio'
                }
            });
            
            const buffers: Buffer[] = [];

            doc.on('data', (buffer: Buffer) => buffers.push(buffer));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Establecer fuente básica por defecto sin cargar archivos externos
            // PDFKit debería usar fuentes internas por defecto

            // Configuración de colores
            const primaryColor = '#2563eb';
            const grayColor = '#6b7280';
            const blackColor = '#1f2937';

            // Configuración de márgenes
            const marginLeft = 60;
            const marginRight = 60;
            const pageWidth = 595.28; // A4 width
            const contentWidth = pageWidth - marginLeft - marginRight;

            // Función helper para limpiar texto
            const cleanText = (text: string) => {
                return text
                    .replace(/[^\x00-\x7F]/g, "") // Remover caracteres no ASCII
                    .replace(/\u00A0/g, " ") // Reemplazar espacios no rompibles
                    .trim();
            };

            // Header principal - usando solo fuentes estándar
            doc.rect(marginLeft, 60, contentWidth, 3)
               .fill(primaryColor);

            doc.fontSize(24)
               .fillColor(primaryColor)
               .text('CONTRATO DE SERVICIOS', marginLeft, 80, {
                   width: contentWidth,
                   align: 'center'
               });

            // Título del contrato
            doc.fontSize(16)
               .fillColor(blackColor)
               .text(cleanText(contract.title), marginLeft, 120, {
                   width: contentWidth,
                   align: 'center'
               });

            let currentY = 160;

            // Información del cliente
            doc.fontSize(14)
               .fillColor(primaryColor)
               .text('INFORMACION DEL CLIENTE', marginLeft, currentY);

            currentY += 25;

            const clientInfo = [
                ['Cliente:', contract.clients?.name || 'No especificado'],
                ['Empresa:', contract.clients?.company || 'No especificado'],
                ['Email:', contract.clients?.email || 'No especificado']
            ];

            clientInfo.forEach((row, index) => {
                doc.fontSize(11)
                   .fillColor(grayColor)
                   .text(row[0], marginLeft, currentY, { continued: true })
                   .fillColor(blackColor)
                   .text(' ' + cleanText(row[1]));
                
                currentY += 18;
            });

            currentY += 15;

            // Información del contrato
            doc.fontSize(14)
               .fillColor(primaryColor)
               .text('INFORMACION DEL CONTRATO', marginLeft, currentY);

            currentY += 25;

            const contractInfo = [
                ['Valor:', `${contract.contract_value.toLocaleString('es-ES')} ${contract.currency}`],
                ['Fecha Inicio:', new Date(contract.start_date).toLocaleDateString('es-ES')],
                ['Fecha Fin:', new Date(contract.end_date).toLocaleDateString('es-ES')],
                ['Terminos Pago:', contract.payment_terms || 'Segun acuerdo'],
                ['Estado:', 'Enviado']
            ];

            contractInfo.forEach((row, index) => {
                doc.fontSize(11)
                   .fillColor(grayColor)
                   .text(row[0], marginLeft, currentY, { continued: true })
                   .fillColor(blackColor)
                   .text(' ' + cleanText(row[1]));
                
                currentY += 18;
            });

            currentY += 25;

            // Términos y condiciones
            doc.fontSize(14)
               .fillColor(primaryColor)
               .text('TERMINOS Y CONDICIONES', marginLeft, currentY);

            currentY += 25;

            // Contenido profesional del contrato
            const professionalContent = generateContractContent(contract);

            const sections = professionalContent.split('\n\n');

            doc.fontSize(10)
               .fillColor(blackColor);

            for (const section of sections) {
                if (section.trim()) {
                    // Verificar si necesitamos nueva página
                    const textHeight = doc.heightOfString(section, { 
                        width: contentWidth - 20,
                        lineGap: 3
                    });
                    
                    if (currentY + textHeight + 25 > 720) {
                        doc.addPage();
                        currentY = 50;
                    }

                    // Detectar títulos (en mayúsculas con :)
                    const isTitle = section.includes(':') && 
                                   section.split(':')[0].toUpperCase() === section.split(':')[0];
                    
                    if (isTitle) {
                        doc.fontSize(11).fillColor(primaryColor);
                    } else {
                        doc.fontSize(10).fillColor(blackColor);
                    }

                    doc.text(cleanText(section), marginLeft + 10, currentY, {
                        width: contentWidth - 20,
                        align: 'justify',
                        lineGap: 3
                    });

                    currentY += textHeight + (isTitle ? 15 : 12);
                }
            }

            // Sección de firmas
            currentY += 30;

            if (currentY > 650) {
                doc.addPage();
                currentY = 50;
            }

            doc.fontSize(14)
               .fillColor(primaryColor)
               .text('FIRMAS Y ACEPTACION', marginLeft, currentY);

            currentY += 40;

            // Líneas de firma
            const signatureWidth = (contentWidth - 40) / 2;
            
            // Cliente
            doc.fontSize(11)
               .fillColor(blackColor)
               .text('CLIENTE:', marginLeft, currentY)
               .text(contract.clients?.name || 'Cliente', marginLeft, currentY + 15);

            doc.moveTo(marginLeft, currentY + 50)
               .lineTo(marginLeft + signatureWidth, currentY + 50)
               .stroke();

            doc.fontSize(9)
               .text('Firma del Cliente', marginLeft, currentY + 60);

            // Freelancer
            const freelancerX = marginLeft + signatureWidth + 40;
            const freelancerName = profile?.full_name || 'Freelancer';
            
            doc.fontSize(11)
               .fillColor(blackColor)
               .text('FREELANCER:', freelancerX, currentY)
               .text(freelancerName, freelancerX, currentY + 15);

            doc.moveTo(freelancerX, currentY + 50)
               .lineTo(freelancerX + signatureWidth, currentY + 50)
               .stroke();

            doc.fontSize(9)
               .text('Firma del Freelancer', freelancerX, currentY + 60);

            currentY += 80;

            // Fecha
            doc.fontSize(10)
               .fillColor(blackColor)
               .text(`Fecha: ___________________`, marginLeft, currentY, {
                   width: contentWidth,
                   align: 'center'
               });

            // Footer
            doc.fontSize(9)
               .fillColor(grayColor)
               .text('Documento generado por Taskelio CRM', marginLeft, currentY + 40, {
                   width: contentWidth,
                   align: 'center'
               });

            doc.end();

        } catch (error) {
            console.error('Error generando PDF:', error);
            reject(error);
        }
    });
}

// Generar contenido del contrato según el tipo
function generateContractContent(contract: any): string {
    const serviceName = contract.title;
    const clientName = contract.clients?.name || 'Cliente';
    
    // Detectar tipo de servicio básico
    const title = contract.title.toLowerCase();
    let serviceType = 'general';
    
    if (title.includes('desarrollo') || title.includes('web') || title.includes('app')) {
        serviceType = 'desarrollo';
    } else if (title.includes('diseño') || title.includes('grafico') || title.includes('logo')) {
        serviceType = 'diseno';
    } else if (title.includes('marketing') || title.includes('seo') || title.includes('publicidad')) {
        serviceType = 'marketing';
    }

    const templates = {
        desarrollo: `OBJETO DEL CONTRATO: El FREELANCER prestara servicios profesionales de desarrollo de software especificados como "${serviceName}" para el CLIENTE.

OBLIGACIONES DEL FREELANCER:
- Desarrollar el software/aplicacion segun las especificaciones acordadas
- Entregar el codigo fuente limpio y documentado
- Realizar las pruebas necesarias para garantizar el correcto funcionamiento
- Proporcionar documentacion tecnica y de usuario
- Ofrecer soporte tecnico durante los primeros 30 dias posteriores a la entrega
- Mantener la confidencialidad de la informacion del proyecto

OBLIGACIONES DEL CLIENTE:
- Proporcionar toda la informacion y recursos necesarios para el desarrollo
- Revisar y aprobar los entregables en los plazos establecidos
- Realizar los pagos segun los terminos acordados
- Proporcionar feedback constructivo durante el proceso de desarrollo

PROPIEDAD INTELECTUAL: Una vez completado el pago total, todos los derechos de propiedad intelectual del trabajo desarrollado especificamente para este proyecto seran transferidos al CLIENTE.

GARANTIA: El FREELANCER garantiza que el trabajo entregado estara libre de defectos de programacion y funcionara segun las especificaciones durante un periodo de 90 dias posteriores a la entrega final.`,

        diseno: `OBJETO DEL CONTRATO: El FREELANCER prestara servicios profesionales de diseno especificados como "${serviceName}" para el CLIENTE.

OBLIGACIONES DEL FREELANCER:
- Crear disenos originales segun el brief y especificaciones del cliente
- Presentar propuestas iniciales y realizar hasta 3 rondas de revisiones incluidas
- Entregar archivos finales en formatos vectoriales y rasterizados segun se requiera
- Mantener la coherencia con la identidad visual del cliente si aplica
- Cumplir con los plazos de entrega establecidos
- Garantizar la originalidad del trabajo y respeto a derechos de autor

OBLIGACIONES DEL CLIENTE:
- Proporcionar un brief detallado con objetivos, publico objetivo y preferencias
- Suministrar materiales de referencia, logos, imagenes o contenido necesario
- Revisar y aprobar disenos en los plazos acordados
- Realizar los pagos segun los terminos establecidos

PROPIEDAD INTELECTUAL: Los derechos de uso comercial del diseno final seran transferidos al CLIENTE una vez completado el pago.

REVISIONES: Se incluyen hasta 3 rondas de revisiones. Cambios adicionales que modifiquen sustancialmente el concepto original podran generar costos adicionales.`,

        marketing: `OBJETO DEL CONTRATO: El FREELANCER prestara servicios profesionales de marketing digital especificados como "${serviceName}" para el CLIENTE.

OBLIGACIONES DEL FREELANCER:
- Desarrollar estrategias de marketing alineadas con los objetivos del cliente
- Ejecutar campanas publicitarias en las plataformas acordadas
- Realizar analisis y seguimiento de metricas de rendimiento
- Proporcionar reportes mensuales con resultados y recomendaciones
- Mantener actualizado el conocimiento de las mejores practicas del sector
- Optimizar continuamente las campanas para mejorar el ROI

OBLIGACIONES DEL CLIENTE:
- Proporcionar acceso a las cuentas y plataformas necesarias
- Suministrar materiales de marca, productos y contenido relevante
- Aprobar estrategias y campanas antes de su implementacion
- Proporcionar presupuesto publicitario adicional cuando sea requerido

METRICAS Y OBJETIVOS: Se estableceran KPIs especificos al inicio del proyecto. Los resultados pueden variar segun factores externos del mercado.

CONFIDENCIALIDAD: Toda informacion comercial, estrategica y de audiencia sera tratada de forma estrictamente confidencial.`,

        general: `OBJETO DEL CONTRATO: El FREELANCER prestara servicios profesionales especificados como "${serviceName}" para el CLIENTE.

OBLIGACIONES DEL FREELANCER:
- Ejecutar los servicios acordados con profesionalismo y diligencia
- Cumplir con los plazos y especificaciones establecidas
- Mantener comunicacion regular sobre el progreso del proyecto
- Entregar trabajos de calidad que cumplan con los objetivos establecidos
- Mantener confidencialidad sobre informacion del cliente
- Proporcionar soporte y aclaraciones segun se requiera

OBLIGACIONES DEL CLIENTE:
- Proporcionar informacion y recursos necesarios para la ejecucion
- Revisar y aprobar entregables en los plazos establecidos
- Mantener comunicacion efectiva durante el proyecto
- Realizar los pagos segun los terminos acordados

CALIDAD Y ESTANDARES: Todos los servicios se ejecutaran siguiendo las mejores practicas de la industria y con el maximo profesionalismo.

CONFIDENCIALIDAD: Toda informacion intercambiada sera tratada de forma confidencial y no sera divulgada a terceros sin autorizacion expresa.`
    };

    return templates[serviceType as keyof typeof templates] || templates.general;
}