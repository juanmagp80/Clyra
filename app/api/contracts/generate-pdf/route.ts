import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { jsPDF } from 'jspdf';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { contractId } = await request.json();

        if (!contractId) {
            return NextResponse.json(
                { error: 'ID del contrato requerido' },
                { status: 400 }
            );
        }

        const supabase = await createSupabaseServerClient();

        // Obtener usuario autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('❌ Error de autenticación:', authError);
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        // Obtener perfil del usuario
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('❌ Error obteniendo perfil:', profileError);
            return NextResponse.json(
                { error: 'Error obteniendo perfil del usuario' },
                { status: 500 }
            );
        }

        // Obtener datos de la empresa del usuario usando user_id
        let companyData = null;
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('name, email, phone, address, tax_id')
            .eq('user_id', user.id)
            .single();

        if (!companyError && company) {
            companyData = company;
            console.log('🏢 Datos de empresa obtenidos:', company);
        } else {
            console.log('⚠️ No se encontró empresa para user_id:', user.id);
        }

        // Obtener contrato con información del cliente
        // Consulta del contrato
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .select('*')
            .eq('id', contractId)
            .single();

        if (contractError || !contract) {
            console.error('❌ Error obteniendo contrato:', contractError);
            return NextResponse.json(
                { error: 'Contrato no encontrado' },
                { status: 404 }
            );
        }

        // Consulta separada del cliente para asegurar datos frescos
        const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('id, name, address, email, company, phone, nif')
            .eq('id', contract.client_id)
            .single();

        if (clientError || !clientData) {
            console.error('❌ Error obteniendo cliente:', clientError);
            return NextResponse.json(
                { error: 'Cliente no encontrado' },
                { status: 404 }
            );
        }

        // Combinar los datos
        contract.clients = clientData;



        console.log('📄 Generando PDF del contrato...');
        const pdfBuffer = await generateContractPDF(contract, profile, companyData);
        console.log('✅ PDF generado correctamente, tamaño:', pdfBuffer.length, 'bytes');

        // Devolver el PDF como respuesta
        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="contrato-${contract.title.replace(/[^a-zA-Z0-9]/g, '-')}-${contract.id.substring(0, 8)}.pdf"`
            }
        });

    } catch (error) {
        console.error('❌ Error en generate-pdf:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

// Función unificada para generar PDF del contrato
async function generateContractPDF(contract: any, profile: any, companyData: any = null): Promise<Buffer> {
    try {
        // Crear documento PDF con jsPDF
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Configuración
        const marginLeft = 15;
        const marginTop = 20;
        const pageWidth = 210; // A4 width in mm
        const contentWidth = pageWidth - (marginLeft * 2);

        // Función para limpiar texto - Solo ASCII básico
        const cleanText = (text: string) => {
            if (!text) return '';
            
            return text
                // Reemplazos específicos de caracteres acentuados problemáticos
                .replace(/[áàäâāăą]/g, 'a').replace(/[ÁÀÄÂĀĂĄ]/g, 'A')
                .replace(/[éèëêēėę]/g, 'e').replace(/[ÉÈËÊĒĖĘ]/g, 'E')
                .replace(/[íìïîīį]/g, 'i').replace(/[ÍÌÏÎĪĮ]/g, 'I')
                .replace(/[óòöôōőø]/g, 'o').replace(/[ÓÒÖÔŌŐØ]/g, 'O')
                .replace(/[úùüûūų]/g, 'u').replace(/[ÚÙÜÛŪŲ]/g, 'U')
                .replace(/[çć]/g, 'c').replace(/[ÇĆ]/g, 'C')
                .replace(/ß/g, 'ss')
                
                // Mantener ñ y caracteres básicos españoles + ASCII + saltos de línea
                .replace(/[^\x20-\x7EñÑ\n\r]/g, '') // ASCII + ñ + saltos de línea
                
                // Limpiar caracteres especiales restantes
                .replace(/"/g, "'")
                .replace(/[{}]/g, "")
                .trim();
        }; let currentY = marginTop;

        // Header principal con líneas decorativas
        doc.setFillColor(37, 99, 235);
        doc.rect(marginLeft, currentY, contentWidth, 1, 'F');
        currentY += 8;

        doc.setFontSize(18);
        doc.setTextColor(37, 99, 235);
        const title = 'CONTRATO DE SERVICIOS PROFESIONALES';
        const titleWidth = doc.getTextWidth(title);
        const titleX = (pageWidth - titleWidth) / 2;
        doc.text(title, titleX, currentY);
        currentY += 6;

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        const subtitle = 'DOCUMENTO OFICIAL';
        const subtitleWidth = doc.getTextWidth(subtitle);
        const subtitleX = (pageWidth - subtitleWidth) / 2;
        doc.text(subtitle, subtitleX, currentY);
        currentY += 5;

        // Número de contrato
        doc.setFontSize(11);
        const contractNumber = `Número de Contrato: CONT-2025-${contract.id?.substring(0, 4) || '0000'}`;
        const contractNumberWidth = doc.getTextWidth(contractNumber);
        const contractNumberX = (pageWidth - contractNumberWidth) / 2;
        doc.text(contractNumber, contractNumberX, currentY);
        currentY += 10;

        // Línea separadora
        doc.setFillColor(37, 99, 235);
        doc.rect(marginLeft, currentY, contentWidth, 1, 'F');
        currentY += 15;

        // Lugar y fecha
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const place = `📍 LUGAR Y FECHA: Madrid, ${new Date().toLocaleDateString('es-ES')}`;
        doc.text(place, marginLeft, currentY);
        currentY += 15;

        // Línea separadora doble
        for (let i = 0; i < 2; i++) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(marginLeft, currentY + (i * 2), pageWidth - marginLeft, currentY + (i * 2));
        }
        currentY += 10;

        // Título sección partes
        doc.setFontSize(13);
        doc.setTextColor(37, 99, 235);
        const partesTitle = 'PARTES CONTRATANTES';
        const partesTitleWidth = doc.getTextWidth(partesTitle);
        const partesTitleX = (pageWidth - partesTitleWidth) / 2;
        doc.text(partesTitle, partesTitleX, currentY);
        currentY += 10;

        // Línea separadora doble
        for (let i = 0; i < 2; i++) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(marginLeft, currentY + (i * 2), pageWidth - marginLeft, currentY + (i * 2));
        }
        currentY += 10;

        // Prestador de servicios (datos de la empresa)
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(cleanText('EL CONSULTOR/PRESTADOR DE SERVICIOS:'), marginLeft, currentY);
        currentY += 6;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);

        // Usar datos de la empresa si están disponibles
        const freelancerName = companyData?.name || profile?.full_name || 'Prestador del Servicio';
        doc.text(`Nombre: ${cleanText(freelancerName)}`, marginLeft, currentY);
        currentY += 5;

        if (companyData?.tax_id || profile?.document_number) {
            doc.text(`DNI/NIF: ${companyData?.tax_id || profile?.document_number}`, marginLeft, currentY);
            currentY += 5;
        }

        if (companyData?.address || profile?.address) {
            doc.text(cleanText(`Direccion: ${companyData?.address || profile?.address}`), marginLeft, currentY);
            currentY += 5;
        }

        if (companyData?.email || profile?.email) {
            doc.text(`Email: ${cleanText(companyData?.email || profile?.email || '')}`, marginLeft, currentY);
            currentY += 5;
        }
        currentY += 8;

        // Cliente
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(cleanText('EL CLIENTE/CONTRATANTE:'), marginLeft, currentY);
        currentY += 6;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        if (contract.clients?.name) {
            doc.text(cleanText(`Nombre/Razon Social: ${contract.clients.name}`), marginLeft, currentY);
            currentY += 5;
        }
        if (contract.clients?.company) {
            doc.text(`Empresa: ${cleanText(contract.clients.company)}`, marginLeft, currentY);
            currentY += 5;
        }
        if (contract.clients?.address) {
            doc.text(cleanText(`Direccion: ${contract.clients.address || 'No especificada'}`), marginLeft, currentY);
            currentY += 5;
        }
        if (contract.clients?.email) {
            doc.text(`Email: ${contract.clients.email}`, marginLeft, currentY);
            currentY += 5;
        }
        if (contract.clients?.phone) {
            doc.text(cleanText(`Telefono: ${contract.clients.phone}`), marginLeft, currentY);
            currentY += 5;
        }
        currentY += 15;

        // Línea separadora doble
        for (let i = 0; i < 2; i++) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(marginLeft, currentY + (i * 2), pageWidth - marginLeft, currentY + (i * 2));
        }
        currentY += 10;

        // Título sección detalles
        doc.setFontSize(13);
        doc.setTextColor(37, 99, 235);
        const detallesTitle = 'DETALLES DEL CONTRATO';
        const detallesTitleWidth = doc.getTextWidth(detallesTitle);
        const detallesTitleX = (pageWidth - detallesTitleWidth) / 2;
        doc.text(detallesTitle, detallesTitleX, currentY);
        currentY += 10;

        // Línea separadora doble
        for (let i = 0; i < 2; i++) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(marginLeft, currentY + (i * 2), pageWidth - marginLeft, currentY + (i * 2));
        }
        currentY += 10;

        // Detalles del contrato
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(cleanText(`TITULO DEL PROYECTO: ${contract.title}`), marginLeft, currentY);
        currentY += 8;

        if (contract.contract_value) {
            doc.text(cleanText(`VALOR DEL CONTRATO: ${contract.contract_value} ${contract.currency || 'EUR'}`), marginLeft, currentY);
            currentY += 8;
        }

        doc.text(cleanText('PERIODO DE VIGENCIA:'), marginLeft, currentY);
        currentY += 5;
        if (contract.start_date) {
            doc.text(cleanText(`* Fecha de Inicio: ${new Date(contract.start_date).toLocaleDateString('es-ES')}`), marginLeft + 5, currentY);
            currentY += 5;
        }
        if (contract.end_date) {
            doc.text(cleanText(`* Fecha de Finalizacion: ${new Date(contract.end_date).toLocaleDateString('es-ES')}`), marginLeft + 5, currentY);
            currentY += 5;
        }

        if (contract.payment_terms) {
            doc.text(cleanText(`CONDICIONES DE PAGO: ${contract.payment_terms}`), marginLeft, currentY);
            currentY += 8;
        }

        // Línea separadora doble
        for (let i = 0; i < 2; i++) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(marginLeft, currentY + (i * 2), pageWidth - marginLeft, currentY + (i * 2));
        }
        currentY += 10;

        // Título sección contenido
        doc.setFontSize(13);
        doc.setTextColor(37, 99, 235);
        const contenidoTitle = 'CONTENIDO DEL CONTRATO';
        const contenidoTitleWidth = doc.getTextWidth(contenidoTitle);
        const contenidoTitleX = (pageWidth - contenidoTitleWidth) / 2;
        doc.text(contenidoTitle, contenidoTitleX, currentY);
        currentY += 10;

        // Línea separadora doble
        for (let i = 0; i < 2; i++) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(marginLeft, currentY + (i * 2), pageWidth - marginLeft, currentY + (i * 2));
        }
        currentY += 10;

        // Generar contenido detallado del contrato
        const contractContent = generateDetailedContractContent(contract, companyData, profile);

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        // Limpiar el contenido completo y dividir en líneas
        const cleanedContent = cleanText(contractContent);
        const lines = doc.splitTextToSize(cleanedContent, contentWidth);

        for (const line of lines) {
            if (currentY > 260) { // Nueva página si es necesario
                doc.addPage();
                currentY = marginTop;
            }
            doc.text(line, marginLeft, currentY);
            currentY += 4;
        }

        // Línea separadora doble antes de firmas
        currentY += 10;
        for (let i = 0; i < 2; i++) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(marginLeft, currentY + (i * 2), pageWidth - marginLeft, currentY + (i * 2));
        }
        currentY += 10;

        // Título sección firmas
        doc.setFontSize(13);
        doc.setTextColor(37, 99, 235);
        const firmasTitle = 'FIRMAS';
        const firmasTitleWidth = doc.getTextWidth(firmasTitle);
        const firmasTitleX = (pageWidth - firmasTitleWidth) / 2;
        doc.text(firmasTitle, firmasTitleX, currentY);
        currentY += 10;

        // Línea separadora doble
        for (let i = 0; i < 2; i++) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(marginLeft, currentY + (i * 2), pageWidth - marginLeft, currentY + (i * 2));
        }
        currentY += 15;

        if (currentY > 240) {
            doc.addPage();
            currentY = marginTop;
        }

        // Firmas
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('EL CONSULTOR:', marginLeft + 20, currentY);
        doc.text('EL CLIENTE:', marginLeft + 110, currentY);
        currentY += 20;

        doc.text('_____________________________', marginLeft, currentY);
        doc.text('_____________________________', marginLeft + 90, currentY);
        currentY += 8;

        doc.text(cleanText(freelancerName), marginLeft + 5, currentY);
        doc.text(cleanText(contract.clients?.name || 'Cliente'), marginLeft + 95, currentY);
        currentY += 5;

        doc.setFontSize(9);
        doc.text(`DNI: ${companyData?.tax_id || '[DNI]'}`, marginLeft + 5, currentY);
        doc.text(`DNI/CIF: ${contract.clients?.nif || '[DNI/CIF del Cliente]'}`, marginLeft + 95, currentY);
        currentY += 15;

        doc.text('Fecha: _______________', marginLeft + 5, currentY);
        doc.text('Fecha: _______________', marginLeft + 95, currentY);
        currentY += 20;

        // Información adicional final
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);

        // Línea separadora final
        for (let i = 0; i < 2; i++) {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(marginLeft, currentY + (i * 2), pageWidth - marginLeft, currentY + (i * 2));
        }
        currentY += 10;

        const infoTitle = 'INFORMACIÓN ADICIONAL';
        const infoTitleWidth = doc.getTextWidth(infoTitle);
        const infoTitleX = (pageWidth - infoTitleWidth) / 2;
        doc.text(infoTitle, infoTitleX, currentY);
        currentY += 8;

        doc.text(cleanText(`Este contrato ha sido generado mediante el sistema Taskelio`), marginLeft, currentY);
        currentY += 4;
        doc.text(cleanText(`Numero de referencia: CONT-2025-${contract.id?.substring(0, 4)}`), marginLeft, currentY);
        currentY += 4;
        doc.text(cleanText(`Fecha de generacion: ${new Date().toLocaleDateString('es-ES')}`), marginLeft, currentY);
        currentY += 4;
        doc.text(cleanText(`Jurisdiccion aplicable: Madrid, Espana`), marginLeft, currentY);
        currentY += 8;

        // Línea separadora final
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.3);
        doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
        currentY += 5;

        doc.text(cleanText(`(c) 2025 - Documento Oficial Taskelio`), marginLeft, currentY);
        doc.text(`Todos los derechos reservados`, pageWidth - marginLeft - 50, currentY);

        // Convertir a buffer
        const pdfArrayBuffer = doc.output('arraybuffer');
        return Buffer.from(pdfArrayBuffer);

    } catch (error) {
        console.error('Error generando PDF con jsPDF:', error);
        throw new Error(`Error generando PDF: ${error}`);
    }
}

// Función para generar contenido detallado del contrato según el tipo de servicio
function generateDetailedContractContent(contract: any, companyData: any, profile: any): string {
    const companyName = companyData?.name || profile?.full_name || 'INSTELCA S.L.U';
    const clientName = contract.clients?.name || 'Cliente';
    const dniProvider = companyData?.tax_id || '[DNI/NIF de la Empresa]';
    const addressProvider = companyData?.address || '[Dirección de la Empresa]';
    const addressClient = contract.clients?.address || '[Dirección del Cliente]';
    const dniClient = contract.clients?.nif || '[DNI/NIF del Cliente]';

    // Debug: mostrar solo si el NIF está faltante
    if (!contract.clients?.nif) {
        console.log('⚠️  NIF del cliente está faltante:', contract.clients?.name);
        console.log('📋 Cliente completo:', JSON.stringify(contract.clients, null, 2));
    }

    // Detectar el tipo de servicio del contrato
    const serviceType = contract.service_type?.toLowerCase() || detectServiceType(contract.title, contract.description || '');

    console.log('🔍 Tipo de servicio detectado:', serviceType, 'para contrato:', contract.title);

    const templates = {
        desarrollo: generateDesarrolloContent(contract, companyName, clientName, addressProvider, addressClient, dniProvider, dniClient),
        consultoria: generateConsultoriaContent(contract, companyName, clientName, addressProvider, addressClient, dniProvider, dniClient),
        marketing: generateMarketingContent(contract, companyName, clientName, addressProvider, addressClient, dniProvider, dniClient),
        diseno: generateDisenoContent(contract, companyName, clientName, addressProvider, addressClient, dniProvider, dniClient),
        contenido: generateContenidoContent(contract, companyName, clientName, addressProvider, addressClient, dniProvider, dniClient),
        general: generateGeneralContent(contract, companyName, clientName, addressProvider, addressClient, dniProvider, dniClient)
    };

    return templates[serviceType as keyof typeof templates] || templates.general;
}

// Función para detectar el tipo de servicio basado en título y descripción
function detectServiceType(title: string, description: string): string {
    const text = (title + ' ' + description).toLowerCase();

    if (text.includes('desarrollo') || text.includes('programacion') || text.includes('software') || text.includes('web') || text.includes('app')) {
        return 'desarrollo';
    }
    if (text.includes('consultoria') || text.includes('asesoria') || text.includes('consultor') || text.includes('estrategia')) {
        return 'consultoria';
    }
    if (text.includes('marketing') || text.includes('publicidad') || text.includes('seo') || text.includes('social') || text.includes('campana')) {
        return 'marketing';
    }
    if (text.includes('diseno') || text.includes('diseño') || text.includes('grafico') || text.includes('logo') || text.includes('branding')) {
        return 'diseno';
    }
    if (text.includes('contenido') || text.includes('redaccion') || text.includes('copywriting') || text.includes('blog') || text.includes('articulo')) {
        return 'contenido';
    }
    return 'general';
}

// Template para servicios de desarrollo
function generateDesarrolloContent(contract: any, companyName: string, clientName: string, addressProvider: string, addressClient: string, dniProvider: string, dniClient: string): string {
    return `
