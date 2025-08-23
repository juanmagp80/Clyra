const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERROR: Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Templates predefinidos para diferentes tipos de freelancers
const predefinedTemplates = [
    // DESARROLLO WEB
    {
        name: "Landing Page Empresarial",
        category: "web_development",
        description: "Página de aterrizaje profesional con diseño responsive, formulario de contacto y optimización SEO básica.",
        template_data: {
            phases: [
                {
                    name: "Análisis y Planificación",
                    duration: "3 días",
                    tasks: [
                        "Reunión inicial con cliente",
                        "Análisis de competencia",
                        "Definición de objetivos",
                        "Wireframes básicos"
                    ]
                },
                {
                    name: "Diseño UI/UX",
                    duration: "5 días",
                    tasks: [
                        "Diseño de mockups",
                        "Selección de colores y tipografías",
                        "Diseño responsive",
                        "Aprobación del cliente"
                    ]
                },
                {
                    name: "Desarrollo",
                    duration: "7 días",
                    tasks: [
                        "Maquetación HTML/CSS",
                        "Implementación de JavaScript",
                        "Integración de formularios",
                        "Optimización SEO"
                    ]
                },
                {
                    name: "Testing y Entrega",
                    duration: "2 días",
                    tasks: [
                        "Pruebas en diferentes dispositivos",
                        "Corrección de bugs",
                        "Configuración de hosting",
                        "Entrega y capacitación"
                    ]
                }
            ],
            deliverables: [
                "Página web completa y funcional",
                "Código fuente",
                "Manual de mantenimiento",
                "Documentación técnica",
                "1 mes de soporte gratuito"
            ],
            pricing: {
                base_price: 1500,
                hourly_rate: 60,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "E-commerce Completo",
        category: "web_development",
        description: "Tienda online completa con carrito de compras, pasarela de pago, panel de administración y gestión de inventario.",
        template_data: {
            phases: [
                {
                    name: "Planificación y Arquitectura",
                    duration: "5 días",
                    tasks: [
                        "Análisis de requerimientos",
                        "Arquitectura de la base de datos",
                        "Definición de funcionalidades",
                        "Planificación de integraciones"
                    ]
                },
                {
                    name: "Diseño del Sistema",
                    duration: "8 días",
                    tasks: [
                        "Diseño de la interfaz de usuario",
                        "Diseño del panel de administración",
                        "Prototipo interactivo",
                        "Validación con cliente"
                    ]
                },
                {
                    name: "Desarrollo Frontend",
                    duration: "12 días",
                    tasks: [
                        "Desarrollo del catálogo",
                        "Implementación del carrito",
                        "Sistema de usuarios",
                        "Responsive design"
                    ]
                },
                {
                    name: "Desarrollo Backend",
                    duration: "10 días",
                    tasks: [
                        "API REST",
                        "Sistema de pagos",
                        "Gestión de inventario",
                        "Panel de administración"
                    ]
                },
                {
                    name: "Testing y Deploy",
                    duration: "5 días",
                    tasks: [
                        "Pruebas de funcionalidad",
                        "Testing de pagos",
                        "Configuración de servidor",
                        "Migración y entrega"
                    ]
                }
            ],
            deliverables: [
                "E-commerce completo",
                "Panel de administración",
                "Documentación técnica",
                "Manual de usuario",
                "3 meses de soporte",
                "Capacitación"
            ],
            pricing: {
                base_price: 8500,
                hourly_rate: 75,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Aplicación Web SaaS",
        category: "web_development",
        description: "Aplicación web completa tipo SaaS con autenticación, dashboard, suscripciones y API.",
        template_data: {
            phases: [
                {
                    name: "Discovery y Planificación",
                    duration: "7 días",
                    tasks: [
                        "Análisis de mercado",
                        "Definición de MVP",
                        "Arquitectura del sistema",
                        "Stack tecnológico"
                    ]
                },
                {
                    name: "Diseño UX/UI",
                    duration: "10 días",
                    tasks: [
                        "User journey mapping",
                        "Wireframes detallados",
                        "Diseño de interfaz",
                        "Sistema de design"
                    ]
                },
                {
                    name: "Desarrollo Core",
                    duration: "20 días",
                    tasks: [
                        "Autenticación y autorización",
                        "Dashboard principal",
                        "Funcionalidades principales",
                        "API development"
                    ]
                },
                {
                    name: "Integraciones",
                    duration: "8 días",
                    tasks: [
                        "Sistema de pagos",
                        "Notificaciones email",
                        "Integraciones terceros",
                        "Analytics"
                    ]
                },
                {
                    name: "Testing y Launch",
                    duration: "5 días",
                    tasks: [
                        "Testing automatizado",
                        "Testing de carga",
                        "Deployment",
                        "Monitoreo"
                    ]
                }
            ],
            deliverables: [
                "Aplicación SaaS completa",
                "Panel de administración",
                "API documentada",
                "Testing suite",
                "Deployment automatizado",
                "6 meses de soporte"
            ],
            pricing: {
                base_price: 15000,
                hourly_rate: 85,
                fixed_price: false
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "App Móvil iOS/Android",
        category: "web_development",
        description: "Aplicación móvil nativa para iOS y Android con backend, notificaciones push y analytics.",
        template_data: {
            phases: [
                {
                    name: "Conceptualización",
                    duration: "5 días",
                    tasks: [
                        "Análisis de requerimientos",
                        "Investigación de mercado",
                        "Definición de funcionalidades",
                        "Arquitectura técnica"
                    ]
                },
                {
                    name: "Diseño UX/UI",
                    duration: "8 días",
                    tasks: [
                        "User flow design",
                        "Wireframes mobile",
                        "Diseño visual",
                        "Prototipo interactivo"
                    ]
                },
                {
                    name: "Desarrollo Backend",
                    duration: "12 días",
                    tasks: [
                        "API REST",
                        "Base de datos",
                        "Autenticación",
                        "Push notifications"
                    ]
                },
                {
                    name: "Desarrollo Mobile",
                    duration: "18 días",
                    tasks: [
                        "Desarrollo iOS",
                        "Desarrollo Android",
                        "Integración API",
                        "Testing dispositivos"
                    ]
                },
                {
                    name: "Testing y Publicación",
                    duration: "7 días",
                    tasks: [
                        "QA testing",
                        "Beta testing",
                        "App Store submission",
                        "Google Play submission"
                    ]
                }
            ],
            deliverables: [
                "App iOS nativa",
                "App Android nativa",
                "Backend completo",
                "Panel de administración",
                "Documentación",
                "Apps publicadas en stores"
            ],
            pricing: {
                base_price: 18000,
                hourly_rate: 90,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },

    // DISEÑO
    {
        name: "Identidad Visual Completa",
        category: "design",
        description: "Diseño de identidad corporativa completa: logo, manual de marca, papelería y aplicaciones.",
        template_data: {
            phases: [
                {
                    name: "Briefing y Research",
                    duration: "3 días",
                    tasks: [
                        "Reunión con cliente",
                        "Análisis de competencia",
                        "Definición de valores de marca",
                        "Mood board"
                    ]
                },
                {
                    name: "Conceptualización",
                    duration: "5 días",
                    tasks: [
                        "Sketches iniciales",
                        "Propuestas de concepto",
                        "Selección de tipografías",
                        "Paleta de colores"
                    ]
                },
                {
                    name: "Desarrollo del Logo",
                    duration: "7 días",
                    tasks: [
                        "Diseño de logotipo",
                        "Variaciones",
                        "Versiones monocromáticas",
                        "Presentación de propuestas"
                    ]
                },
                {
                    name: "Manual de Marca",
                    duration: "5 días",
                    tasks: [
                        "Creación del manual",
                        "Aplicaciones del logo",
                        "Usos incorrectos",
                        "Guidelines completas"
                    ]
                },
                {
                    name: "Aplicaciones",
                    duration: "3 días",
                    tasks: [
                        "Papelería corporativa",
                        "Tarjetas de visita",
                        "Aplicaciones digitales",
                        "Archivos finales"
                    ]
                }
            ],
            deliverables: [
                "Logo en diferentes formatos",
                "Manual de identidad visual",
                "Papelería corporativa",
                "Archivos vectoriales",
                "Guía de aplicación",
                "1 revisión gratuita"
            ],
            pricing: {
                base_price: 2500,
                hourly_rate: 65,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Diseño de Packaging",
        category: "design",
        description: "Diseño completo de packaging para productos, incluyendo etiquetas, cajas y material promocional.",
        template_data: {
            phases: [
                {
                    name: "Análisis del Producto",
                    duration: "2 días",
                    tasks: [
                        "Estudio del producto",
                        "Análisis del target",
                        "Competencia directa",
                        "Requerimientos técnicos"
                    ]
                },
                {
                    name: "Concept Development",
                    duration: "4 días",
                    tasks: [
                        "Conceptos creativos",
                        "Mood boards",
                        "Propuestas de diseño",
                        "Selección de materiales"
                    ]
                },
                {
                    name: "Diseño Final",
                    duration: "6 días",
                    tasks: [
                        "Desarrollo del diseño",
                        "Ajustes técnicos",
                        "Preparación para imprenta",
                        "Mockups 3D"
                    ]
                },
                {
                    name: "Entrega y Producción",
                    duration: "2 días",
                    tasks: [
                        "Archivos finales",
                        "Especificaciones técnicas",
                        "Supervisión de producción",
                        "Entrega final"
                    ]
                }
            ],
            deliverables: [
                "Diseño de packaging completo",
                "Archivos para imprenta",
                "Mockups 3D",
                "Especificaciones técnicas",
                "Variaciones de diseño"
            ],
            pricing: {
                base_price: 1800,
                hourly_rate: 70,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Diseño Editorial",
        category: "design",
        description: "Diseño de publicaciones: revistas, catálogos, libros, manuales y material editorial.",
        template_data: {
            phases: [
                {
                    name: "Planificación Editorial",
                    duration: "3 días",
                    tasks: [
                        "Análisis del contenido",
                        "Estructura del documento",
                        "Grid system",
                        "Jerarquía tipográfica"
                    ]
                },
                {
                    name: "Diseño Base",
                    duration: "5 días",
                    tasks: [
                        "Template principal",
                        "Estilos de párrafo",
                        "Elementos gráficos",
                        "Sistema de páginas maestras"
                    ]
                },
                {
                    name: "Maquetación",
                    duration: "8 días",
                    tasks: [
                        "Maquetación de contenido",
                        "Integración de imágenes",
                        "Ajustes de texto",
                        "Revisión general"
                    ]
                },
                {
                    name: "Finalización",
                    duration: "2 días",
                    tasks: [
                        "Revisión final",
                        "Preparación para imprenta",
                        "PDF final",
                        "Archivos de trabajo"
                    ]
                }
            ],
            deliverables: [
                "Publicación diseñada",
                "Archivos InDesign",
                "PDF para imprenta",
                "PDF interactivo",
                "Templates reutilizables"
            ],
            pricing: {
                base_price: 3200,
                hourly_rate: 55,
                fixed_price: false
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Diseño de Presentaciones",
        category: "design",
        description: "Diseño profesional de presentaciones corporativas, pitch decks y material de ventas.",
        template_data: {
            phases: [
                {
                    name: "Briefing y Estructura",
                    duration: "1 día",
                    tasks: [
                        "Reunión inicial",
                        "Análisis del contenido",
                        "Estructura narrativa",
                        "Definición de objetivos"
                    ]
                },
                {
                    name: "Diseño del Template",
                    duration: "2 días",
                    tasks: [
                        "Master slides",
                        "Paleta de colores",
                        "Tipografías",
                        "Elementos gráficos"
                    ]
                },
                {
                    name: "Desarrollo de Slides",
                    duration: "4 días",
                    tasks: [
                        "Diseño de diapositivas",
                        "Infografías",
                        "Gráficos y charts",
                        "Animaciones básicas"
                    ]
                },
                {
                    name: "Revisión y Entrega",
                    duration: "1 día",
                    tasks: [
                        "Revisión final",
                        "Ajustes menores",
                        "Versión PDF",
                        "Entrega de archivos"
                    ]
                }
            ],
            deliverables: [
                "Presentación completa",
                "Template reutilizable",
                "Versión PDF",
                "Archivos fuente",
                "Guía de uso"
            ],
            pricing: {
                base_price: 800,
                hourly_rate: 60,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },

    // MARKETING
    {
        name: "Campaña de Marketing Digital",
        category: "marketing",
        description: "Estrategia completa de marketing digital: SEO, SEM, redes sociales y email marketing.",
        template_data: {
            phases: [
                {
                    name: "Auditoría y Análisis",
                    duration: "5 días",
                    tasks: [
                        "Auditoría web actual",
                        "Análisis de competencia",
                        "Research de keywords",
                        "Análisis de audiencia"
                    ]
                },
                {
                    name: "Estrategia Digital",
                    duration: "7 días",
                    tasks: [
                        "Plan de marketing integral",
                        "Estrategia de contenidos",
                        "Calendario editorial",
                        "Definición de KPIs"
                    ]
                },
                {
                    name: "Implementación SEO",
                    duration: "10 días",
                    tasks: [
                        "Optimización on-page",
                        "Optimización técnica",
                        "Link building",
                        "Contenido optimizado"
                    ]
                },
                {
                    name: "Campañas SEM",
                    duration: "3 días",
                    tasks: [
                        "Configuración Google Ads",
                        "Creación de anuncios",
                        "Landing pages",
                        "Tracking y analytics"
                    ]
                },
                {
                    name: "Social Media Setup",
                    duration: "5 días",
                    tasks: [
                        "Optimización de perfiles",
                        "Contenido para RRSS",
                        "Calendario de publicación",
                        "Configuración de ads"
                    ]
                }
            ],
            deliverables: [
                "Estrategia de marketing completa",
                "Sitio web optimizado SEO",
                "Campañas Google Ads",
                "Contenido para redes sociales",
                "Reportes mensuales",
                "3 meses de gestión"
            ],
            pricing: {
                base_price: 4500,
                hourly_rate: 75,
                fixed_price: false
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Social Media Management",
        category: "marketing",
        description: "Gestión completa de redes sociales: estrategia, contenido, community management y análisis.",
        template_data: {
            phases: [
                {
                    name: "Análisis y Estrategia",
                    duration: "3 días",
                    tasks: [
                        "Auditoría de redes actuales",
                        "Análisis de audiencia",
                        "Benchmarking competencia",
                        "Definición de objetivos"
                    ]
                },
                {
                    name: "Creación de Contenido",
                    duration: "10 días",
                    tasks: [
                        "Calendario editorial",
                        "Diseño de posts",
                        "Copywriting",
                        "Videos y reels"
                    ]
                },
                {
                    name: "Community Management",
                    duration: "30 días",
                    tasks: [
                        "Publicación diaria",
                        "Interacción con usuarios",
                        "Respuesta a comentarios",
                        "Stories y contenido temporal"
                    ]
                },
                {
                    name: "Análisis y Reporting",
                    duration: "2 días",
                    tasks: [
                        "Análisis de métricas",
                        "Reporte mensual",
                        "Optimización de estrategia",
                        "Recomendaciones"
                    ]
                }
            ],
            deliverables: [
                "Estrategia de redes sociales",
                "Contenido para 1 mes",
                "Gestión diaria",
                "Reportes semanales",
                "Análisis de resultados"
            ],
            pricing: {
                base_price: 1200,
                hourly_rate: 45,
                fixed_price: false
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Email Marketing Campaign",
        category: "marketing",
        description: "Campaña completa de email marketing: estrategia, diseño, automatizaciones y análisis.",
        template_data: {
            phases: [
                {
                    name: "Estrategia de Email",
                    duration: "2 días",
                    tasks: [
                        "Definición de objetivos",
                        "Segmentación de audiencia",
                        "Customer journey mapping",
                        "KPIs y métricas"
                    ]
                },
                {
                    name: "Diseño y Contenido",
                    duration: "5 días",
                    tasks: [
                        "Templates de email",
                        "Copywriting persuasivo",
                        "Call-to-actions",
                        "Personalización"
                    ]
                },
                {
                    name: "Setup Técnico",
                    duration: "3 días",
                    tasks: [
                        "Configuración de plataforma",
                        "Automatizaciones",
                        "Testing A/B",
                        "Integración con CRM"
                    ]
                },
                {
                    name: "Lanzamiento y Análisis",
                    duration: "2 días",
                    tasks: [
                        "Lanzamiento de campaña",
                        "Monitoreo en tiempo real",
                        "Análisis de resultados",
                        "Optimización"
                    ]
                }
            ],
            deliverables: [
                "Estrategia de email marketing",
                "Templates diseñados",
                "Secuencias automatizadas",
                "Configuración técnica",
                "Reportes de resultados"
            ],
            pricing: {
                base_price: 1800,
                hourly_rate: 55,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },

    // CONSULTORÍA
    {
        name: "Consultoría en Transformación Digital",
        category: "consulting",
        description: "Asesoramiento completo para la digitalización de empresas tradicionales.",
        template_data: {
            phases: [
                {
                    name: "Diagnóstico Digital",
                    duration: "7 días",
                    tasks: [
                        "Auditoría de procesos actuales",
                        "Análisis de tecnología existente",
                        "Identificación de gaps",
                        "Benchmarking del sector"
                    ]
                },
                {
                    name: "Estrategia Digital",
                    duration: "10 días",
                    tasks: [
                        "Roadmap de transformación",
                        "Selección de tecnologías",
                        "Plan de implementación",
                        "Análisis costo-beneficio"
                    ]
                },
                {
                    name: "Plan de Acción",
                    duration: "5 días",
                    tasks: [
                        "Cronograma detallado",
                        "Asignación de recursos",
                        "Definición de KPIs",
                        "Plan de gestión del cambio"
                    ]
                },
                {
                    name: "Acompañamiento",
                    duration: "30 días",
                    tasks: [
                        "Supervisión de implementación",
                        "Resolución de incidencias",
                        "Capacitación del equipo",
                        "Ajustes y optimizaciones"
                    ]
                }
            ],
            deliverables: [
                "Diagnóstico digital completo",
                "Estrategia de transformación",
                "Roadmap de implementación",
                "Plan de capacitación",
                "Seguimiento mensual",
                "Documentación completa"
            ],
            pricing: {
                base_price: 8000,
                hourly_rate: 120,
                fixed_price: false
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Consultoría en E-commerce",
        category: "consulting",
        description: "Asesoramiento especializado para optimizar tiendas online y aumentar ventas.",
        template_data: {
            phases: [
                {
                    name: "Auditoría E-commerce",
                    duration: "5 días",
                    tasks: [
                        "Análisis de la tienda actual",
                        "UX/UI assessment",
                        "Análisis de conversión",
                        "Estudio de competencia"
                    ]
                },
                {
                    name: "Estrategia de Optimización",
                    duration: "7 días",
                    tasks: [
                        "Plan de mejoras UX",
                        "Estrategia de precios",
                        "Optimización del funnel",
                        "Plan de marketing digital"
                    ]
                },
                {
                    name: "Implementación",
                    duration: "15 días",
                    tasks: [
                        "Mejoras técnicas",
                        "Optimización de producto",
                        "Configuración de analytics",
                        "Testing A/B"
                    ]
                },
                {
                    name: "Monitoreo y Ajustes",
                    duration: "10 días",
                    tasks: [
                        "Análisis de resultados",
                        "Optimización continua",
                        "Capacitación del equipo",
                        "Reporte final"
                    ]
                }
            ],
            deliverables: [
                "Auditoría completa",
                "Plan de optimización",
                "Implementación de mejoras",
                "Dashboard de métricas",
                "Capacitación del equipo",
                "Soporte post-implementación"
            ],
            pricing: {
                base_price: 5500,
                hourly_rate: 95,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Consultoría en Productividad",
        category: "consulting",
        description: "Optimización de procesos empresariales y mejora de la productividad del equipo.",
        template_data: {
            phases: [
                {
                    name: "Análisis de Procesos",
                    duration: "5 días",
                    tasks: [
                        "Mapeo de procesos actuales",
                        "Identificación de cuellos de botella",
                        "Análisis de tiempos",
                        "Entrevistas con el equipo"
                    ]
                },
                {
                    name: "Diseño de Mejoras",
                    duration: "7 días",
                    tasks: [
                        "Rediseño de procesos",
                        "Selección de herramientas",
                        "Automatizaciones",
                        "Plan de capacitación"
                    ]
                },
                {
                    name: "Implementación",
                    duration: "10 días",
                    tasks: [
                        "Configuración de herramientas",
                        "Capacitación del equipo",
                        "Migración de datos",
                        "Testing de procesos"
                    ]
                },
                {
                    name: "Seguimiento",
                    duration: "15 días",
                    tasks: [
                        "Monitoreo de adopción",
                        "Ajustes necesarios",
                        "Medición de resultados",
                        "Optimización continua"
                    ]
                }
            ],
            deliverables: [
                "Análisis de procesos actuales",
                "Procesos optimizados",
                "Herramientas configuradas",
                "Equipo capacitado",
                "Métricas de productividad",
                "Plan de mejora continua"
            ],
            pricing: {
                base_price: 4200,
                hourly_rate: 85,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },

    // SERVICIOS FREELANCE DIVERSOS
    {
        name: "Redacción de Contenido Web",
        category: "marketing",
        description: "Creación de contenido optimizado para web: artículos de blog, páginas de producto, landing pages.",
        template_data: {
            phases: [
                {
                    name: "Research y Planificación",
                    duration: "2 días",
                    tasks: [
                        "Investigación de keywords",
                        "Análisis de audiencia",
                        "Estudio de competencia",
                        "Plan de contenidos"
                    ]
                },
                {
                    name: "Redacción",
                    duration: "5 días",
                    tasks: [
                        "Creación de artículos",
                        "Optimización SEO",
                        "Call-to-actions",
                        "Meta descripciones"
                    ]
                },
                {
                    name: "Revisión y Entrega",
                    duration: "2 días",
                    tasks: [
                        "Revisión de calidad",
                        "Corrección de estilo",
                        "Verificación SEO",
                        "Entrega final"
                    ]
                }
            ],
            deliverables: [
                "Artículos optimizados",
                "Meta descripciones",
                "Keywords research",
                "Guía de publicación",
                "1 revisión incluida"
            ],
            pricing: {
                base_price: 600,
                hourly_rate: 40,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Traducción Especializada",
        category: "consulting",
        description: "Servicios de traducción especializada: técnica, médica, legal, marketing.",
        template_data: {
            phases: [
                {
                    name: "Análisis del Proyecto",
                    duration: "1 día",
                    tasks: [
                        "Análisis del documento",
                        "Identificación de terminología",
                        "Definición de estilo",
                        "Cronograma de entrega"
                    ]
                },
                {
                    name: "Traducción",
                    duration: "5 días",
                    tasks: [
                        "Traducción del contenido",
                        "Investigación terminológica",
                        "Adaptación cultural",
                        "Verificación de coherencia"
                    ]
                },
                {
                    name: "Revisión y Calidad",
                    duration: "2 días",
                    tasks: [
                        "Revisión completa",
                        "Corrección de estilo",
                        "Verificación técnica",
                        "Entrega final"
                    ]
                }
            ],
            deliverables: [
                "Documento traducido",
                "Glosario de términos",
                "Notas de traducción",
                "Archivo en formato original",
                "Certificado de traducción"
            ],
            pricing: {
                base_price: 800,
                hourly_rate: 35,
                fixed_price: false
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Fotografía de Producto",
        category: "design",
        description: "Sesión fotográfica profesional para productos de e-commerce con postproducción.",
        template_data: {
            phases: [
                {
                    name: "Planificación",
                    duration: "1 día",
                    tasks: [
                        "Briefing con cliente",
                        "Análisis de productos",
                        "Definición de estilo",
                        "Preparación del set"
                    ]
                },
                {
                    name: "Sesión Fotográfica",
                    duration: "2 días",
                    tasks: [
                        "Setup de iluminación",
                        "Fotografía de productos",
                        "Diferentes ángulos",
                        "Fotos en contexto"
                    ]
                },
                {
                    name: "Postproducción",
                    duration: "3 días",
                    tasks: [
                        "Selección de mejores fotos",
                        "Retoque y corrección",
                        "Optimización para web",
                        "Entrega en diferentes formatos"
                    ]
                }
            ],
            deliverables: [
                "30-50 fotos editadas",
                "Fotos en alta resolución",
                "Versiones optimizadas web",
                "Fotos con fondo transparente",
                "Derechos de uso comercial"
            ],
            pricing: {
                base_price: 1200,
                hourly_rate: 80,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Video Promocional",
        category: "design",
        description: "Producción completa de video promocional: guión, grabación, edición y postproducción.",
        template_data: {
            phases: [
                {
                    name: "Preproducción",
                    duration: "3 días",
                    tasks: [
                        "Desarrollo del concepto",
                        "Guión y storyboard",
                        "Planificación de locaciones",
                        "Casting si es necesario"
                    ]
                },
                {
                    name: "Producción",
                    duration: "2 días",
                    tasks: [
                        "Setup de equipos",
                        "Grabación principal",
                        "Grabación B-roll",
                        "Audio y entrevistas"
                    ]
                },
                {
                    name: "Postproducción",
                    duration: "7 días",
                    tasks: [
                        "Edición del video",
                        "Corrección de color",
                        "Diseño de motion graphics",
                        "Masterización de audio"
                    ]
                },
                {
                    name: "Entrega",
                    duration: "1 día",
                    tasks: [
                        "Renderizado final",
                        "Versiones para diferentes plataformas",
                        "Subtítulos si es necesario",
                        "Entrega de archivos"
                    ]
                }
            ],
            deliverables: [
                "Video promocional editado",
                "Versión para redes sociales",
                "Versión para web",
                "Archivos de alta calidad",
                "Material adicional B-roll"
            ],
            pricing: {
                base_price: 3500,
                hourly_rate: 100,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Automatización de Procesos",
        category: "web_development",
        description: "Automatización de procesos empresariales usando herramientas no-code y APIs.",
        template_data: {
            phases: [
                {
                    name: "Análisis de Procesos",
                    duration: "3 días",
                    tasks: [
                        "Mapeo de procesos actuales",
                        "Identificación de tareas repetitivas",
                        "Análisis de herramientas existentes",
                        "Definición de automatizaciones"
                    ]
                },
                {
                    name: "Diseño de Automatización",
                    duration: "4 días",
                    tasks: [
                        "Diseño de flujos de trabajo",
                        "Selección de herramientas",
                        "Integración entre sistemas",
                        "Testing de compatibilidad"
                    ]
                },
                {
                    name: "Implementación",
                    duration: "6 días",
                    tasks: [
                        "Configuración de automatizaciones",
                        "Integración de APIs",
                        "Testing completo",
                        "Documentación de procesos"
                    ]
                },
                {
                    name: "Capacitación y Soporte",
                    duration: "2 días",
                    tasks: [
                        "Capacitación del equipo",
                        "Manual de uso",
                        "Resolución de dudas",
                        "Soporte inicial"
                    ]
                }
            ],
            deliverables: [
                "Procesos automatizados",
                "Documentación completa",
                "Manual de usuario",
                "Capacitación del equipo",
                "1 mes de soporte",
                "Monitoreo de funcionamiento"
            ],
            pricing: {
                base_price: 2800,
                hourly_rate: 70,
                fixed_price: false
            }
        },
        is_public: true,
        usage_count: 0
    }
];

async function createPredefinedTemplates() {
    console.log('🚀 Creando templates predefinidos...\n');

    try {
        // Crear templates públicos (no necesitan user_id)
        for (const template of predefinedTemplates) {
            console.log(`📝 Creando template: ${template.name}`);
            
            const { data, error } = await supabase
                .from('project_templates')
                .insert([{
                    name: template.name,
                    category: template.category,
                    description: template.description,
                    template_data: template.template_data,
                    user_id: null, // Templates públicos sin propietario específico
                    is_public: template.is_public,
                    usage_count: template.usage_count
                }])
                .select();

            if (error) {
                console.error(`❌ Error creando ${template.name}:`, error.message);
            } else {
                console.log(`✅ Template "${template.name}" creado exitosamente`);
            }
        }

        console.log('\n🎉 ¡Todos los templates han sido creados!');
        console.log(`📊 Total de templates creados: ${predefinedTemplates.length}`);
        
        // Mostrar estadísticas
        const stats = predefinedTemplates.reduce((acc, template) => {
            acc[template.category] = (acc[template.category] || 0) + 1;
            return acc;
        }, {});
        
        console.log('\n📈 Estadísticas por categoría:');
        Object.entries(stats).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} templates`);
        });

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar la función
createPredefinedTemplates().catch(console.error);
