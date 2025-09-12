'use client';

import Sidebar from '@/components/Sidebar';
import TrialBanner from '@/components/TrialBanner';
import { Button } from '@/components/ui/Button';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useTrialStatus } from '@/src/lib/useTrialStatus';
import { showToast } from '@/utils/toast';
import {
    ArrowLeft,
    Download,
    Edit,
    Mail,
    Share2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Contract {
    id: string;
    title: string;
    description: string;
    contract_content: string;
    contract_value: number;
    currency: string;
    status: string;
    start_date: string;
    end_date: string;
    payment_terms: string;
    created_at: string;
    sent_at?: string;
    client_id: string;
    client: {
        name: string;
        email: string;
        company?: string;
    };
}

interface ContractDetailClientProps {
    contractId: string;
    userEmail: string;
}

export default function ContractDetailClient({ contractId, userEmail }: ContractDetailClientProps) {
    const router = useRouter();
    const { canUseFeatures } = useTrialStatus(userEmail);
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContract();
    }, [contractId]);

    const loadContract = async () => {
        try {
            const supabase = createSupabaseClient();

            const { data, error } = await supabase
                .from('contracts')
                .select(`
                    *,
                    clients!inner(name, email, company)
                `)
                .eq('id', contractId)
                .single();

            if (error) throw error;

            setContract({
                ...data,
                client: data.clients
            });
        } catch (error) {
            console.error('Error loading contract:', error);
            showToast.error('Error al cargar el contrato');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Borrador' },
            sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Enviado' },
            signed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Firmado' },
            active: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Activo' },
            completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Completado' },
            terminated: { bg: 'bg-red-100', text: 'text-red-800', label: 'Terminado' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const handleDownloadPDF = async () => {
        if (!contract) return;

        try {
            showToast.info('Generando PDF...');

            // Importar PDFKit dinámicamente para el cliente
            // @ts-ignore
            const PDFDocument = (await import('pdfkit-browserify')).default;
            // @ts-ignore
            const blobStream = (await import('blob-stream')).default;

            // Crear el documento PDF
            const doc = new PDFDocument({
                size: 'A4',
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50
                },
                info: {
                    Title: `Contrato - ${contract.title}`,
                    Author: 'Taskelio',
                    Subject: 'Contrato de servicios',
                    Creator: 'Taskelio CRM'
                }
            });

            // Crear stream para el PDF
            const stream = doc.pipe(blobStream());

            // Configurar colores
            const primaryColor = '#2563eb';
            const grayColor = '#64748b';
            const blackColor = '#1e293b';
            const lightGrayColor = '#f1f5f9';

            // Márgenes
            const marginLeft = 50;
            const marginRight = 50;
            const pageWidth = 595.28; // A4 width
            const contentWidth = pageWidth - marginLeft - marginRight;

            // Función helper para limpiar texto
            const cleanText = (text: string) => {
                return text
                    .replace(/[^\x00-\x7F]/g, "") // Remover caracteres no ASCII
                    .replace(/\u00A0/g, " ") // Reemplazar espacios no rompibles
                    .trim();
            };

            // Función para detectar el tipo de servicio
            const detectServiceType = (title: string, description: string): string => {
                const text = (title + ' ' + description).toLowerCase();
                
                if (text.includes('desarrollo') || text.includes('programacion') || text.includes('software') || text.includes('web') || text.includes('app')) {
                    return 'desarrollo';
                }
                if (text.includes('diseno') || text.includes('diseño') || text.includes('grafico') || text.includes('logo') || text.includes('branding')) {
                    return 'diseno';
                }
                if (text.includes('marketing') || text.includes('publicidad') || text.includes('seo') || text.includes('social') || text.includes('campana')) {
                    return 'marketing';
                }
                if (text.includes('consultoria') || text.includes('asesoria') || text.includes('consultor') || text.includes('estrategia')) {
                    return 'consultoria';
                }
                if (text.includes('contenido') || text.includes('redaccion') || text.includes('copywriting') || text.includes('blog') || text.includes('articulo')) {
                    return 'contenido';
                }
                return 'general';
            };

            // Función para generar contenido del contrato según el tipo de servicio
            const generateContractContent = (serviceType: string, contract: Contract): string => {
                const clientName = contract.client.name;
                const company = contract.client.company || 'Cliente';
                const serviceName = contract.title;
                const value = contract.contract_value;
                const currency = contract.currency || 'EUR';
                const startDate = new Date(contract.start_date).toLocaleDateString('es-ES');
                const endDate = new Date(contract.end_date).toLocaleDateString('es-ES');
                const paymentTerms = contract.payment_terms || 'Según acuerdo';

                const templates = {
                    desarrollo: `Por el presente contrato, el FREELANCER se compromete a desarrollar y entregar los servicios de desarrollo de software especificados como "${serviceName}" para el CLIENTE.

OBJETO DEL CONTRATO: El FREELANCER prestará servicios profesionales de desarrollo de software, programación y/o desarrollo web, incluyendo pero no limitándose a: análisis de requerimientos, diseño técnico, codificación, testing, documentación y soporte técnico inicial.

OBLIGACIONES DEL FREELANCER:
- Desarrollar el software/aplicación según las especificaciones acordadas
- Entregar el código fuente limpio y documentado
- Realizar las pruebas necesarias para garantizar el correcto funcionamiento
- Proporcionar documentación técnica y de usuario
- Ofrecer soporte técnico durante los primeros 30 días posteriores a la entrega
- Mantener la confidencialidad de la información del proyecto

OBLIGACIONES DEL CLIENTE:
- Proporcionar toda la información y recursos necesarios para el desarrollo
- Revisar y aprobar los entregables en los plazos establecidos
- Realizar los pagos según los términos acordados
- Proporcionar feedback constructivo durante el proceso de desarrollo

PROPIEDAD INTELECTUAL: Una vez completado el pago total, todos los derechos de propiedad intelectual del trabajo desarrollado específicamente para este proyecto serán transferidos al CLIENTE. El FREELANCER conserva los derechos sobre metodologías, frameworks y conocimientos generales utilizados.

GARANTÍA: El FREELANCER garantiza que el trabajo entregado estará libre de defectos de programación y funcionará según las especificaciones durante un período de 90 días posteriores a la entrega final.`,

                    diseno: `Por el presente contrato, el FREELANCER se compromete a crear y entregar los servicios de diseño especificados como "${serviceName}" para el CLIENTE.

OBJETO DEL CONTRATO: El FREELANCER prestará servicios profesionales de diseño gráfico, incluyendo pero no limitándose a: conceptualización, diseño, desarrollo de propuestas visuales, revisiones y entrega de archivos finales en los formatos requeridos.

OBLIGACIONES DEL FREELANCER:
- Crear diseños originales según el brief y especificaciones del cliente
- Presentar propuestas iniciales y realizar hasta 3 rondas de revisiones incluidas
- Entregar archivos finales en formatos vectoriales y rasterizados según se requiera
- Mantener la coherencia con la identidad visual del cliente (si aplica)
- Cumplir con los plazos de entrega establecidos
- Garantizar la originalidad del trabajo y respeto a derechos de autor

OBLIGACIONES DEL CLIENTE:
- Proporcionar un brief detallado con objetivos, público objetivo y preferencias
- Suministrar materiales de referencia, logos, imágenes o contenido necesario
- Revisar y aprobar diseños en los plazos acordados
- Realizar los pagos según los términos establecidos
- Especificar claramente los formatos de entrega requeridos

PROPIEDAD INTELECTUAL: Los derechos de uso comercial del diseño final serán transferidos al CLIENTE una vez completado el pago. El FREELANCER conserva el derecho a utilizar el trabajo en su portafolio profesional.

REVISIONES: Se incluyen hasta 3 rondas de revisiones. Cambios adicionales que modifiquen sustancialmente el concepto original podrán generar costos adicionales.`,

                    marketing: `Por el presente contrato, el FREELANCER se compromete a ejecutar y entregar los servicios de marketing digital especificados como "${serviceName}" para el CLIENTE.

OBJETO DEL CONTRATO: El FREELANCER prestará servicios profesionales de marketing digital, incluyendo pero no limitándose a: estrategia de marketing, gestión de campañas, análisis de mercado, optimización SEO, gestión de redes sociales y reporting de resultados.

OBLIGACIONES DEL FREELANCER:
- Desarrollar estrategias de marketing alineadas con los objetivos del cliente
- Ejecutar campañas publicitarias en las plataformas acordadas
- Realizar análisis y seguimiento de métricas de rendimiento
- Proporcionar reportes mensuales con resultados y recomendaciones
- Mantener actualizado el conocimiento de las mejores prácticas del sector
- Optimizar continuamente las campañas para mejorar el ROI

OBLIGACIONES DEL CLIENTE:
- Proporcionar acceso a las cuentas y plataformas necesarias
- Suministrar materiales de marca, productos y contenido relevante
- Aprobar estrategias y campañas antes de su implementación
- Proporcionar presupuesto publicitario adicional cuando sea requerido
- Realizar los pagos según los términos establecidos

MÉTRICAS Y OBJETIVOS: Se establecerán KPIs específicos al inicio del proyecto. Los resultados pueden variar según factores externos del mercado, competencia y cambios en algoritmos de plataformas.

CONFIDENCIALIDAD: Toda información comercial, estratégica y de audiencia será tratada de forma estrictamente confidencial.`,

                    consultoria: `Por el presente contrato, el FREELANCER se compromete a proporcionar servicios de consultoría profesional especificados como "${serviceName}" para el CLIENTE.

OBJETO DEL CONTRATO: El FREELANCER prestará servicios de consultoría especializada, incluyendo pero no limitándose a: análisis situacional, desarrollo de estrategias, recomendaciones profesionales, implementación de mejoras y seguimiento de resultados.

OBLIGACIONES DEL FREELANCER:
- Realizar un diagnóstico completo de la situación actual
- Desarrollar recomendaciones estratégicas basadas en mejores prácticas
- Proporcionar un plan de implementación detallado y factible
- Ofrecer sesiones de asesoramiento y seguimiento según acordado
- Entregar informes y documentación profesional
- Mantener absoluta confidencialidad sobre información empresarial

OBLIGACIONES DEL CLIENTE:
- Proporcionar acceso completo a información relevante del negocio
- Facilitar reuniones con personal clave cuando sea necesario
- Implementar las recomendaciones según el plan acordado
- Proporcionar feedback sobre la efectividad de las soluciones
- Realizar los pagos según los términos establecidos

ALCANCE DE RESPONSABILIDAD: La consultoría se basa en la información proporcionada por el cliente. Los resultados finales dependerán de la correcta implementación de las recomendaciones por parte del cliente.

CONFIDENCIALIDAD: Toda información comercial, financiera y estratégica será tratada con la máxima confidencialidad y no será divulgada a terceros.`,

                    contenido: `Por el presente contrato, el FREELANCER se compromete a crear y entregar contenido especificado como "${serviceName}" para el CLIENTE.

OBJETO DEL CONTRATO: El FREELANCER prestará servicios de creación de contenido, incluyendo pero no limitándose a: redacción, copywriting, creación de artículos, contenido para redes sociales, blogs, newsletters y material promocional.

OBLIGACIONES DEL FREELANCER:
- Crear contenido original, relevante y de calidad según las especificaciones
- Adaptar el tono y estilo a la voz de marca del cliente
- Realizar investigación necesaria para garantizar precisión del contenido
- Entregar contenido libre de errores ortográficos y gramaticales
- Optimizar contenido para SEO cuando sea aplicable
- Cumplir con los plazos de entrega establecidos

OBLIGACIONES DEL CLIENTE:
- Proporcionar brief detallado con objetivos, público objetivo y tono deseado
- Suministrar información técnica o específica necesaria
- Revisar y aprobar contenido en los plazos acordados
- Proporcionar feedback constructivo para revisiones
- Realizar los pagos según los términos establecidos

ORIGINALIDAD: Todo el contenido será original y creado específicamente para el cliente. Se garantiza que no infringe derechos de autor de terceros.

REVISIONES: Se incluyen hasta 2 rondas de revisiones menores. Cambios sustanciales que requieran nueva investigación o reescritura completa podrán generar costos adicionales.`,

                    general: `Por el presente contrato, el FREELANCER se compromete a proporcionar los servicios profesionales especificados como "${serviceName}" para el CLIENTE.

OBJETO DEL CONTRATO: El FREELANCER prestará servicios profesionales especializados según las especificaciones acordadas, manteniendo los más altos estándares de calidad y profesionalismo.

OBLIGACIONES DEL FREELANCER:
- Ejecutar los servicios acordados con profesionalismo y diligencia
- Cumplir con los plazos y especificaciones establecidas
- Mantener comunicación regular sobre el progreso del proyecto
- Entregar trabajos de calidad que cumplan con los objetivos establecidos
- Mantener confidencialidad sobre información del cliente
- Proporcionar soporte y aclaraciones según se requiera

OBLIGACIONES DEL CLIENTE:
- Proporcionar información y recursos necesarios para la ejecución
- Revisar y aprobar entregables en los plazos establecidos
- Mantener comunicación efectiva durante el proyecto
- Realizar los pagos según los términos acordados
- Proporcionar feedback constructivo cuando sea necesario

CALIDAD Y ESTÁNDARES: Todos los servicios se ejecutarán siguiendo las mejores prácticas de la industria y con el máximo profesionalismo.

CONFIDENCIALIDAD: Toda información intercambiada será tratada de forma confidencial y no será divulgada a terceros sin autorización expresa.`
                };

                return templates[serviceType as keyof typeof templates] || templates.general;
            };

            // Header con línea decorativa
            doc.rect(marginLeft, 60, contentWidth, 3)
               .fill(primaryColor);

            doc.fontSize(26)
               .fillColor(primaryColor)
               .font('Helvetica-Bold')
               .text('CONTRATO DE SERVICIOS', marginLeft, 80, {
                   width: contentWidth,
                   align: 'center'
               });

            // Título del contrato con fondo
            doc.rect(marginLeft, 125, contentWidth, 35)
               .fill(lightGrayColor);

            doc.fontSize(16)
               .fillColor(blackColor)
               .font('Helvetica-Bold')
               .text(cleanText(contract.title), marginLeft + 15, 135, {
                   width: contentWidth - 30,
                   align: 'center'
               });

            let currentY = 180;

            // Información del cliente en tabla
            doc.fontSize(14)
               .fillColor(primaryColor)
               .font('Helvetica-Bold')
               .text('INFORMACION DEL CLIENTE', marginLeft, currentY);

            currentY += 25;

            // Crear tabla para información del cliente
            const tableStartY = currentY;
            const rowHeight = 20;
            const col1Width = 120;
            const col2Width = contentWidth - col1Width;

            // Fondo de la tabla
            doc.rect(marginLeft, tableStartY, contentWidth, rowHeight * 4)
               .stroke('#e2e8f0');

            doc.fontSize(10)
               .fillColor(blackColor)
               .font('Helvetica');

            // Fila 1: Cliente
            doc.font('Helvetica-Bold')
               .text('Cliente:', marginLeft + 10, tableStartY + 7)
               .font('Helvetica')
               .text(cleanText(contract.client.name), marginLeft + col1Width + 10, tableStartY + 7);

            // Fila 2: Email
            const emailY = tableStartY + rowHeight;
            doc.font('Helvetica-Bold')
               .text('Email:', marginLeft + 10, emailY + 7)
               .font('Helvetica')
               .text(contract.client.email || 'No especificado', marginLeft + col1Width + 10, emailY + 7);

            // Fila 3: Empresa
            const companyY = tableStartY + rowHeight * 2;
            doc.font('Helvetica-Bold')
               .text('Empresa:', marginLeft + 10, companyY + 7)
               .font('Helvetica')
               .text(cleanText(contract.client.company || 'No especificado'), marginLeft + col1Width + 10, companyY + 7);

            // Fila 4: Fecha de creación
            const dateY = tableStartY + rowHeight * 3;
            doc.font('Helvetica-Bold')
               .text('Fecha creacion:', marginLeft + 10, dateY + 7)
               .font('Helvetica')
               .text(new Date(contract.created_at).toLocaleDateString('es-ES'), marginLeft + col1Width + 10, dateY + 7);

            currentY = tableStartY + rowHeight * 4 + 20;

            // Información del contrato
            doc.fontSize(14)
               .fillColor(primaryColor)
               .font('Helvetica-Bold')
               .text('DETALLES DEL CONTRATO', marginLeft, currentY);

            currentY += 25;

            // Segunda tabla para detalles del contrato
            const contractTableStartY = currentY;
            const contractRows = [
                ['Valor del contrato:', formatCurrency(contract.contract_value, contract.currency)],
                ['Estado:', contract.status.charAt(0).toUpperCase() + contract.status.slice(1)],
                ['Fecha de inicio:', new Date(contract.start_date).toLocaleDateString('es-ES')],
                ['Fecha de finalizacion:', contract.end_date ? new Date(contract.end_date).toLocaleDateString('es-ES') : 'No especificada'],
                ['Terminos de pago:', cleanText(contract.payment_terms || 'No especificados')]
            ];

            const contractTableHeight = rowHeight * contractRows.length;

            // Fondo de la tabla de contrato
            doc.rect(marginLeft, contractTableStartY, contentWidth, contractTableHeight)
               .stroke('#e2e8f0');

            doc.fontSize(10)
               .fillColor(blackColor);

            contractRows.forEach((row, index) => {
                const rowY = contractTableStartY + (index * rowHeight);
                
                doc.font('Helvetica-Bold')
                   .text(row[0], marginLeft + 10, rowY + 7)
                   .font('Helvetica')
                   .text(row[1], marginLeft + col1Width + 10, rowY + 7, {
                       width: col2Width - 20
                   });
            });

            currentY = contractTableStartY + contractTableHeight + 30;

            // Detectar tipo de servicio y generar contenido profesional
            const serviceType = detectServiceType(contract.title, contract.description);
            const professionalContent = generateContractContent(serviceType, contract);

            // Contenido del contrato
            doc.fontSize(14)
               .fillColor(primaryColor)
               .font('Helvetica-Bold')
               .text('TERMINOS Y CONDICIONES DEL CONTRATO', marginLeft, currentY);

            currentY += 25;

            // Procesar el contenido profesional del contrato
            const contractSections = professionalContent.split('\n\n');

            doc.fontSize(10)
               .fillColor(blackColor)
               .font('Helvetica');

            for (const section of contractSections) {
                if (section.trim()) {
                    // Calcular altura necesaria para la sección
                    const textHeight = doc.heightOfString(section, { 
                        width: contentWidth - 20,
                        lineGap: 3
                    });
                    
                    // Verificar si necesitamos una nueva página
                    if (currentY + textHeight + 25 > 720) {
                        doc.addPage();
                        currentY = 50;
                        
                        // Repetir el header en la nueva página
                        doc.fontSize(14)
                           .fillColor(primaryColor)
                           .font('Helvetica-Bold')
                           .text('TERMINOS Y CONDICIONES (continuacion)', marginLeft, currentY);
                        
                        currentY += 30;
                        doc.fontSize(10)
                           .fillColor(blackColor)
                           .font('Helvetica');
                    }

                    // Detectar si es un título de sección (en mayúsculas y seguido de :)
                    const isTitle = section.includes(':') && section.split(':')[0].toUpperCase() === section.split(':')[0];
                    
                    if (isTitle) {
                        doc.fontSize(11)
                           .fillColor(primaryColor)
                           .font('Helvetica-Bold');
                    } else {
                        doc.fontSize(10)
                           .fillColor(blackColor)
                           .font('Helvetica');
                    }

                    // Renderizar la sección
                    doc.text(cleanText(section), marginLeft + 10, currentY, {
                        width: contentWidth - 20,
                        align: 'justify',
                        lineGap: 3
                    });

                    currentY += textHeight + (isTitle ? 15 : 12);
                }
            }

            // Añadir información específica del contrato
            currentY += 20;
            
            // Verificar si necesitamos una nueva página para la información final
            if (currentY + 150 > 720) {
                doc.addPage();
                currentY = 50;
            }

            doc.fontSize(12)
               .fillColor(primaryColor)
               .font('Helvetica-Bold')
               .text('INFORMACION CONTRACTUAL ESPECIFICA', marginLeft, currentY);

            currentY += 20;

            const contractInfo = [
                `VALOR DEL CONTRATO: ${contract.contract_value.toLocaleString('es-ES')} ${contract.currency}`,
                `FECHA DE INICIO: ${new Date(contract.start_date).toLocaleDateString('es-ES')}`,
                `FECHA DE FINALIZACION: ${new Date(contract.end_date).toLocaleDateString('es-ES')}`,
                `TERMINOS DE PAGO: ${contract.payment_terms}`,
                `ESTADO ACTUAL: ${contract.status.toUpperCase()}`
            ];

            doc.fontSize(10)
               .fillColor(blackColor)
               .font('Helvetica');

            contractInfo.forEach(info => {
                doc.text(cleanText(info), marginLeft + 10, currentY, {
                    width: contentWidth - 20
                });
                currentY += 18;
            });

            // Añadir sección de firmas
            currentY += 40;

            // Verificar si necesitamos una nueva página para las firmas
            if (currentY + 150 > 720) {
                doc.addPage();
                currentY = 50;
            }

            doc.fontSize(12)
               .fillColor(primaryColor)
               .font('Helvetica-Bold')
               .text('FIRMAS Y ACEPTACION', marginLeft, currentY);

            currentY += 30;

            // Crear tabla de firmas
            const signatureWidth = (contentWidth - 20) / 2;
            
            // Cliente
            doc.fontSize(10)
               .fillColor(blackColor)
               .font('Helvetica-Bold')
               .text('CLIENTE:', marginLeft, currentY);
            
            doc.font('Helvetica')
               .text(`${contract.client.name}`, marginLeft, currentY + 15);
            
            if (contract.client.company) {
                doc.text(`${contract.client.company}`, marginLeft, currentY + 30);
            }

            // Línea de firma del cliente
            doc.moveTo(marginLeft, currentY + 60)
               .lineTo(marginLeft + signatureWidth - 10, currentY + 60)
               .stroke(grayColor);
               
            doc.fontSize(9)
               .text('Firma del Cliente', marginLeft, currentY + 70);
            
            // Freelancer (lado derecho)
            const freelancerX = marginLeft + signatureWidth + 20;
            
            doc.fontSize(10)
               .fillColor(blackColor)
               .font('Helvetica-Bold')
               .text('FREELANCER:', freelancerX, currentY);
            
            doc.font('Helvetica')
               .text('Servicios Profesionales', freelancerX, currentY + 15);
            
            // Línea de firma del freelancer
            doc.moveTo(freelancerX, currentY + 60)
               .lineTo(freelancerX + signatureWidth - 10, currentY + 60)
               .stroke(grayColor);
               
            doc.fontSize(9)
               .text('Firma del Freelancer', freelancerX, currentY + 70);

            currentY += 100;

            // Fecha de firma
            doc.fontSize(10)
               .fillColor(blackColor)
               .font('Helvetica')
               .text(`Fecha de firma: _________________`, marginLeft, currentY, {
                   width: contentWidth,
                   align: 'center'
               });

            currentY += 30;

            // Espaciado antes del footer
            currentY += 20;

            // Línea de separación antes del footer
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }

            doc.moveTo(marginLeft, currentY)
               .lineTo(marginLeft + contentWidth, currentY)
               .stroke(grayColor);

            currentY += 20;

            // Footer profesional
            doc.fontSize(9)
               .fillColor(grayColor)
               .font('Helvetica')
               .text('Documento generado por Taskelio CRM', marginLeft, currentY, {
                   width: contentWidth,
                   align: 'center'
               });

            currentY += 15;

            doc.fontSize(8)
               .text(`Fecha de generacion: ${new Date().toLocaleDateString('es-ES')} - ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, 
                      marginLeft, currentY, { 
                          width: contentWidth, 
                          align: 'center' 
                      });

            // Finalizar el documento
            doc.end();

            // Cuando el stream termine, crear el blob y descargar
            stream.on('finish', () => {
                const blob = stream.toBlob('application/pdf');
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                
                // Crear nombre de archivo más limpio
                const cleanTitle = contract.title
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .replace(/\s+/g, '-')
                    .toLowerCase();
                
                a.href = url;
                a.download = `contrato-${cleanTitle}-${contract.id.substring(0, 8)}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                showToast.success('PDF generado correctamente');
            });

        } catch (error) {
            console.error('Error downloading PDF:', error);
            showToast.error('Error al generar el PDF');
        }
    };

    const handleSendContract = async () => {
        if (!contract || !canUseFeatures) return;

        try {
            console.log('🚀 Enviando contrato por email:', contract.id);

            // Llamar a la API para enviar el email
            const response = await fetch('/api/contracts/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractId: contract.id }),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('Error response from API:', result);
                showToast.error(result.error || 'Error al enviar el contrato');
                return;
            }

            // Actualizar el estado local
            setContract({
                ...contract,
                status: 'sent',
                sent_at: new Date().toISOString()
            });

            showToast.success('✅ Contrato enviado por email correctamente');
            console.log('📧 Email enviado exitosamente:', result.emailId);
            
        } catch (error) {
            console.error('Error sending contract email:', error);
            showToast.error('Error al enviar el contrato por email');
        }
    };

    const handleLogout = async () => {
        const supabase = createSupabaseClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar userEmail={userEmail} onLogout={handleLogout} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar userEmail={userEmail} onLogout={handleLogout} />
                <div className="flex-1 flex items-center justify-center ml-56">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Contrato no encontrado
                        </h2>
                        <Button onClick={() => router.push('/dashboard/contracts')}>
                            Volver a Contratos
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <div className="flex-1 flex flex-col overflow-hidden ml-56">
                <TrialBanner />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    <div className="h-full px-6 py-8">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push('/dashboard/contracts')}
                                        className="mr-4"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Volver
                                    </Button>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {contract.title}
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                                            Contrato con {contract.client.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(contract.status)}
                                    <Button
                                        variant="outline"
                                        onClick={handleDownloadPDF}
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Descargar PDF
                                    </Button>
                                    {contract.status === 'draft' && (
                                        <Button
                                            onClick={handleSendContract}
                                            disabled={!canUseFeatures}
                                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            <Mail className="w-4 h-4" />
                                            Enviar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Contract Content */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Contenido del Contrato
                                        </h2>
                                    </div>
                                    <div className="p-8">
                                        <div
                                            className="prose prose-lg max-w-none dark:prose-invert"
                                            style={{
                                                fontFamily: '"Times New Roman", serif',
                                                fontSize: '16px',
                                                lineHeight: '1.8',
                                                color: '#1a1a1a'
                                            }}
                                        >
                                            <div dangerouslySetInnerHTML={{
                                                __html: contract.contract_content
                                                    .replace(/\n/g, '<br>')
                                                    .replace(/PRIMERA\.-/g, '<strong>PRIMERA.-</strong>')
                                                    .replace(/SEGUNDA\.-/g, '<strong>SEGUNDA.-</strong>')
                                                    .replace(/TERCERA\.-/g, '<strong>TERCERA.-</strong>')
                                                    .replace(/CUARTA\.-/g, '<strong>CUARTA.-</strong>')
                                                    .replace(/QUINTA\.-/g, '<strong>QUINTA.-</strong>')
                                                    .replace(/SEXTA\.-/g, '<strong>SEXTA.-</strong>')
                                                    .replace(/SÉPTIMA\.-/g, '<strong>SÉPTIMA.-</strong>')
                                                    .replace(/OCTAVA\.-/g, '<strong>OCTAVA.-</strong>')
                                                    .replace(/CONTRATO DE (.*?)\n/g, '<h2 style="text-align: center; font-size: 20px; margin-bottom: 30px; text-decoration: underline;">CONTRATO DE $1</h2>')
                                                    .replace(/Entre (.*?) y (.*?), se (.*?):/g, '<p style="text-align: justify; margin-bottom: 20px;">Entre <strong>$1</strong> y <strong>$2</strong>, se $3:</p>')
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contract Details */}
                            <div className="space-y-6">
                                {/* Client Info */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Información del Cliente
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Nombre
                                            </label>
                                            <p className="text-gray-900 dark:text-white">
                                                {contract.client.name}
                                            </p>
                                        </div>
                                        {contract.client.company && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Empresa
                                                </label>
                                                <p className="text-gray-900 dark:text-white">
                                                    {contract.client.company}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Email
                                            </label>
                                            <p className="text-gray-900 dark:text-white">
                                                {contract.client.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contract Details */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Detalles del Contrato
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Valor
                                            </label>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(contract.contract_value, contract.currency)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Fecha de Inicio
                                            </label>
                                            <p className="text-gray-900 dark:text-white">
                                                {new Date(contract.start_date).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Fecha de Finalización
                                            </label>
                                            <p className="text-gray-900 dark:text-white">
                                                {new Date(contract.end_date).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                        {contract.payment_terms && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Términos de Pago
                                                </label>
                                                <p className="text-gray-900 dark:text-white whitespace-pre-line">
                                                    {contract.payment_terms}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Creado
                                            </label>
                                            <p className="text-gray-900 dark:text-white">
                                                {new Date(contract.created_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Acciones
                                    </h3>
                                    <div className="space-y-3">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => router.push(`/dashboard/contracts/${contractId}/edit`)}
                                            disabled={!canUseFeatures}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Editar Contrato
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                showToast.success('Enlace copiado');
                                            }}
                                        >
                                            <Share2 className="w-4 h-4 mr-2" />
                                            Compartir Enlace
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