CONTRATO DE PRESTACIÓN DE SERVICIOS DE DESARROLLO WEB

Entre ${companyName}, con DNI ${dniProvider}, domiciliado en ${addressProvider} (en adelante, "EL PRESTADOR"), y ${clientName}, con DNI ${dniClient}, domiciliado en ${addressClient} (en adelante, "EL CLIENTE"), se acuerda:

PRIMERA.- OBJETO DEL CONTRATO
EL PRESTADOR se compromete a desarrollar y entregar al CLIENTE el siguiente proyecto:
- Nombre del proyecto: ${contract.title}
- Descripción: ${contract.description || 'Desarrollo de software personalizado'}
- Tecnologías a utilizar: ${contract.technologies || 'Tecnologías modernas'}
- Funcionalidades principales: ${contract.features || 'Según especificaciones'}

SEGUNDA.- PLAZO DE EJECUCIÓN
El proyecto se ejecutará desde ${contract.start_date ? new Date(contract.start_date).toLocaleDateString('es-ES') : '[Fecha inicio]'} hasta ${contract.end_date ? new Date(contract.end_date).toLocaleDateString('es-ES') : '[Fecha fin]'}.

TERCERA.- PRECIO Y FORMA DE PAGO
El precio total del proyecto es de ${contract.contract_value || '0'} ${contract.currency || 'EUR'}.
Forma de pago: ${contract.payment_terms || 'Según acuerdo'}

