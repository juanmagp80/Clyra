const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('ERROR: Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Templates predefinidos para diferentes tipos de freelancers
const predefinedTemplates = [
    // DESARROLLO WEB
    {
        name: "Landing Page Básica",
        category: "web_development",
        description: "Página de aterrizaje simple y efectiva para promocionar un producto o servicio. Incluye hero section, características, testimonios y formulario de contacto.",
        template_data: {
            phases: [
                {
                    name: "Análisis y Diseño",
                    duration: "3 días",
                    tasks: [
                        "Reunión inicial con cliente",
                        "Análisis de competencia",
                        "Wireframes y mockups",
                        "Aprobación del diseño"
                    ]
                },
                {
                    name: "Desarrollo",
                    duration: "5 días",
                    tasks: [
                        "Configuración del proyecto",
                        "Desarrollo del HTML/CSS",
                        "Integración de formularios",
                        "Optimización para móviles"
                    ]
                },
                {
                    name: "Testing y Entrega",
                    duration: "2 días",
                    tasks: [
                        "Pruebas en diferentes navegadores",
                        "Optimización de velocidad",
                        "Configuración de hosting",
                        "Entrega final y documentación"
                    ]
                }
            ],
            deliverables: [
                "Diseño responsive completo",
                "Código fuente optimizado",
                "Formulario de contacto funcional",
                "Documentación técnica",
                "1 mes de soporte gratuito"
            ],
            pricing: {
                base_price: 800,
                hourly_rate: 45,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "E-commerce Completo",
        category: "web_development",
        description: "Tienda online profesional con catálogo de productos, carrito de compras, pasarela de pagos y panel de administración.",
        template_data: {
            phases: [
                {
                    name: "Planificación y Análisis",
                    duration: "1 semana",
                    tasks: [
                        "Análisis de requerimientos",
                        "Arquitectura de la información",
                        "Selección de tecnologías",
                        "Planificación de la base de datos"
                    ]
                },
                {
                    name: "Diseño UX/UI",
                    duration: "1 semana",
                    tasks: [
                        "Wireframes de todas las páginas",
                        "Diseño visual completo",
                        "Prototipo interactivo",
                        "Guía de estilos"
                    ]
                },
                {
                    name: "Desarrollo Frontend",
                    duration: "2 semanas",
                    tasks: [
                        "Desarrollo de componentes",
                        "Integración con APIs",
                        "Carrito de compras",
                        "Sistema de autenticación"
                    ]
                },
                {
                    name: "Desarrollo Backend",
                    duration: "2 semanas",
                    tasks: [
                        "API REST completa",
                        "Base de datos",
                        "Panel de administración",
                        "Integración de pagos"
                    ]
                },
                {
                    name: "Testing y Deploy",
                    duration: "1 semana",
                    tasks: [
                        "Pruebas de funcionalidad",
                        "Pruebas de seguridad",
                        "Optimización de rendimiento",
                        "Despliegue en producción"
                    ]
                }
            ],
            deliverables: [
                "Tienda online completa",
                "Panel de administración",
                "Integración con Stripe/PayPal",
                "Sistema de inventario",
                "Documentación completa",
                "3 meses de soporte"
            ],
            pricing: {
                base_price: 4500,
                hourly_rate: 65,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "App Web Corporativa",
        category: "web_development",
        description: "Aplicación web empresarial con dashboard, gestión de usuarios, reportes y integración con sistemas existentes.",
        template_data: {
            phases: [
                {
                    name: "Análisis de Requerimientos",
                    duration: "1 semana",
                    tasks: [
                        "Reuniones con stakeholders",
                        "Análisis de procesos actuales",
                        "Definición de funcionalidades",
                        "Documentación de requerimientos"
                    ]
                },
                {
                    name: "Arquitectura y Diseño",
                    duration: "1 semana",
                    tasks: [
                        "Arquitectura del sistema",
                        "Diseño de base de datos",
                        "Wireframes y mockups",
                        "Definición de APIs"
                    ]
                },
                {
                    name: "Desarrollo",
                    duration: "4 semanas",
                    tasks: [
                        "Setup del proyecto",
                        "Desarrollo de módulos core",
                        "Dashboard administrativo",
                        "Sistema de reportes"
                    ]
                },
                {
                    name: "Integración y Testing",
                    duration: "1 semana",
                    tasks: [
                        "Integración con sistemas existentes",
                        "Pruebas unitarias y de integración",
                        "Testing de seguridad",
                        "Optimización de rendimiento"
                    ]
                }
            ],
            deliverables: [
                "Aplicación web completa",
                "Dashboard administrativo",
                "Sistema de reportes",
                "Documentación técnica",
                "Manual de usuario",
                "6 meses de mantenimiento"
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

    // DISEÑO
    {
        name: "Branding Completo",
        category: "design",
        description: "Identidad visual completa para empresas: logo, paleta de colores, tipografías, manual de marca y aplicaciones.",
        template_data: {
            phases: [
                {
                    name: "Investigación y Estrategia",
                    duration: "1 semana",
                    tasks: [
                        "Brief con el cliente",
                        "Análisis de competencia",
                        "Definición de personalidad de marca",
                        "Moodboard y referencias"
                    ]
                },
                {
                    name: "Conceptualización",
                    duration: "1 semana",
                    tasks: [
                        "Bocetos y conceptos iniciales",
                        "3 propuestas de logo",
                        "Presentación al cliente",
                        "Refinamiento del concepto elegido"
                    ]
                },
                {
                    name: "Desarrollo Visual",
                    duration: "1 semana",
                    tasks: [
                        "Finalización del logo",
                        "Paleta de colores completa",
                        "Selección tipográfica",
                        "Elementos gráficos complementarios"
                    ]
                },
                {
                    name: "Manual de Marca",
                    duration: "3 días",
                    tasks: [
                        "Diseño del manual de marca",
                        "Especificaciones técnicas",
                        "Usos correctos e incorrectos",
                        "Aplicaciones en diferentes medios"
                    ]
                }
            ],
            deliverables: [
                "Logo en diferentes versiones",
                "Manual de identidad visual",
                "Paleta de colores (RGB, CMYK, Pantone)",
                "Tipografías corporativas",
                "Archivos fuente editables",
                "Mockups de aplicación"
            ],
            pricing: {
                base_price: 1200,
                hourly_rate: 50,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Diseño de App Mobile",
        category: "design",
        description: "Diseño UX/UI completo para aplicación móvil, incluyendo wireframes, prototipos y especificaciones para desarrollo.",
        template_data: {
            phases: [
                {
                    name: "Research y UX",
                    duration: "1 semana",
                    tasks: [
                        "Análisis de usuarios objetivo",
                        "Benchmarking de competidores",
                        "User journey mapping",
                        "Wireframes de flujos principales"
                    ]
                },
                {
                    name: "Diseño de Interfaz",
                    duration: "2 semanas",
                    tasks: [
                        "Sistema de diseño",
                        "Pantallas principales",
                        "Estados y microinteracciones",
                        "Versión para tablet"
                    ]
                },
                {
                    name: "Prototipado",
                    duration: "3 días",
                    tasks: [
                        "Prototipo interactivo",
                        "Animaciones y transiciones",
                        "Testing con usuarios",
                        "Refinamientos finales"
                    ]
                },
                {
                    name: "Especificaciones",
                    duration: "2 días",
                    tasks: [
                        "Guía de implementación",
                        "Assets exportados",
                        "Especificaciones técnicas",
                        "Handoff a desarrollo"
                    ]
                }
            ],
            deliverables: [
                "Wireframes completos",
                "Diseños finales (iOS y Android)",
                "Prototipo interactivo",
                "Sistema de diseño",
                "Assets exportados",
                "Especificaciones para desarrollo"
            ],
            pricing: {
                base_price: 2200,
                hourly_rate: 55,
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
        description: "Estrategia completa de marketing digital: redes sociales, contenido, publicidad online y análisis de resultados.",
        template_data: {
            phases: [
                {
                    name: "Estrategia y Planificación",
                    duration: "1 semana",
                    tasks: [
                        "Análisis de la situación actual",
                        "Definición de objetivos SMART",
                        "Investigación de audiencia",
                        "Estrategia de contenidos"
                    ]
                },
                {
                    name: "Creación de Contenido",
                    duration: "2 semanas",
                    tasks: [
                        "Calendario editorial",
                        "Diseño de posts para RRSS",
                        "Copywriting para anuncios",
                        "Landing pages optimizadas"
                    ]
                },
                {
                    name: "Implementación",
                    duration: "1 mes",
                    tasks: [
                        "Configuración de campañas publicitarias",
                        "Publicación de contenido",
                        "Gestión de redes sociales",
                        "Email marketing"
                    ]
                },
                {
                    name: "Análisis y Optimización",
                    duration: "1 semana",
                    tasks: [
                        "Análisis de métricas",
                        "Reporte de resultados",
                        "Optimización de campañas",
                        "Recomendaciones futuras"
                    ]
                }
            ],
            deliverables: [
                "Estrategia de marketing completa",
                "Calendario editorial mensual",
                "Contenido para redes sociales",
                "Campañas publicitarias configuradas",
                "Reporte mensual de resultados",
                "Recomendaciones de mejora"
            ],
            pricing: {
                base_price: 1800,
                hourly_rate: 40,
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
        description: "Asesoramiento integral para digitalizar procesos empresariales, implementar nuevas tecnologías y optimizar operaciones.",
        template_data: {
            phases: [
                {
                    name: "Diagnóstico Inicial",
                    duration: "1 semana",
                    tasks: [
                        "Auditoría de procesos actuales",
                        "Análisis de tecnologías existentes",
                        "Entrevistas con stakeholders",
                        "Identificación de oportunidades"
                    ]
                },
                {
                    name: "Estrategia de Digitalización",
                    duration: "1 semana",
                    tasks: [
                        "Roadmap de transformación",
                        "Selección de tecnologías",
                        "Plan de implementación",
                        "Análisis de ROI"
                    ]
                },
                {
                    name: "Plan de Implementación",
                    duration: "3 días",
                    tasks: [
                        "Cronograma detallado",
                        "Asignación de recursos",
                        "Plan de gestión del cambio",
                        "Métricas de éxito"
                    ]
                },
                {
                    name: "Acompañamiento",
                    duration: "2 meses",
                    tasks: [
                        "Supervisión de implementación",
                        "Capacitación de equipos",
                        "Resolución de incidencias",
                        "Seguimiento de KPIs"
                    ]
                }
            ],
            deliverables: [
                "Diagnóstico completo de la situación actual",
                "Estrategia de transformación digital",
                "Roadmap de implementación",
                "Plan de capacitación",
                "Documentación de procesos digitalizados",
                "Reporte final con recomendaciones"
            ],
            pricing: {
                base_price: 5500,
                hourly_rate: 80,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },
    {
        name: "Auditoría SEO Completa",
        category: "consulting",
        description: "Análisis exhaustivo del posicionamiento web, identificación de problemas y estrategia de mejora para aumentar la visibilidad online.",
        template_data: {
            phases: [
                {
                    name: "Análisis Técnico",
                    duration: "3 días",
                    tasks: [
                        "Auditoría técnica del sitio web",
                        "Análisis de velocidad de carga",
                        "Revisión de estructura URLs",
                        "Verificación de indexación"
                    ]
                },
                {
                    name: "Análisis de Contenido",
                    duration: "2 días",
                    tasks: [
                        "Auditoría de contenido existente",
                        "Análisis de keywords",
                        "Revisión de meta tags",
                        "Evaluación de contenido duplicado"
                    ]
                },
                {
                    name: "Análisis de Competencia",
                    duration: "2 días",
                    tasks: [
                        "Benchmarking de competidores",
                        "Análisis de backlinks",
                        "Oportunidades de mejora",
                        "Gap analysis"
                    ]
                },
                {
                    name: "Estrategia y Recomendaciones",
                    duration: "3 días",
                    tasks: [
                        "Plan de optimización",
                        "Calendario de contenidos SEO",
                        "Estrategia de link building",
                        "Priorización de acciones"
                    ]
                }
            ],
            deliverables: [
                "Reporte completo de auditoría SEO",
                "Lista priorizada de problemas técnicos",
                "Estrategia de contenidos optimizada",
                "Plan de link building",
                "Recomendaciones técnicas detalladas",
                "Seguimiento mensual por 3 meses"
            ],
            pricing: {
                base_price: 950,
                hourly_rate: 60,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },

    // DESARROLLO WEB - MÁS ESPECÍFICOS
    {
        name: "Mantenimiento Web Mensual",
        category: "web_development",
        description: "Servicio recurrente de mantenimiento web: actualizaciones, backups, seguridad, optimización y soporte técnico.",
        template_data: {
            phases: [
                {
                    name: "Setup Inicial",
                    duration: "1 día",
                    tasks: [
                        "Análisis del sitio web actual",
                        "Configuración de herramientas de monitoreo",
                        "Setup de backups automáticos",
                        "Auditoría de seguridad inicial"
                    ]
                },
                {
                    name: "Mantenimiento Mensual",
                    duration: "Recurrente",
                    tasks: [
                        "Actualizaciones de CMS y plugins",
                        "Verificación de backups",
                        "Monitoreo de seguridad",
                        "Optimización de rendimiento",
                        "Reporte mensual de estado"
                    ]
                }
            ],
            deliverables: [
                "Configuración de monitoreo 24/7",
                "Backups automáticos diarios",
                "Actualizaciones de seguridad",
                "Reporte mensual detallado",
                "Soporte técnico prioritario",
                "Certificado SSL actualizado"
            ],
            pricing: {
                base_price: 150,
                hourly_rate: 45,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    },

    // DISEÑO - MÁS ESPECÍFICOS
    {
        name: "Diseño de Packaging",
        category: "design",
        description: "Diseño completo de empaque para productos: concepto, desarrollo gráfico, mockups y especificaciones para producción.",
        template_data: {
            phases: [
                {
                    name: "Brief y Concepto",
                    duration: "3 días",
                    tasks: [
                        "Reunión con cliente",
                        "Análisis del producto y mercado",
                        "Research de competencia",
                        "Definición del concepto creativo"
                    ]
                },
                {
                    name: "Desarrollo Gráfico",
                    duration: "1 semana",
                    tasks: [
                        "Bocetos iniciales",
                        "Desarrollo de 3 propuestas",
                        "Presentación al cliente",
                        "Refinamiento de la propuesta elegida"
                    ]
                },
                {
                    name: "Finalización",
                    duration: "3 días",
                    tasks: [
                        "Arte final del packaging",
                        "Especificaciones técnicas",
                        "Mockups fotorrealistas",
                        "Archivos listos para producción"
                    ]
                }
            ],
            deliverables: [
                "Diseño final del packaging",
                "Mockups en diferentes ángulos",
                "Archivos fuente editables",
                "Especificaciones para impresión",
                "Guía de aplicación",
                "Variaciones del diseño"
            ],
            pricing: {
                base_price: 650,
                hourly_rate: 45,
                fixed_price: true
            }
        },
        is_public: true,
        usage_count: 0
    }
];

async function insertPredefinedTemplates() {
    try {
        console.log('🚀 Insertando templates predefinidos...\n');

        for (const template of predefinedTemplates) {
            console.log(`📝 Insertando: ${template.name}`);
            
            const { data, error } = await supabase
                .from('project_templates')
                .insert([template])
                .select();

            if (error) {
                console.error(`❌ Error al insertar ${template.name}:`, error);
            } else {
                console.log(`✅ ${template.name} insertado correctamente`);
            }
        }

        console.log('\n🎉 ¡Todos los templates han sido insertados!');
        console.log(`📊 Total de templates creados: ${predefinedTemplates.length}`);

        // Mostrar resumen por categoría
        const summary = predefinedTemplates.reduce((acc, template) => {
            acc[template.category] = (acc[template.category] || 0) + 1;
            return acc;
        }, {});

        console.log('\n📈 Resumen por categorías:');
        Object.entries(summary).forEach(([category, count]) => {
            const categoryNames = {
                'web_development': 'Desarrollo Web',
                'design': 'Diseño',
                'marketing': 'Marketing',
                'consulting': 'Consultoría'
            };
            console.log(`   ${categoryNames[category] || category}: ${count} templates`);
        });

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

// Ejecutar el script
insertPredefinedTemplates().then(() => {
    console.log('\n✨ Script completado');
    process.exit(0);
});
