const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Usar las credenciales de administrador para bypasear RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Clave de servicio

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ ERROR: Missing Supabase environment variables');
    console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const templates = [
    // DESARROLLO WEB
    {
        name: "Landing Page Empresarial",
        category: "web_development",
        description: "Página de aterrizaje profesional con diseño responsive, formularios de contacto y optimización SEO.",
        template_data: {
            phases: [
                { name: "Análisis y Planificación", duration: "3-5 días", tasks: ["Reunión inicial con cliente", "Análisis de competencia", "Definición de objetivos", "Creación de wireframes"] },
                { name: "Diseño Visual", duration: "5-7 días", tasks: ["Diseño de mockups", "Selección de paleta de colores", "Tipografía y elementos gráficos", "Revisiones con cliente"] },
                { name: "Desarrollo", duration: "7-10 días", tasks: ["Maquetación HTML/CSS", "Implementación responsive", "Formularios funcionales", "Optimización de velocidad"] },
                { name: "Testing y Entrega", duration: "2-3 días", tasks: ["Testing en diferentes dispositivos", "Optimización SEO", "Configuración de analytics", "Entrega y formación"] }
            ],
            deliverables: ["Página web responsive", "Panel de administración", "Documentación técnica", "1 mes de soporte"],
            pricing: { base_price: 1500, hourly_rate: 75, fixed_price: true }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "E-commerce Completo",
        category: "web_development", 
        description: "Tienda online completa con carrito, pagos, gestión de inventario y panel administrativo.",
        template_data: {
            phases: [
                { name: "Planificación E-commerce", duration: "5-7 días", tasks: ["Análisis de productos", "Definición de flujos de compra", "Integración de pagos", "Estructura de categorías"] },
                { name: "Diseño UX/UI", duration: "8-10 días", tasks: ["Wireframes de tienda", "Diseño de páginas de producto", "Checkout optimizado", "Dashboard administrativo"] },
                { name: "Desarrollo Backend", duration: "15-20 días", tasks: ["Base de datos", "API de productos", "Sistema de usuarios", "Gestión de pedidos"] },
                { name: "Frontend y Testing", duration: "10-12 días", tasks: ["Interfaz de usuario", "Carrito de compras", "Pasarela de pago", "Testing integral"] }
            ],
            deliverables: ["Tienda online completa", "Panel administrativo", "Sistema de pagos", "3 meses de soporte"],
            pricing: { base_price: 4500, hourly_rate: 85, fixed_price: true }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Aplicación Web SaaS",
        category: "web_development",
        description: "Aplicación web escalable con subscripciones, dashboard de usuario y panel administrativo.",
        template_data: {
            phases: [
                { name: "Arquitectura y Planificación", duration: "7-10 días", tasks: ["Definición de funcionalidades", "Arquitectura de sistema", "Modelo de subscripciones", "Wireframes principales"] },
                { name: "MVP Development", duration: "20-25 días", tasks: ["Autenticación de usuarios", "Dashboard principal", "Funcionalidades core", "Sistema de subscripciones"] },
                { name: "Panel Administrativo", duration: "10-15 días", tasks: ["Gestión de usuarios", "Analytics", "Configuración del sistema", "Reporting"] },
                { name: "Testing y Deployment", duration: "5-7 días", tasks: ["Testing de seguridad", "Optimización de rendimiento", "Configuración de servidor", "Documentación"] }
            ],
            deliverables: ["Aplicación SaaS completa", "Panel administrativo", "Documentación de API", "6 meses de soporte"],
            pricing: { base_price: 8500, hourly_rate: 95, fixed_price: false }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "App Móvil iOS/Android",
        category: "web_development",
        description: "Aplicación móvil nativa o híbrida para iOS y Android con backend integrado.",
        template_data: {
            phases: [
                { name: "Diseño UX/UI Móvil", duration: "8-12 días", tasks: ["Research de usuarios", "Wireframes móviles", "Prototipo interactivo", "Guía de estilos"] },
                { name: "Desarrollo Backend", duration: "15-20 días", tasks: ["API REST", "Base de datos", "Autenticación", "Push notifications"] },
                { name: "Desarrollo Mobile", duration: "20-30 días", tasks: ["Desarrollo iOS", "Desarrollo Android", "Integración de APIs", "Testing en dispositivos"] },
                { name: "Publicación", duration: "3-5 días", tasks: ["Preparación para stores", "App Store submission", "Google Play submission", "Marketing materials"] }
            ],
            deliverables: ["App iOS nativa", "App Android nativa", "Backend API", "Documentación técnica"],
            pricing: { base_price: 12000, hourly_rate: 100, fixed_price: false }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "WordPress Empresarial",
        category: "web_development",
        description: "Sitio web corporativo en WordPress con tema personalizado y funcionalidades avanzadas.",
        template_data: {
            phases: [
                { name: "Planificación WordPress", duration: "3-5 días", tasks: ["Análisis de contenido", "Estructura del sitio", "Plugins necesarios", "Mockups del diseño"] },
                { name: "Desarrollo del Tema", duration: "10-15 días", tasks: ["Tema personalizado", "Templates específicos", "Funcionalidades custom", "Responsive design"] },
                { name: "Configuración y Contenido", duration: "5-7 días", tasks: ["Instalación de plugins", "Configuración SEO", "Migración de contenido", "Optimización"] },
                { name: "Training y Entrega", duration: "2-3 días", tasks: ["Formación del cliente", "Documentación", "Backup y seguridad", "Handover"] }
            ],
            deliverables: ["Sitio WordPress personalizado", "Tema custom", "Documentación de uso", "2 meses de soporte"],
            pricing: { base_price: 2500, hourly_rate: 70, fixed_price: true }
        },
        is_public: true,
        usage_count: 0
    },

    // DISEÑO
    {
        name: "Identidad Visual Completa",
        category: "design",
        description: "Desarrollo completo de marca: logo, paleta de colores, tipografía y manual de identidad.",
        template_data: {
            phases: [
                { name: "Research y Concepto", duration: "5-7 días", tasks: ["Brief con cliente", "Análisis de competencia", "Mood board", "Conceptos iniciales"] },
                { name: "Desarrollo de Logo", duration: "8-10 días", tasks: ["Bocetos iniciales", "Desarrollo digital", "Variaciones de logo", "Presentación al cliente"] },
                { name: "Identidad Extendida", duration: "7-10 días", tasks: ["Paleta de colores", "Tipografía corporativa", "Elementos gráficos", "Aplicaciones básicas"] },
                { name: "Manual de Marca", duration: "3-5 días", tasks: ["Documentación de uso", "Ejemplos de aplicación", "Archivos finales", "Presentación final"] }
            ],
            deliverables: ["Logo en todos los formatos", "Manual de identidad", "Paleta de colores", "Tipografía corporativa"],
            pricing: { base_price: 2000, hourly_rate: 60, fixed_price: true }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Diseño de Packaging",
        category: "design",
        description: "Diseño de envases y empaques para productos físicos con focus en shelf appeal.",
        template_data: {
            phases: [
                { name: "Análisis de Producto", duration: "3-5 días", tasks: ["Brief del producto", "Análisis de mercado", "Competencia directa", "Target definido"] },
                { name: "Concepto Creativo", duration: "5-7 días", tasks: ["Conceptos iniciales", "Mood boards", "Bocetos a mano", "Dirección creativa"] },
                { name: "Desarrollo Digital", duration: "8-12 días", tasks: ["Diseño digital", "Dielines técnicos", "Mockups 3D", "Variaciones"] },
                { name: "Producción", duration: "3-4 días", tasks: ["Archivos para imprenta", "Especificaciones técnicas", "Pruebas de color", "Supervision de impresión"] }
            ],
            deliverables: ["Diseño final de packaging", "Archivos para producción", "Mockups 3D", "Especificaciones técnicas"],
            pricing: { base_price: 1800, hourly_rate: 65, fixed_price: true }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Diseño Editorial",
        category: "design",
        description: "Diseño de libros, revistas, catálogos y material editorial con maquetación profesional.",
        template_data: {
            phases: [
                { name: "Planificación Editorial", duration: "3-5 días", tasks: ["Análisis de contenido", "Estructura del documento", "Grid system", "Especificaciones técnicas"] },
                { name: "Diseño de Templates", duration: "7-10 días", tasks: ["Portada y contraportada", "Páginas maestras", "Estilos de párrafo", "Elementos gráficos"] },
                { name: "Maquetación", duration: "10-15 días", tasks: ["Layout de páginas", "Colocación de imágenes", "Ajustes tipográficos", "Revisiones"] },
                { name: "Preimpresión", duration: "2-3 días", tasks: ["Revisión final", "Archivos para imprenta", "Pruebas de color", "Control de calidad"] }
            ],
            deliverables: ["Documento maquetado", "Archivos para imprenta", "PDF de alta resolución", "Templates reutilizables"],
            pricing: { base_price: 1200, hourly_rate: 55, fixed_price: false }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Diseño de Presentaciones",
        category: "design",
        description: "Presentaciones corporativas profesionales con diseño visual impactante.",
        template_data: {
            phases: [
                { name: "Contenido y Estructura", duration: "2-3 días", tasks: ["Análisis del contenido", "Storytelling", "Estructura narrativa", "Jerarquía de información"] },
                { name: "Diseño Visual", duration: "5-8 días", tasks: ["Template master", "Iconografía", "Gráficos y charts", "Elementos visuales"] },
                { name: "Producción", duration: "3-5 días", tasks: ["Aplicación del diseño", "Animaciones", "Transiciones", "Optimización"] },
                { name: "Revisión Final", duration: "1-2 días", tasks: ["Control de calidad", "Testing", "Ajustes finales", "Entrega"] }
            ],
            deliverables: ["Presentación completa", "Template reutilizable", "Iconografía custom", "Guía de uso"],
            pricing: { base_price: 800, hourly_rate: 50, fixed_price: true }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Diseño Web UI/UX",
        category: "design",
        description: "Diseño de interfaces digitales con focus en experiencia de usuario y usabilidad.",
        template_data: {
            phases: [
                { name: "Research UX", duration: "5-7 días", tasks: ["User personas", "User journey", "Análisis de usabilidad", "Benchmarking"] },
                { name: "Wireframing", duration: "5-8 días", tasks: ["Information architecture", "Wireframes", "User flows", "Prototyping"] },
                { name: "Diseño Visual", duration: "8-12 días", tasks: ["UI design", "Design system", "Componentes", "Responsive design"] },
                { name: "Prototipo", duration: "3-5 días", tasks: ["Prototipo interactivo", "Micro-interacciones", "Testing con usuarios", "Iteraciones"] }
            ],
            deliverables: ["Diseños finales", "Prototipo interactivo", "Design system", "Especificaciones para desarrollo"],
            pricing: { base_price: 2800, hourly_rate: 70, fixed_price: true }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Diseño de Infografías",
        category: "design",
        description: "Infografías profesionales para comunicar datos complejos de forma visual y atractiva.",
        template_data: {
            phases: [
                { name: "Análisis de Datos", duration: "2-3 días", tasks: ["Revisión de información", "Jerarquización de datos", "Narrativa visual", "Concepto creativo"] },
                { name: "Diseño Conceptual", duration: "3-5 días", tasks: ["Bocetos iniciales", "Estructura visual", "Iconografía", "Paleta de colores"] },
                { name: "Producción Digital", duration: "5-7 días", tasks: ["Diseño final", "Ilustraciones custom", "Gráficos de datos", "Optimización"] },
                { name: "Versiones Finales", duration: "1-2 días", tasks: ["Formatos múltiples", "Optimización web", "Print ready", "Presentación"] }
            ],
            deliverables: ["Infografía final", "Versión web optimizada", "Versión para impresión", "Iconografía custom"],
            pricing: { base_price: 600, hourly_rate: 45, fixed_price: true }
        },
        is_public: true,
        usage_count: 0
    },

    // MARKETING
    {
        name: "Campaña de Marketing Digital",
        category: "marketing",
        description: "Estrategia completa de marketing digital con contenido, publicidad y analytics.",
        template_data: {
            phases: [
                { name: "Estrategia y Planificación", duration: "5-7 días", tasks: ["Análisis de mercado", "Definición de objetivos", "Target audience", "Calendario editorial"] },
                { name: "Creación de Contenido", duration: "10-15 días", tasks: ["Copy para ads", "Creatividades visuales", "Video content", "Landing pages"] },
                { name: "Implementación", duration: "7-10 días", tasks: ["Setup de campañas", "Configuración de tracking", "A/B testing", "Lanzamiento"] },
                { name: "Optimización", duration: "15-30 días", tasks: ["Monitoreo diario", "Optimización de ads", "Reporting", "Scaling exitoso"] }
            ],
            deliverables: ["Estrategia de marketing", "Creatividades", "Campañas configuradas", "Reportes mensuales"],
            pricing: { base_price: 2500, hourly_rate: 80, fixed_price: false }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Social Media Management",
        category: "marketing",
        description: "Gestión completa de redes sociales con contenido, community management y growth.",
        template_data: {
            phases: [
                { name: "Estrategia Social", duration: "3-5 días", tasks: ["Audit de redes actuales", "Estrategia de contenido", "Calendario editorial", "KPIs definidos"] },
                { name: "Creación de Contenido", duration: "Ongoing", tasks: ["Posts diarios", "Stories", "Video content", "Gráficos"] },
                { name: "Community Management", duration: "Ongoing", tasks: ["Respuesta a comentarios", "Engagement", "Customer service", "Crisis management"] },
                { name: "Growth y Analytics", duration: "Ongoing", tasks: ["Hashtag research", "Growth strategies", "Reporting mensual", "Optimización"] }
            ],
            deliverables: ["Estrategia de redes", "Contenido mensual", "Community management", "Reportes de crecimiento"],
            pricing: { base_price: 1200, hourly_rate: 40, fixed_price: false }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Email Marketing Campaign",
        category: "marketing",
        description: "Campañas de email marketing automatizadas con secuencias y segmentación avanzada.",
        template_data: {
            phases: [
                { name: "Estrategia de Email", duration: "3-5 días", tasks: ["Segmentación de audiencia", "Customer journey", "Objetivos de campaña", "KPIs"] },
                { name: "Diseño y Copy", duration: "7-10 días", tasks: ["Templates de email", "Copywriting", "Call to actions", "A/B testing"] },
                { name: "Automatización", duration: "5-7 días", tasks: ["Setup de secuencias", "Triggers", "Personalización", "Testing"] },
                { name: "Optimización", duration: "Ongoing", tasks: ["Análisis de métricas", "Split testing", "Optimización", "Reporting"] }
            ],
            deliverables: ["Estrategia de email", "Templates diseñados", "Automatizaciones", "Reportes de performance"],
            pricing: { base_price: 1500, hourly_rate: 60, fixed_price: true }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "SEO y Content Marketing",
        category: "marketing",
        description: "Estrategia SEO integral con creación de contenido optimizado y link building.",
        template_data: {
            phases: [
                { name: "Auditoría SEO", duration: "5-7 días", tasks: ["Technical SEO audit", "Keyword research", "Competitor analysis", "Strategy planning"] },
                { name: "Optimización On-Page", duration: "10-15 días", tasks: ["Meta tags", "Content optimization", "Internal linking", "Site structure"] },
                { name: "Content Creation", duration: "15-20 días", tasks: ["Blog posts", "Landing pages", "Resource content", "Video scripts"] },
                { name: "Link Building", duration: "30+ días", tasks: ["Outreach campaigns", "Guest posting", "Directory submissions", "Monitoring"] }
            ],
            deliverables: ["Auditoría SEO completa", "Contenido optimizado", "Strategy document", "Reportes mensuales"],
            pricing: { base_price: 2000, hourly_rate: 75, fixed_price: false }
        },
        is_public: true,
        usage_count: 0
    },

    // CONSULTORÍA
    {
        name: "Consultoría en Transformación Digital",
        category: "consulting",
        description: "Asesoramiento estratégico para digitalizar procesos empresariales y adoptar nuevas tecnologías.",
        template_data: {
            phases: [
                { name: "Diagnóstico Digital", duration: "7-10 días", tasks: ["Audit de procesos actuales", "Assessment tecnológico", "Gap analysis", "Stakeholder interviews"] },
                { name: "Estrategia Digital", duration: "10-15 días", tasks: ["Digital roadmap", "Technology selection", "Change management plan", "ROI projections"] },
                { name: "Plan de Implementación", duration: "5-7 días", tasks: ["Implementation timeline", "Resource planning", "Risk assessment", "Success metrics"] },
                { name: "Soporte y Seguimiento", duration: "30-90 días", tasks: ["Implementation support", "Team training", "Progress monitoring", "Optimization"] }
            ],
            deliverables: ["Diagnóstico digital", "Estrategia de transformación", "Plan de implementación", "Training materials"],
            pricing: { base_price: 5000, hourly_rate: 120, fixed_price: false }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Consultoría en E-commerce",
        category: "consulting",
        description: "Optimización de tiendas online para mejorar conversiones y aumentar ventas.",
        template_data: {
            phases: [
                { name: "Auditoría E-commerce", duration: "5-7 días", tasks: ["UX/UI analysis", "Conversion funnel review", "Technical audit", "Competitor benchmarking"] },
                { name: "Estrategia de Optimización", duration: "7-10 días", tasks: ["CRO strategy", "Product optimization", "Pricing strategy", "Customer journey mapping"] },
                { name: "Plan de Acción", duration: "3-5 días", tasks: ["Implementation roadmap", "A/B testing plan", "KPI framework", "Resource allocation"] },
                { name: "Implementación y Soporte", duration: "30-60 días", tasks: ["Change implementation", "Testing support", "Performance monitoring", "Optimization iterations"] }
            ],
            deliverables: ["Auditoría completa", "Estrategia de optimización", "Plan de acción", "Soporte en implementación"],
            pricing: { base_price: 3500, hourly_rate: 100, fixed_price: false }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Consultoría en Productividad",
        category: "consulting",
        description: "Optimización de procesos y herramientas para mejorar la productividad empresarial.",
        template_data: {
            phases: [
                { name: "Análisis de Procesos", duration: "5-7 días", tasks: ["Process mapping", "Time tracking analysis", "Bottleneck identification", "Team interviews"] },
                { name: "Optimización", duration: "7-10 días", tasks: ["Process redesign", "Tool recommendations", "Automation opportunities", "Workflow optimization"] },
                { name: "Implementación", duration: "10-15 días", tasks: ["Tool setup", "Team training", "Process rollout", "Change management"] },
                { name: "Medición y Ajuste", duration: "30 días", tasks: ["Performance monitoring", "Feedback collection", "Process refinement", "Success measurement"] }
            ],
            deliverables: ["Análisis de procesos", "Plan de optimización", "Herramientas configuradas", "Training completo"],
            pricing: { base_price: 2800, hourly_rate: 90, fixed_price: true }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Consultoría en Ciberseguridad",
        category: "consulting",
        description: "Evaluación y mejora de la seguridad informática empresarial.",
        template_data: {
            phases: [
                { name: "Audit de Seguridad", duration: "7-10 días", tasks: ["Vulnerability assessment", "Security policy review", "Infrastructure audit", "Risk analysis"] },
                { name: "Plan de Seguridad", duration: "5-7 días", tasks: ["Security strategy", "Compliance requirements", "Policy development", "Training plan"] },
                { name: "Implementación", duration: "15-20 días", tasks: ["Security tools setup", "Policy implementation", "Team training", "Incident response"] },
                { name: "Monitoreo", duration: "Ongoing", tasks: ["Continuous monitoring", "Threat intelligence", "Incident response", "Regular audits"] }
            ],
            deliverables: ["Audit de seguridad", "Plan de ciberseguridad", "Herramientas implementadas", "Training de equipo"],
            pricing: { base_price: 4500, hourly_rate: 110, fixed_price: false }
        },
        is_public: true,
        usage_count: 0
    },

    // CONTENIDO Y REDACCIÓN
    {
        name: "Redacción de Contenido Web",
        category: "content",
        description: "Creación de contenido optimizado para web con enfoque en SEO y conversiones.",
        template_data: {
            phases: [
                { name: "Research y Estrategia", duration: "3-5 días", tasks: ["Keyword research", "Competitor analysis", "Content strategy", "Editorial calendar"] },
                { name: "Creación de Contenido", duration: "10-15 días", tasks: ["Blog posts", "Landing pages", "Product descriptions", "Meta descriptions"] },
                { name: "Optimización SEO", duration: "3-5 días", tasks: ["On-page optimization", "Internal linking", "Content formatting", "CTA optimization"] },
                { name: "Revisión y Entrega", duration: "2-3 días", tasks: ["Content review", "Proofreading", "Final optimization", "Content delivery"] }
            ],
            deliverables: ["Contenido web optimizado", "Calendario editorial", "Guía de SEO", "Templates reutilizables"],
            pricing: { base_price: 1200, hourly_rate: 50, fixed_price: false }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Traducción Especializada",
        category: "content",
        description: "Servicios de traducción profesional para documentos técnicos y contenido especializado.",
        template_data: {
            phases: [
                { name: "Análisis del Proyecto", duration: "1-2 días", tasks: ["Document analysis", "Terminology research", "Style guide review", "Timeline planning"] },
                { name: "Traducción", duration: "5-15 días", tasks: ["Initial translation", "Terminology consistency", "Cultural adaptation", "Quality checks"] },
                { name: "Revisión", duration: "2-5 días", tasks: ["Proofreading", "Style consistency", "Technical accuracy", "Final review"] },
                { name: "Entrega", duration: "1 día", tasks: ["Final formatting", "Quality assurance", "Delivery", "Post-delivery support"] }
            ],
            deliverables: ["Documento traducido", "Glosario de términos", "Certificado de calidad", "Soporte post-entrega"],
            pricing: { base_price: 800, hourly_rate: 35, fixed_price: false }
        },
        is_public: true,
        usage_count: 0
    },

    // FOTOGRAFÍA Y VIDEO
    {
        name: "Fotografía de Producto",
        category: "photography",
        description: "Sesión fotográfica profesional para productos con retoque y optimización para e-commerce.",
        template_data: {
            phases: [
                { name: "Planificación", duration: "2-3 días", tasks: ["Brief del producto", "Concepto visual", "Setup planning", "Equipment preparation"] },
                { name: "Sesión Fotográfica", duration: "1-2 días", tasks: ["Product photography", "Different angles", "Lifestyle shots", "Detail shots"] },
                { name: "Post-producción", duration: "5-7 días", tasks: ["Photo editing", "Color correction", "Background removal", "Optimization"] },
                { name: "Entrega", duration: "1 día", tasks: ["Final selection", "Format optimization", "Web optimization", "Archive delivery"] }
            ],
            deliverables: ["Fotos profesionales", "Versiones optimizadas", "Fotos editadas", "Archivos en alta resolución"],
            pricing: { base_price: 600, hourly_rate: 80, fixed_price: true }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Video Promocional",
        category: "video",
        description: "Producción de video promocional para empresa o producto con guión y post-producción.",
        template_data: {
            phases: [
                { name: "Pre-producción", duration: "5-7 días", tasks: ["Concept development", "Script writing", "Storyboard", "Location scouting"] },
                { name: "Producción", duration: "2-3 días", tasks: ["Video shooting", "Audio recording", "Multiple takes", "B-roll footage"] },
                { name: "Post-producción", duration: "10-15 días", tasks: ["Video editing", "Color grading", "Audio mixing", "Motion graphics"] },
                { name: "Entrega", duration: "2-3 días", tasks: ["Final review", "Format optimization", "Social media versions", "Archive delivery"] }
            ],
            deliverables: ["Video promocional", "Versiones para redes", "Archivos fuente", "Guión y storyboard"],
            pricing: { base_price: 2500, hourly_rate: 100, fixed_price: true }
        },
        is_public: true,
        usage_count: 0
    },

    // AUTOMATIZACIÓN Y TECH
    {
        name: "Automatización de Procesos",
        category: "automation",
        description: "Implementación de automatizaciones para optimizar procesos empresariales repetitivos.",
        template_data: {
            phases: [
                { name: "Análisis de Procesos", duration: "5-7 días", tasks: ["Process mapping", "Automation opportunities", "Tool assessment", "ROI calculation"] },
                { name: "Diseño de Automatización", duration: "7-10 días", tasks: ["Workflow design", "Tool selection", "Integration planning", "Testing strategy"] },
                { name: "Implementación", duration: "10-15 días", tasks: ["Automation setup", "Integration development", "Testing", "Documentation"] },
                { name: "Training y Soporte", duration: "5-7 días", tasks: ["Team training", "Process documentation", "Support setup", "Optimization"] }
            ],
            deliverables: ["Procesos automatizados", "Documentación técnica", "Training completo", "Soporte inicial"],
            pricing: { base_price: 3500, hourly_rate: 85, fixed_price: false }
        },
        is_public: true,
        usage_count: 0
    }
];

async function createTemplates() {
    console.log('🚀 Creando templates predefinidos...\n');

    let successCount = 0;
    const categoryCount = {};

    for (const template of templates) {
        try {
            console.log(`📝 Creando template: ${template.name}`);
            
            const { data, error } = await supabase
                .from('project_templates')
                .insert([template])
                .select();

            if (error) {
                console.log(`❌ Error creando ${template.name}:`, error.message);
            } else {
                console.log(`✅ Template creado: ${template.name}`);
                successCount++;
                
                // Contar por categoría
                if (categoryCount[template.category]) {
                    categoryCount[template.category]++;
                } else {
                    categoryCount[template.category] = 1;
                }
            }
        } catch (error) {
            console.log(`❌ Error creando ${template.name}:`, error.message);
        }
    }

    console.log('\n🎉 ¡Proceso completado!');
    console.log(`📊 Total de templates creados: ${successCount}/${templates.length}`);
    
    if (Object.keys(categoryCount).length > 0) {
        console.log('\n📈 Estadísticas por categoría:');
        Object.entries(categoryCount).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} templates`);
        });
    }
}

createTemplates().catch(console.error);