CUARTA.- ENTREGABLES
- Código fuente completo y documentado
- Documentación técnica
- Manual de usuario
- ${contract.deliverables || 'Entregables adicionales según especificaciones'}

QUINTA.- PROPIEDAD INTELECTUAL
Una vez completado el pago, todos los derechos de propiedad intelectual del trabajo específico quedarán transferidos al CLIENTE.

SEXTA.- GARANTÍA Y SOPORTE
EL PRESTADOR garantiza el correcto funcionamiento del software y proporcionará soporte técnico durante 30 días posteriores a la entrega.

En Madrid, a ${new Date().toLocaleDateString('es-ES')}

EL CONSULTOR:                     EL CLIENTE:
_____________________________     _____________________________
${companyName}                    ${clientName}
DNI: ${dniProvider}               DNI/CIF: ${dniClient}
    `;
}

// Template para servicios de consultoría
function generateConsultoriaContent(contract: any, companyName: string, clientName: string, addressProvider: string, addressClient: string, dniProvider: string, dniClient: string): string {
    return `
CONTRATO DE PRESTACIÓN DE SERVICIOS DE CONSULTORÍA

Entre ${companyName}, con DNI ${dniProvider}, domiciliado en ${addressProvider} (en adelante, "EL CONSULTOR"), y ${clientName}, con DNI ${dniClient}, domiciliado en ${addressClient} (en adelante, "EL CLIENTE"), se acuerda:

PRIMERA.- OBJETO DEL CONTRATO
EL CONSULTOR se compromete a proporcionar servicios de consultoría profesional:
- Área de consultoría: ${contract.title}
- Descripción de servicios: ${contract.description || 'Servicios de consultoría especializada'}
- Metodología: ${contract.methodology || 'Metodología profesional adaptada'}
- Alcance: ${contract.scope || 'Según especificaciones acordadas'}

SEGUNDA.- PLAZO DE EJECUCIÓN
Los servicios se prestarán desde ${contract.start_date ? new Date(contract.start_date).toLocaleDateString('es-ES') : '[Fecha inicio]'} hasta ${contract.end_date ? new Date(contract.end_date).toLocaleDateString('es-ES') : '[Fecha fin]'}.

TERCERA.- PRECIO Y FORMA DE PAGO
El precio total de los servicios es de ${contract.contract_value || '0'} ${contract.currency || 'EUR'}.
Forma de pago: ${contract.payment_terms || 'Según acuerdo'}

CUARTA.- ENTREGABLES
- Análisis y diagnóstico de la situación actual
- Recomendaciones estratégicas documentadas
- Plan de implementación detallado
- ${contract.deliverables || 'Informes y documentación según alcance'}

QUINTA.- CONFIDENCIALIDAD
EL CONSULTOR se compromete a mantener absoluta confidencialidad sobre toda información empresarial a la que tenga acceso.

SEXTA.- RESPONSABILIDAD
La responsabilidad del consultor se limita al asesoramiento profesional. Los resultados dependerán de la implementación por parte del CLIENTE.

En Madrid, a ${new Date().toLocaleDateString('es-ES')}

EL CONSULTOR:                     EL CLIENTE:
_____________________________     _____________________________
${companyName}                    ${clientName}
DNI: ${dniProvider}               DNI/CIF: ${dniClient}
    `;
}

// Template para servicios de marketing
function generateMarketingContent(contract: any, companyName: string, clientName: string, addressProvider: string, addressClient: string, dniProvider: string, dniClient: string): string {
    return `
CONTRATO DE PRESTACIÓN DE SERVICIOS DE MARKETING DIGITAL

Entre ${companyName}, con DNI ${dniProvider}, domiciliado en ${addressProvider} (en adelante, "EL PRESTADOR"), y ${clientName}, con DNI ${dniClient}, domiciliado en ${addressClient} (en adelante, "EL CLIENTE"), se acuerda:

PRIMERA.- OBJETO DEL CONTRATO
EL PRESTADOR se compromete a ejecutar servicios de marketing digital:
- Servicio principal: ${contract.title}
- Descripción: ${contract.description || 'Servicios de marketing digital integral'}
- Canales: ${contract.channels || 'Plataformas digitales relevantes'}
- Objetivos: ${contract.objectives || 'Según KPIs acordados'}

SEGUNDA.- PLAZO DE EJECUCIÓN
Los servicios se ejecutarán desde ${contract.start_date ? new Date(contract.start_date).toLocaleDateString('es-ES') : '[Fecha inicio]'} hasta ${contract.end_date ? new Date(contract.end_date).toLocaleDateString('es-ES') : '[Fecha fin]'}.

TERCERA.- PRECIO Y FORMA DE PAGO
El precio total de los servicios es de ${contract.contract_value || '0'} ${contract.currency || 'EUR'}.
Forma de pago: ${contract.payment_terms || 'Según acuerdo'}

CUARTA.- ENTREGABLES
- Estrategia de marketing documentada
- Gestión de campañas publicitarias
- Reportes mensuales de resultados
- ${contract.deliverables || 'Entregables según estrategia acordada'}

QUINTA.- PRESUPUESTO PUBLICITARIO
Los costos de publicidad (ad spend) son adicionales al precio del servicio y serán gestionados por el CLIENTE.

SEXTA.- MÉTRICAS Y RESULTADOS
Los resultados pueden variar según factores del mercado. Se establecerán KPIs realistas al inicio del proyecto.

En Madrid, a ${new Date().toLocaleDateString('es-ES')}

EL CONSULTOR:                     EL CLIENTE:
_____________________________     _____________________________
${companyName}                    ${clientName}
DNI: ${dniProvider}               DNI/CIF: ${dniClient}
    `;
}

// Template para servicios de diseño
function generateDisenoContent(contract: any, companyName: string, clientName: string, addressProvider: string, addressClient: string, dniProvider: string, dniClient: string): string {
    return `
CONTRATO DE PRESTACIÓN DE SERVICIOS DE DISEÑO

Entre ${companyName}, con DNI ${dniProvider}, domiciliado en ${addressProvider} (en adelante, "EL DISEÑADOR"), y ${clientName}, con DNI ${dniClient}, domiciliado en ${addressClient} (en adelante, "EL CLIENTE"), se acuerda:

PRIMERA.- OBJETO DEL CONTRATO
EL DISEÑADOR se compromete a crear y entregar servicios de diseño:
- Proyecto de diseño: ${contract.title}
- Descripción: ${contract.description || 'Servicios de diseño gráfico profesional'}
- Estilo: ${contract.style || 'Según brief del cliente'}
- Formatos de entrega: ${contract.formats || 'Formatos digitales estándar'}

SEGUNDA.- PLAZO DE EJECUCIÓN
El diseño se desarrollará desde ${contract.start_date ? new Date(contract.start_date).toLocaleDateString('es-ES') : '[Fecha inicio]'} hasta ${contract.end_date ? new Date(contract.end_date).toLocaleDateString('es-ES') : '[Fecha fin]'}.

TERCERA.- PRECIO Y FORMA DE PAGO
El precio total del diseño es de ${contract.contract_value || '0'} ${contract.currency || 'EUR'}.
Forma de pago: ${contract.payment_terms || 'Según acuerdo'}

CUARTA.- ENTREGABLES
- Propuestas de diseño inicial
- Archivos finales en formatos requeridos
- Guía de uso y aplicación
- ${contract.deliverables || 'Variaciones según especificaciones'}

QUINTA.- REVISIONES
Se incluyen hasta 3 rondas de revisiones. Cambios adicionales fuera del alcance original generarán costos extra.

SEXTA.- DERECHOS DE USO
Los derechos de uso comercial se transfieren al CLIENTE. EL DISEÑADOR conserva derechos para portafolio.

En Madrid, a ${new Date().toLocaleDateString('es-ES')}

EL CONSULTOR:                     EL CLIENTE:
_____________________________     _____________________________
${companyName}                    ${clientName}
DNI: ${dniProvider}               DNI/CIF: ${dniClient}
    `;
}

// Template para servicios de contenido
function generateContenidoContent(contract: any, companyName: string, clientName: string, addressProvider: string, addressClient: string, dniProvider: string, dniClient: string): string {
    return `
CONTRATO DE PRESTACIÓN DE SERVICIOS DE CREACIÓN DE CONTENIDO

Entre ${companyName}, con DNI ${dniProvider}, domiciliado en ${addressProvider} (en adelante, "EL CREADOR"), y ${clientName}, con DNI ${dniClient}, domiciliado en ${addressClient} (en adelante, "EL CLIENTE"), se acuerda:

PRIMERA.- OBJETO DEL CONTRATO
EL CREADOR se compromete a producir contenido profesional:
- Tipo de contenido: ${contract.title}
- Descripción: ${contract.description || 'Creación de contenido original'}
- Formato: ${contract.format || 'Según especificaciones'}
- Volumen: ${contract.volume || 'Según alcance acordado'}

SEGUNDA.- PLAZO DE EJECUCIÓN
El contenido se creará desde ${contract.start_date ? new Date(contract.start_date).toLocaleDateString('es-ES') : '[Fecha inicio]'} hasta ${contract.end_date ? new Date(contract.end_date).toLocaleDateString('es-ES') : '[Fecha fin]'}.

TERCERA.- PRECIO Y FORMA DE PAGO
El precio total por el contenido es de ${contract.contract_value || '0'} ${contract.currency || 'EUR'}.
Forma de pago: ${contract.payment_terms || 'Según acuerdo'}

CUARTA.- ENTREGABLES
- Contenido original y libre de plagio
- Contenido optimizado según objetivos
- Revisiones y correcciones incluidas
- ${contract.deliverables || 'Entregables según especificaciones'}

QUINTA.- ORIGINALIDAD
Todo el contenido será original. EL CREADOR garantiza que no infringe derechos de autor de terceros.

SEXTA.- REVISIONES
Se incluyen hasta 2 revisiones menores. Cambios sustanciales generarán costos adicionales.

En Madrid, a ${new Date().toLocaleDateString('es-ES')}

EL CONSULTOR:                     EL CLIENTE:
_____________________________     _____________________________
${companyName}                    ${clientName}
DNI: ${dniProvider}               DNI/CIF: ${dniClient}
    `;
}

// Template general para otros servicios
function generateGeneralContent(contract: any, companyName: string, clientName: string, addressProvider: string, addressClient: string, dniProvider: string, dniClient: string): string {
    return `
CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES

Entre ${companyName}, con DNI ${dniProvider}, domiciliado en ${addressProvider} (en adelante, "EL PRESTADOR"), y ${clientName}, con DNI ${dniClient}, domiciliado en ${addressClient} (en adelante, "EL CLIENTE"), se acuerda:

PRIMERA.- OBJETO DEL CONTRATO
EL PRESTADOR se compromete a proporcionar servicios profesionales:
- Servicio: ${contract.title}
- Descripción: ${contract.description || 'Servicios profesionales especializados'}
- Alcance: ${contract.scope || 'Según especificaciones acordadas'}
- Metodología: ${contract.methodology || 'Metodología profesional'}

SEGUNDA.- PLAZO DE EJECUCIÓN
Los servicios se prestarán desde ${contract.start_date ? new Date(contract.start_date).toLocaleDateString('es-ES') : '[Fecha inicio]'} hasta ${contract.end_date ? new Date(contract.end_date).toLocaleDateString('es-ES') : '[Fecha fin]'}.

TERCERA.- PRECIO Y FORMA DE PAGO
El precio total de los servicios es de ${contract.contract_value || '0'} ${contract.currency || 'EUR'}.
Forma de pago: ${contract.payment_terms || 'Según acuerdo'}

CUARTA.- ENTREGABLES
- Servicios ejecutados según especificaciones
- Documentación y reportes correspondientes
- Soporte durante la ejecución
- ${contract.deliverables || 'Entregables según alcance acordado'}

QUINTA.- CALIDAD Y PROFESIONALISMO
EL PRESTADOR garantiza la ejecución de los servicios con los más altos estándares profesionales.

SEXTA.- CONFIDENCIALIDAD
Toda información intercambiada será tratada de forma confidencial por ambas partes.

En Madrid, a ${new Date().toLocaleDateString('es-ES')}

EL CONSULTOR:                     EL CLIENTE:
_____________________________     _____________________________
${companyName}                    ${clientName}
DNI: ${dniProvider}               DNI/CIF: ${dniClient}
    `;
}