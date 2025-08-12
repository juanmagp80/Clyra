'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    Plus,
    Search,
    Filter,
    Send,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    FileText,
    TrendingUp,
    Users,
    Calendar,
    Download,
    Copy,
    Edit3,
    Trash2,
    BarChart3,
    Target,
    Zap,
    Presentation,
    Mail,
    AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Proposal {
    id: string;
    client_id: string | null;
    prospect_name: string | null;
    prospect_email: string | null;
    title: string;
    description: string;
    services: any;
    pricing: any;
    terms: any;
    timeline: any;
    status: string;
    valid_until: string | null;
    sent_at: string | null;
    viewed_at: string | null;
    responded_at: string | null;
    total_amount: number;
    currency: string;
    template_used: string | null;
    notes: string | null;
    created_at: string;
}

interface ProposalsPageClientProps {
    userEmail: string;
}

export default function ProposalsPageClient({ userEmail }: ProposalsPageClientProps) {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
    const [showSendModal, setShowSendModal] = useState(false);
    const [sendingProposal, setSendingProposal] = useState<Proposal | null>(null);
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [showNewProposalModal, setShowNewProposalModal] = useState(false);
    const [newProposal, setNewProposal] = useState({
        title: '',
        description: '',
        terms: '',
        timeline: '',
        services: { items: [{ name: '', quantity: 1, price: 0, description: '' }] }
    });
    const [stats, setStats] = useState({
        total: 0,
        sent: 0,
        accepted: 0,
        pending: 0,
        total_value: 0,
        won_value: 0,
        conversion_rate: 0,
        avg_response_time: 0
    });
    
    const router = useRouter();
    const supabase = createSupabaseClient();

    const statusFilters = [
        { id: 'all', name: 'Todas', icon: FileText, color: 'text-slate-600' },
        { id: 'draft', name: 'Borradores', icon: Edit3, color: 'text-blue-600' },
        { id: 'sent', name: 'Enviadas', icon: Send, color: 'text-orange-600' },
        { id: 'viewed', name: 'Vistas', icon: Eye, color: 'text-purple-600' },
        { id: 'accepted', name: 'Aceptadas', icon: CheckCircle, color: 'text-green-600' },
        { id: 'rejected', name: 'Rechazadas', icon: XCircle, color: 'text-red-600' }
    ];

    const proposalTemplates = [
        {
            id: 'web_development',
            name: 'Desarrollo Web',
            description: 'Propuesta completa para proyectos de desarrollo web',
            icon: Presentation,
            color: 'bg-blue-500',
            estimatedValue: '€3,500',
            conversionRate: '68%'
        },
        {
            id: 'design',
            name: 'Diseño de Marca',
            description: 'Propuesta para proyectos de identidad visual',
            icon: Target,
            color: 'bg-purple-500',
            estimatedValue: '€1,200',
            conversionRate: '72%'
        },
        {
            id: 'consulting',
            name: 'Consultoría Digital',
            description: 'Propuesta para servicios de consultoría',
            icon: BarChart3,
            color: 'bg-green-500',
            estimatedValue: '€2,800',
            conversionRate: '65%'
        },
        {
            id: 'marketing',
            name: 'Marketing Digital',
            description: 'Propuesta para campañas de marketing',
            icon: TrendingUp,
            color: 'bg-indigo-500',
            estimatedValue: '€2,200',
            conversionRate: '58%'
        },
        {
            id: 'maintenance',
            name: 'Mantenimiento Web',
            description: 'Propuesta para servicios de mantenimiento',
            icon: Clock,
            color: 'bg-orange-500',
            estimatedValue: '€450/mes',
            conversionRate: '85%'
        },
        {
            id: 'ecommerce',
            name: 'E-commerce',
            description: 'Propuesta para tiendas online',
            icon: DollarSign,
            color: 'bg-emerald-500',
            estimatedValue: '€5,500',
            conversionRate: '62%'
        }
    ];

    const handleLogout = async () => {
        try {
            if (!supabase) return;
            await supabase.auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const loadProposals = async () => {
        try {
            setLoading(true);
            
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Cargar propuestas del usuario
            const { data, error } = await supabase
                .from('proposals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading proposals:', error);
                return;
            }

            setProposals(data || []);
            setFilteredProposals(data || []);
            
            // Calcular estadísticas
            const total = data?.length || 0;
            const sent = data?.filter(p => ['sent', 'viewed', 'accepted', 'rejected'].includes(p.status)).length || 0;
            const accepted = data?.filter(p => p.status === 'accepted').length || 0;
            const pending = data?.filter(p => ['sent', 'viewed'].includes(p.status)).length || 0;
            const total_value = data?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
            const won_value = data?.filter(p => p.status === 'accepted').reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
            const conversion_rate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;
            
            // Calcular tiempo promedio de respuesta (simulado)
            const avg_response_time = Math.round(Math.random() * 48 + 24); // 24-72 horas
            
            setStats({ 
                total, 
                sent, 
                accepted, 
                pending, 
                total_value, 
                won_value, 
                conversion_rate,
                avg_response_time
            });
            
        } catch (error) {
            console.error('Error loading proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadClients = async () => {
        try {
            if (!supabase) return;
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: clientsData, error } = await supabase
                .from('clients')
                .select('*')
                .eq('user_id', user.id)
                .order('name', { ascending: true });

            if (error) {
                console.error('Error loading clients:', error);
                return;
            }

            setClients(clientsData || []);
            
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const filterProposals = () => {
        let filtered = proposals;

        // Filtrar por búsqueda
        if (searchQuery) {
            filtered = filtered.filter(proposal =>
                proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                proposal.prospect_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                proposal.prospect_email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtrar por estado
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(proposal => proposal.status === selectedStatus);
        }

        setFilteredProposals(filtered);
    };

    const duplicateProposal = async (proposal: Proposal) => {
        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const newProposal = {
                user_id: user.id,
                title: `${proposal.title} (Copia)`,
                description: proposal.description,
                services: proposal.services,
                pricing: proposal.pricing,
                terms: proposal.terms,
                timeline: proposal.timeline,
                total_amount: proposal.total_amount,
                currency: proposal.currency,
                status: 'draft'
            };

            const { error } = await supabase
                .from('proposals')
                .insert([newProposal]);

            if (error) {
                console.error('Error duplicating proposal:', error);
                return;
            }

            await loadProposals();
            
        } catch (error) {
            console.error('Error duplicating proposal:', error);
        }
    };

    const createSampleProposals = async () => {
        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Crear propuestas de ejemplo para Taskelio
            const sampleProposals = [
                {
                    user_id: user.id,
                    title: 'Desarrollo de Landing Page - Startup Tech',
                    description: 'Propuesta para el desarrollo de una landing page moderna y responsiva para startup de tecnología',
                    client_id: null,
                    prospect_name: 'María González',
                    prospect_email: 'maria@techstartup.com',
                    services: {
                        items: [
                            { name: 'Diseño UX/UI', quantity: 1, price: 800, description: 'Diseño completo de la experiencia de usuario' },
                            { name: 'Desarrollo Frontend', quantity: 1, price: 1200, description: 'Desarrollo con React y Next.js' },
                            { name: 'Optimización SEO', quantity: 1, price: 400, description: 'Configuración básica de SEO' }
                        ]
                    },
                    pricing: { subtotal: 2400, taxes: 504, total: 2904 },
                    terms: 'Pago 50% inicio, 50% entrega. Revisiones incluidas: 3',
                    timeline: '3-4 semanas',
                    total_amount: 2904,
                    currency: 'EUR',
                    status: 'sent',
                    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    sent_at: new Date().toISOString()
                },
                {
                    user_id: user.id,
                    title: 'Consultoría Digital - Restaurante Local',
                    description: 'Propuesta para consultoría y implementación de presencia digital completa',
                    client_id: null,
                    prospect_name: 'Carlos Martínez',
                    prospect_email: 'carlos@restaurantelocal.es',
                    services: {
                        items: [
                            { name: 'Auditoría Digital', quantity: 1, price: 500, description: 'Análisis completo de presencia online' },
                            { name: 'Estrategia Redes Sociales', quantity: 1, price: 750, description: 'Plan de contenidos 3 meses' },
                            { name: 'Setup Google My Business', quantity: 1, price: 200, description: 'Optimización listado local' }
                        ]
                    },
                    pricing: { subtotal: 1450, taxes: 304.50, total: 1754.50 },
                    terms: 'Pago mensual durante 3 meses. Incluye seguimiento y ajustes',
                    timeline: '1-2 semanas setup inicial',
                    total_amount: 1754.50,
                    currency: 'EUR',
                    status: 'viewed',
                    valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    viewed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    user_id: user.id,
                    title: 'Rediseño de Branding - Coach Personal',
                    description: 'Propuesta completa de rediseño de identidad visual y materiales de marca',
                    client_id: null,
                    prospect_name: 'Ana Rodríguez',
                    prospect_email: 'ana@coachpersonal.com',
                    services: {
                        items: [
                            { name: 'Logo y Identidad', quantity: 1, price: 900, description: 'Diseño de logo y manual de marca' },
                            { name: 'Materiales Impresos', quantity: 1, price: 400, description: 'Tarjetas, folletos, papelería' },
                            { name: 'Kit Redes Sociales', quantity: 1, price: 300, description: 'Templates para posts y stories' }
                        ]
                    },
                    pricing: { subtotal: 1600, taxes: 336, total: 1936 },
                    terms: 'Pago 60% inicio, 40% entrega final. 2 rondas de revisiones',
                    timeline: '4-5 semanas',
                    total_amount: 1936,
                    currency: 'EUR',
                    status: 'accepted',
                    valid_until: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    sent_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                    viewed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    responded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    user_id: user.id,
                    title: 'E-commerce - Tienda Artesanal',
                    description: 'Desarrollo de tienda online para productos artesanales con integración de pagos',
                    client_id: null,
                    prospect_name: 'Luis Fernández',
                    prospect_email: 'luis@artesanialocal.es',
                    services: {
                        items: [
                            { name: 'Desarrollo Shopify', quantity: 1, price: 1800, description: 'Setup completo de tienda' },
                            { name: 'Integración Pagos', quantity: 1, price: 600, description: 'PayPal, Stripe, transferencia' },
                            { name: 'Formación Usuario', quantity: 2, price: 150, description: 'Sesiones de 2h c/u' }
                        ]
                    },
                    pricing: { subtotal: 2700, taxes: 567, total: 3267 },
                    terms: 'Pago en 3 cuotas: 40% inicio, 30% desarrollo, 30% entrega',
                    timeline: '5-6 semanas',
                    total_amount: 3267,
                    currency: 'EUR',
                    status: 'draft',
                    valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                }
            ];

            const { error } = await supabase
                .from('proposals')
                .insert(sampleProposals);

            if (error) {
                console.error('Error creating sample proposals:', error);
                alert('Error al crear propuestas de ejemplo: ' + error.message);
                return;
            }

            alert('¡Propuestas de ejemplo creadas exitosamente!');
            await loadProposals();
            
        } catch (error) {
            console.error('Error creating sample proposals:', error);
            alert('Error al crear propuestas de ejemplo');
        }
    };

    const applyTemplate = async (template: any) => {
        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Configurar servicios y contenido según el tipo de template
            const getTemplateData = (templateId: string) => {
                switch (templateId) {
                    case 'web_development':
                        return {
                            title: 'Desarrollo de Sitio Web Profesional',
                            description: `Propuesta integral para el desarrollo de un sitio web moderno y profesional. Incluye diseño responsive, optimización SEO, integración con redes sociales y panel de administración. El proyecto se desarrollará utilizando las últimas tecnologías web para garantizar rendimiento, seguridad y escalabilidad.

Características principales:
• Diseño responsive para todos los dispositivos
• Optimización para motores de búsqueda (SEO)
• Integración con Google Analytics y herramientas de marketing
• Panel de administración intuitivo para gestión de contenido
• Formularios de contacto y suscripción
• Integración con redes sociales
• Certificado SSL y medidas de seguridad avanzadas
• Backup automático y sistema de actualizaciones`,
                            services: {
                                items: [
                                    { name: 'Análisis y Planificación', quantity: 1, price: 800, description: 'Análisis de requisitos, arquitectura de información, wireframes y planificación del proyecto' },
                                    { name: 'Diseño UX/UI Completo', quantity: 1, price: 1200, description: 'Diseño de la experiencia de usuario, mockups detallados, prototipo interactivo y guía de estilos' },
                                    { name: 'Desarrollo Frontend', quantity: 1, price: 1800, description: 'Maquetación responsive HTML5/CSS3, JavaScript avanzado, optimización de velocidad' },
                                    { name: 'Desarrollo Backend', quantity: 1, price: 1500, description: 'Panel de administración, base de datos, formularios, integración APIs' },
                                    { name: 'SEO y Optimización', quantity: 1, price: 600, description: 'Optimización SEO on-page, configuración Google Analytics, sitemap XML' },
                                    { name: 'Testing y Deploy', quantity: 1, price: 400, description: 'Testing completo, configuración hosting, dominio y certificado SSL' }
                                ]
                            },
                            terms: 'Pago: 40% al inicio, 30% en desarrollo, 30% al finalizar. Incluye 3 rondas de revisiones, 30 días de soporte post-lanzamiento gratuito, formación en el uso del panel de administración y documentación técnica completa.',
                            timeline: '6-8 semanas (incluye 2 semanas de revisiones y ajustes)'
                        };
                    
                    case 'design':
                        return {
                            title: 'Diseño de Identidad Visual Corporativa',
                            description: `Desarrollo completo de identidad visual profesional que refleje los valores y personalidad de tu marca. Incluye investigación de mercado, conceptualización creativa, diseño de logo, manual de marca y aplicaciones en diferentes formatos.

El proyecto incluye:
• Investigación de competencia y análisis de mercado
• Desarrollo conceptual y propuestas creativas
• Diseño de logotipo principal y variaciones
• Paleta de colores profesional y tipografías corporativas
• Manual de identidad visual completo
• Aplicaciones en papelería corporativa
• Kit digital para redes sociales y web
• Archivos en todos los formatos necesarios`,
                            services: {
                                items: [
                                    { name: 'Research y Estrategia', quantity: 1, price: 500, description: 'Investigación de mercado, análisis de competencia, brief creativo y estrategia de marca' },
                                    { name: 'Conceptualización', quantity: 1, price: 600, description: 'Desarrollo de conceptos creativos, bocetos iniciales y propuestas de dirección visual' },
                                    { name: 'Diseño de Logo', quantity: 1, price: 800, description: 'Diseño del logotipo principal, variaciones, construcción geométrica y versiones' },
                                    { name: 'Manual de Marca', quantity: 1, price: 400, description: 'Guía completa de uso, paleta cromática, tipografías y aplicaciones correctas' },
                                    { name: 'Papelería Corporativa', quantity: 1, price: 450, description: 'Tarjetas de visita, papel membrete, sobres, carpetas y elementos básicos' },
                                    { name: 'Kit Digital', quantity: 1, price: 350, description: 'Templates para redes sociales, firmas de email, avatares y elementos web' }
                                ]
                            },
                            terms: 'Pago: 50% al inicio, 25% en presentación de conceptos, 25% al finalizar. Incluye hasta 3 conceptos iniciales, 2 rondas de revisiones por concepto seleccionado, entrega de archivos fuente y documentación de uso.',
                            timeline: '4-5 semanas (investigación: 1 semana, conceptos: 2 semanas, desarrollo final: 2 semanas)'
                        };

                    case 'consulting':
                        return {
                            title: 'Consultoría en Transformación Digital',
                            description: `Servicio integral de consultoría para la transformación digital de tu empresa. Incluye auditoría completa de procesos actuales, estrategia personalizada, implementación de soluciones tecnológicas y acompañamiento en el cambio organizacional.

Metodología de trabajo:
• Diagnóstico inicial y mapeo de procesos
• Identificación de oportunidades de mejora
• Diseño de estrategia de transformación digital
• Plan de implementación por fases
• Capacitación del equipo interno
• Seguimiento y optimización continua
• Medición de resultados y ROI

Áreas de especialización: Marketing Digital, Automatización de Procesos, Customer Experience, Data Analytics, E-commerce, Presencia Digital.`,
                            services: {
                                items: [
                                    { name: 'Auditoría Digital Completa', quantity: 1, price: 1200, description: 'Análisis exhaustivo de presencia digital actual, procesos, competencia y oportunidades' },
                                    { name: 'Estrategia Personalizada', quantity: 1, price: 1500, description: 'Desarrollo de plan estratégico, roadmap de implementación, KPIs y métricas' },
                                    { name: 'Plan de Marketing Digital', quantity: 1, price: 1000, description: 'Estrategia de contenidos, redes sociales, SEO/SEM, email marketing y automation' },
                                    { name: 'Implementación Fase 1', quantity: 1, price: 2000, description: 'Puesta en marcha de primeras acciones: web, redes sociales, herramientas básicas' },
                                    { name: 'Formación del Equipo', quantity: 1, price: 800, description: 'Capacitación práctica del equipo interno en nuevas herramientas y procesos' },
                                    { name: 'Seguimiento (3 meses)', quantity: 1, price: 1200, description: 'Acompañamiento mensual, optimizaciones, reportes de progreso y ajustes' }
                                ]
                            },
                            terms: 'Pago: 30% al inicio, 40% al completar auditoría y estrategia, 30% al finalizar implementación. Incluye acceso a todas las herramientas recomendadas durante el proyecto, documentación completa, templates y 3 meses de soporte prioritario.',
                            timeline: '3-4 meses (auditoría: 2-3 semanas, estrategia: 2 semanas, implementación: 6-8 semanas, seguimiento: 3 meses)'
                        };

                    case 'marketing':
                        return {
                            title: 'Estrategia de Marketing Digital Integral',
                            description: `Plan completo de marketing digital diseñado para aumentar tu visibilidad online, generar leads cualificados y convertirlos en clientes. Incluye estrategia de contenidos, gestión de redes sociales, campañas publicitarias y análisis de resultados.

Servicios incluidos:
• Auditoría de presencia digital actual
• Estrategia de marketing personalizada
• Creación de contenido atractivo y relevante
• Gestión profesional de redes sociales
• Configuración de campañas publicitarias
• Email marketing y automatización
• Análisis y reportes mensuales detallados
• Optimización continua basada en datos`,
                            services: {
                                items: [
                                    { name: 'Auditoría y Estrategia', quantity: 1, price: 800, description: 'Análisis de situación actual, definición de objetivos, buyer personas y estrategia integral' },
                                    { name: 'Plan de Contenidos (3 meses)', quantity: 1, price: 1200, description: 'Calendario editorial, creación de posts, stories, artículos de blog y material gráfico' },
                                    { name: 'Gestión Redes Sociales', quantity: 3, price: 400, description: 'Gestión mensual de Instagram, Facebook y LinkedIn (3 meses)' },
                                    { name: 'Campañas Publicitarias', quantity: 1, price: 600, description: 'Configuración y optimización de campañas en Facebook Ads e Instagram Ads' },
                                    { name: 'Email Marketing Setup', quantity: 1, price: 350, description: 'Configuración de plataforma, automatizaciones, newsletters y secuencias' },
                                    { name: 'Reportes y Optimización', quantity: 3, price: 200, description: 'Informes mensuales detallados con métricas, insights y recomendaciones' }
                                ]
                            },
                            terms: 'Pago: 50% al inicio, 50% al segundo mes. El servicio incluye gestión durante 3 meses, reuniones de seguimiento quincenales, acceso a herramientas profesionales, y formación básica para continuidad interna.',
                            timeline: 'Proyecto de 3 meses (setup inicial: 1 semana, ejecución: 11 semanas)'
                        };

                    case 'maintenance':
                        return {
                            title: 'Mantenimiento y Soporte Web Mensual',
                            description: `Servicio mensual de mantenimiento integral para tu sitio web. Garantizamos seguridad, rendimiento óptimo, actualizaciones regulares y soporte técnico prioritario. Ideal para mantener tu presencia digital siempre actualizada y funcionando perfectamente.

Servicios mensuales incluidos:
• Actualizaciones de seguridad y sistema
• Backup automático semanal en la nube
• Monitoreo 24/7 de disponibilidad
• Optimización de velocidad y rendimiento
• Soporte técnico prioritario
• Pequeños ajustes de contenido incluidos
• Reportes mensuales de estado y métricas
• Certificado SSL y medidas de seguridad`,
                            services: {
                                items: [
                                    { name: 'Mantenimiento Técnico', quantity: 1, price: 200, description: 'Actualizaciones de sistema, plugins, temas y parches de seguridad mensuales' },
                                    { name: 'Backup y Seguridad', quantity: 1, price: 100, description: 'Backup semanal, monitoreo de malware, firewall y certificado SSL actualizado' },
                                    { name: 'Optimización Performance', quantity: 1, price: 80, description: 'Optimización de imágenes, cache, base de datos y velocidad de carga' },
                                    { name: 'Soporte Prioritario', quantity: 1, price: 120, description: 'Hasta 2 horas de soporte técnico, ajustes menores y consultas' },
                                    { name: 'Monitoreo y Reportes', quantity: 1, price: 50, description: 'Monitoreo 24/7, alertas automáticas y reporte mensual detallado' }
                                ]
                            },
                            terms: 'Servicio mensual recurrente con pago por adelantado. Incluye hasta 2 horas de trabajo adicional mensual, respuesta en menos de 24h en días laborables, acceso prioritario y descuento del 20% en desarrollos adicionales.',
                            timeline: 'Servicio continuo mensual (trabajos realizados durante todo el mes según necesidades)'
                        };

                    case 'ecommerce':
                        return {
                            title: 'Desarrollo de Tienda Online Profesional',
                            description: `Desarrollo completo de tienda online moderna y optimizada para conversión. Incluye diseño atractivo, integración de pagos, gestión de inventario, SEO específico para e-commerce y herramientas de marketing digital para impulsar tus ventas.

Características principales:
• Diseño responsive optimizado para conversión
• Catálogo de productos con búsqueda avanzada
• Carrito de compras y checkout optimizado
• Múltiples métodos de pago integrados
• Gestión completa de inventario y pedidos
• Sistema de cupones y descuentos
• Integración con shipping y logística
• SEO específico para e-commerce
• Analytics y seguimiento de conversiones
• Panel de administración intuitivo`,
                            services: {
                                items: [
                                    { name: 'Diseño y UX E-commerce', quantity: 1, price: 1500, description: 'Diseño especializado en conversión, páginas de producto optimizadas, checkout fluido' },
                                    { name: 'Desarrollo Tienda Online', quantity: 1, price: 2500, description: 'Desarrollo completo en plataforma profesional con todas las funcionalidades' },
                                    { name: 'Integración de Pagos', quantity: 1, price: 800, description: 'Configuración de PayPal, Stripe, transferencias y otros métodos de pago' },
                                    { name: 'SEO E-commerce', quantity: 1, price: 600, description: 'Optimización específica para tiendas online, rich snippets, schema markup' },
                                    { name: 'Configuración Logística', quantity: 1, price: 400, description: 'Integración con sistemas de envío, cálculo automático de costes' },
                                    { name: 'Formación y Documentación', quantity: 1, price: 300, description: 'Capacitación completa en gestión de la tienda y manual de usuario' }
                                ]
                            },
                            terms: 'Pago: 40% al inicio, 30% al completar desarrollo, 30% al finalizar configuración. Incluye 3 rondas de revisiones, migración de productos si es necesario, 60 días de soporte gratuito post-lanzamiento y formación completa.',
                            timeline: '8-10 semanas (diseño: 2 semanas, desarrollo: 4-5 semanas, configuración: 2 semanas, testing: 1 semana)'
                        };

                    default:
                        return {
                            title: 'Proyecto Personalizado',
                            description: 'Proyecto personalizado adaptado a las necesidades específicas del cliente.',
                            services: {
                                items: [
                                    { name: 'Servicio Principal', quantity: 1, price: 1000, description: 'Descripción del servicio principal a desarrollar' }
                                ]
                            },
                            terms: 'Términos y condiciones a definir según las características del proyecto.',
                            timeline: 'A determinar según alcance del proyecto'
                        };
                }
            };

            const templateData = getTemplateData(template.id);
            const subtotal = templateData.services.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const taxes = subtotal * 0.21; // 21% IVA
            const total = subtotal + taxes;

            // Crear propuesta basada en el template
            const newProposal = {
                user_id: user.id,
                title: templateData.title,
                description: templateData.description,
                client_id: null,
                prospect_name: null,
                prospect_email: null,
                services: templateData.services,
                pricing: { 
                    subtotal: subtotal, 
                    taxes: taxes, 
                    total: total 
                },
                terms: templateData.terms,
                timeline: templateData.timeline,
                total_amount: total,
                currency: 'EUR',
                status: 'draft',
                valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const { error } = await supabase
                .from('proposals')
                .insert([newProposal]);

            if (error) {
                console.error('Error creating proposal from template:', error);
                alert('Error al crear propuesta: ' + error.message);
                return;
            }

            alert(`¡Propuesta "${templateData.title}" creada exitosamente!\n\nYa puedes personalizarla y asignar un cliente.`);
            await loadProposals();
            
        } catch (error) {
            console.error('Error using template:', error);
            alert('Error al usar el template');
        }
    };

    const handleUseTemplate = (template: any) => {
        applyTemplate(template);
    };

    const editProposal = (proposal: Proposal) => {
        setEditingProposal(proposal);
        setShowEditModal(true);
    };

    const viewProposal = (proposal: Proposal) => {
        setViewingProposal(proposal);
        setShowViewModal(true);
    };

    const sendProposal = (proposal: Proposal) => {
        setSendingProposal(proposal);
        setShowSendModal(true);
    };

    const saveProposal = async (updatedProposal: Partial<Proposal>) => {
        try {
            if (!supabase || !editingProposal) return;

            // Calcular totales basándose en los servicios
            const services = editingProposal.services?.items || [];
            const subtotal = services.reduce((sum: number, service: any) => 
                sum + ((service.price || 0) * (service.quantity || 1)), 0
            );
            const taxes = subtotal * 0.21;
            const total = subtotal + taxes;

            // Preparar los datos para actualizar
            const dataToUpdate = {
                ...updatedProposal,
                services: editingProposal.services,
                pricing: {
                    subtotal: subtotal,
                    taxes: taxes,
                    total: total
                },
                total_amount: total
            };

            const { error } = await supabase
                .from('proposals')
                .update(dataToUpdate)
                .eq('id', editingProposal.id);

            if (error) {
                console.error('Error updating proposal:', error);
                alert('Error al guardar propuesta: ' + error.message);
                return;
            }

            alert('¡Propuesta guardada exitosamente!');
            setShowEditModal(false);
            setEditingProposal(null);
            await loadProposals();
            
        } catch (error) {
            console.error('Error saving proposal:', error);
            alert('Error al guardar propuesta');
        }
    };

    const createNewProposal = async () => {
        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Validar que hay al menos un servicio con datos válidos
            const validServices = newProposal.services.items.filter(service => 
                service.name?.trim() && (service.price || 0) > 0
            );

            if (validServices.length === 0) {
                alert('⚠️ Debe incluir al menos un servicio con nombre y precio válido');
                return;
            }

            // Calcular totales
            const subtotal = validServices.reduce((sum, service) => 
                sum + (service.price * service.quantity), 0
            );
            const taxes = subtotal * 0.21;
            const total = subtotal + taxes;

            // Crear la propuesta
            const proposalData = {
                user_id: user.id,
                title: newProposal.title.trim(),
                description: newProposal.description?.trim() || null,
                client_id: null,
                prospect_name: null,
                prospect_email: null,
                services: { items: validServices },
                pricing: { subtotal, taxes, total },
                terms: newProposal.terms?.trim() || null,
                timeline: newProposal.timeline?.trim() || null,
                total_amount: total,
                currency: 'EUR',
                status: 'draft',
                valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };

            const { error } = await supabase
                .from('proposals')
                .insert([proposalData]);

            if (error) {
                console.error('Error creating proposal:', error);
                alert('Error al crear propuesta: ' + error.message);
                return;
            }

            alert('¡Propuesta creada exitosamente!');
            setShowNewProposalModal(false);
            setNewProposal({
                title: '',
                description: '',
                terms: '',
                timeline: '',
                services: { items: [{ name: '', quantity: 1, price: 0, description: '' }] }
            });
            await loadProposals();
            
        } catch (error) {
            console.error('Error creating proposal:', error);
            alert('Error al crear propuesta');
        }
    };

    const sendProposalEmail = async (recipientEmail: string, recipientName: string) => {
        try {
            if (!sendingProposal) return;

            // Generar HTML de la propuesta
            const proposalHtml = generateProposalHTML(sendingProposal, recipientName);

            // Enviar email
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: recipientEmail,
                    subject: `Propuesta de ${sendingProposal.title} - Taskelio`,
                    html: proposalHtml,
                    userId: null
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            // Actualizar estado de la propuesta a 'sent'
            const { error } = await supabase
                .from('proposals')
                .update({
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                    prospect_name: recipientName,
                    prospect_email: recipientEmail
                })
                .eq('id', sendingProposal.id);

            if (error) {
                console.error('Error updating proposal status:', error);
            }

            alert('¡Propuesta enviada exitosamente!');
            setShowSendModal(false);
            setSendingProposal(null);
            await loadProposals();
            
        } catch (error) {
            console.error('Error sending proposal:', error);
            alert('Error al enviar propuesta: ' + (error as Error).message);
        }
    };

    const generateProposalHTML = (proposal: Proposal, recipientName: string) => {
        const services = proposal.services?.items || [];
        const subtotal = proposal.pricing?.subtotal || 0;
        const taxes = proposal.pricing?.taxes || 0;
        const total = proposal.pricing?.total || proposal.total_amount;

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Propuesta Comercial - Taskelio</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2d3748; max-width: 900px; margin: 0 auto; padding: 0; background: #f7fafc; }
                    .container { background: white; margin: 20px; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
                    .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 40px 30px; text-align: center; position: relative; }
                    .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="30" cy="30" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="70" cy="70" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="90" cy="90" r="1" fill="rgba(255,255,255,0.03)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>'); }
                    .logo { font-size: 32px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; position: relative; z-index: 1; }
                    .tagline { font-size: 16px; opacity: 0.95; font-weight: 300; position: relative; z-index: 1; }
                    .content { padding: 40px 30px; }
                    .section { margin-bottom: 35px; }
                    .section-title { color: #059669; font-size: 22px; font-weight: 700; margin-bottom: 20px; border-bottom: 3px solid #e5e7eb; padding-bottom: 8px; display: flex; align-items: center; gap: 10px; }
                    .intro { font-size: 16px; line-height: 1.7; margin-bottom: 25px; background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%); padding: 25px; border-radius: 10px; border-left: 4px solid #059669; }
                    .intro strong { color: #059669; }
                    .service-item { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 20px; margin-bottom: 15px; border-radius: 10px; border-left: 5px solid #059669; transition: transform 0.2s; }
                    .service-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
                    .service-name { font-weight: 700; font-size: 17px; color: #1a202c; }
                    .service-price { color: #059669; font-weight: 700; font-size: 17px; }
                    .service-desc { color: #4a5568; font-size: 14px; line-height: 1.5; margin-top: 5px; }
                    .pricing-table { background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%); padding: 25px; border-radius: 12px; border: 2px solid #a7f3d0; }
                    .pricing-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; font-size: 16px; }
                    .pricing-subtotal { border-top: 1px solid #d1fae5; padding-top: 15px; }
                    .pricing-total { border-top: 3px solid #059669; padding-top: 15px; font-weight: 800; font-size: 20px; color: #059669; }
                    .terms-section { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); padding: 25px; border-radius: 12px; border-left: 5px solid #f59e0b; }
                    .terms-title { font-weight: 700; color: #92400e; margin-bottom: 15px; font-size: 18px; }
                    .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
                    .terms-item { background: rgba(255, 255, 255, 0.7); padding: 15px; border-radius: 8px; }
                    .terms-label { font-weight: 600; color: #92400e; font-size: 14px; margin-bottom: 5px; }
                    .terms-value { color: #451a03; font-weight: 500; }
                    .guarantee { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6; margin-top: 20px; }
                    .cta { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-top: 35px; position: relative; }
                    .cta::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain2" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="60" cy="40" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain2)"/></svg>'); border-radius: 12px; }
                    .cta h3 { position: relative; z-index: 1; font-size: 24px; margin-bottom: 10px; font-weight: 700; }
                    .cta p { position: relative; z-index: 1; margin-bottom: 20px; font-size: 16px; opacity: 0.95; }
                    .button { display: inline-block; background: white; color: #059669; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 700; margin: 10px 5px; position: relative; z-index: 1; transition: all 0.3s; font-size: 16px; }
                    .button:hover { background: #f0fdfa; transform: translateY(-2px); }
                    .footer { text-align: center; margin-top: 40px; padding: 25px; color: #6b7280; font-size: 13px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
                    .highlight { background: linear-gradient(135deg, #fef3c7, #fed7aa); padding: 2px 6px; border-radius: 4px; font-weight: 600; }
                    @media (max-width: 600px) {
                        .container { margin: 10px; }
                        .content { padding: 20px 15px; }
                        .header { padding: 30px 20px; }
                        .terms-grid { grid-template-columns: 1fr; }
                        .service-header { flex-direction: column; align-items: flex-start; }
                        .service-price { margin-top: 8px; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">✨ Taskelio</div>
                        <div class="tagline">Tu CRM ligero para freelancers | Propuesta Comercial Personalizada</div>
                    </div>

                    <div class="content">
                        <div class="section">
                            <div class="intro">
                                <h2 style="margin-top: 0; color: #059669;">Estimado/a ${recipientName},</h2>
                                <p>Es un placer presentarte esta <strong>propuesta comercial personalizada</strong> para <span class="highlight">${proposal.title}</span>. Como profesional freelance especializado, he diseñado una solución integral que se adapta perfectamente a tus necesidades específicas.</p>
                                <p>${proposal.description || 'He analizado cuidadosamente tus requerimientos y objetivos para ofrecerte la mejor propuesta de valor.'}</p>
                                <p><strong>¿Por qué elegir Taskelio?</strong> Trabajamos con un enfoque personalizado, comunicación directa y entregas de calidad premium. Tu éxito es nuestra prioridad.</p>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">🎯 Servicios Incluidos en tu Proyecto</div>
                            <p style="color: #4a5568; margin-bottom: 20px;">Cada servicio ha sido cuidadosamente seleccionado para garantizar el máximo impacto y resultados excepcionales:</p>
                            ${services.map((service: any) => `
                                <div class="service-item">
                                    <div class="service-header">
                                        <span class="service-name">${service.name}</span>
                                        <span class="service-price">${formatCurrency(service.price * service.quantity)}</span>
                                    </div>
                                    ${service.description ? `<div class="service-desc">📋 ${service.description}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>

                        <div class="section">
                            <div class="section-title">💰 Inversión Total del Proyecto</div>
                            <p style="color: #4a5568; margin-bottom: 20px;">Estructura de precios transparente y sin sorpresas:</p>
                            <div class="pricing-table">
                                <div class="pricing-row">
                                    <span><strong>Subtotal de Servicios:</strong></span>
                                    <span>${formatCurrency(subtotal)}</span>
                                </div>
                                <div class="pricing-row">
                                    <span>IVA (21% - España):</span>
                                    <span>${formatCurrency(taxes)}</span>
                                </div>
                                <div class="pricing-row pricing-total">
                                    <span><strong>INVERSIÓN TOTAL:</strong></span>
                                    <span>${formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">📋 Términos y Condiciones del Proyecto</div>
                            <div class="terms-section">
                                <div class="terms-title">Condiciones Comerciales Detalladas:</div>
                                <div class="terms-grid">
                                    <div class="terms-item">
                                        <div class="terms-label">💳 FORMA DE PAGO</div>
                                        <div class="terms-value">${proposal.terms || 'Pago 50% inicio, 50% entrega final'}</div>
                                    </div>
                                    <div class="terms-item">
                                        <div class="terms-label">⏰ TIEMPO DE ENTREGA</div>
                                        <div class="terms-value">${proposal.timeline || '3-4 semanas'}</div>
                                    </div>
                                    <div class="terms-item">
                                        <div class="terms-label">🔄 REVISIONES</div>
                                        <div class="terms-value">Hasta 3 rondas incluidas</div>
                                    </div>
                                    <div class="terms-item">
                                        <div class="terms-label">📞 COMUNICACIÓN</div>
                                        <div class="terms-value">Actualizaciones semanales + acceso directo</div>
                                    </div>
                                </div>
                                <div style="margin-top: 15px; font-size: 14px; color: #92400e;">
                                    <strong>📅 Validez de la Propuesta:</strong> Esta propuesta es válida hasta el <strong>${formatDate(proposal.valid_until || '')}</strong>.<br>
                                    <strong>🛡️ Garantía:</strong> 30 días de soporte post-entrega incluido sin coste adicional.
                                </div>
                                
                                <div class="guarantee">
                                    <strong style="color: #1e40af;">🏆 Garantía de Satisfacción:</strong><br>
                                    Si no estás completamente satisfecho/a con el resultado, realizaremos los ajustes necesarios sin coste adicional hasta lograr tu completa satisfacción.
                                </div>
                            </div>
                        </div>

                        <div class="cta">
                            <h3>🚀 ¿Listo para comenzar tu proyecto?</h3>
                            <p>Estoy aquí para resolver cualquier duda y adaptar esta propuesta a tus necesidades específicas. Tu éxito es mi compromiso.</p>
                            <p style="font-size: 18px; font-weight: 600; margin: 20px 0;"><strong>¡Convirtamos tu visión en realidad!</strong></p>
                            <a href="mailto:${userEmail}?subject=✅ ACEPTO la propuesta: ${proposal.title}&body=Hola,%0A%0AHe revisado tu propuesta y me interesa proceder.%0A%0A¿Cuándo podemos empezar?%0A%0ASaludos,%0A${recipientName}" class="button">✅ ACEPTAR PROPUESTA</a>
                            <a href="mailto:${userEmail}?subject=❓ Consulta sobre: ${proposal.title}" class="button">❓ HACER CONSULTA</a>
                        </div>

                        <div class="footer">
                            <p><strong>Taskelio</strong> - Tu CRM ligero para freelancers</p>
                            <p>Propuesta generada el ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p>Contacto directo: ${userEmail}</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-blue-100 text-blue-700';
            case 'sent': return 'bg-orange-100 text-orange-700';
            case 'viewed': return 'bg-purple-100 text-purple-700';
            case 'accepted': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'expired': return 'bg-slate-100 text-slate-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft': return Edit3;
            case 'sent': return Send;
            case 'viewed': return Eye;
            case 'accepted': return CheckCircle;
            case 'rejected': return XCircle;
            case 'expired': return Clock;
            default: return FileText;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    useEffect(() => {
        loadProposals();
        loadClients();
    }, []);

    useEffect(() => {
        filterProposals();
    }, [searchQuery, selectedStatus, proposals]);

    if (loading) {
        return (
            <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <Sidebar userEmail={userEmail} onLogout={handleLogout} />
                <div className="flex-1 ml-56 overflow-hidden">
                    <div className="h-full overflow-y-auto">
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-600">Cargando propuestas...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <div className="flex-1 ml-56 overflow-hidden">
                <div className="h-full overflow-y-auto">
                    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/90 to-indigo-100/80 backdrop-blur-3xl">
                        <div className="container mx-auto px-6 py-8">
                            
                            {/* Header Premium */}
                            <div className="mb-8">
                                <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl shadow-indigo-500/10 p-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                                    <Presentation className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
                                                        Propuestas - Taskelio
                                                    </h1>
                                                    <p className="text-slate-600 font-medium">
                                                        Tu CRM ligero para freelancers: Convierte leads en clientes con propuestas profesionales
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={createSampleProposals}
                                                variant="outline"
                                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                            >
                                                <FileText className="w-5 h-5 mr-2" />
                                                Demo Data
                                            </Button>
                                            <Button
                                                onClick={() => setShowNewProposalModal(true)}
                                                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transform transition-all duration-200"
                                            >
                                                <Plus className="w-5 h-5 mr-2" />
                                                Nueva Propuesta
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Dashboard */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <Card className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Total Propuestas</p>
                                                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Tasa Conversión</p>
                                                <p className="text-3xl font-bold text-green-600">{stats.conversion_rate}%</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                                                <TrendingUp className="w-6 h-6 text-green-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Valor Total</p>
                                                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.total_value)}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                                                <DollarSign className="w-6 h-6 text-emerald-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Valor Ganado</p>
                                                <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.won_value)}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                                                <CheckCircle className="w-6 h-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Filters and Search */}
                            <div className="mb-8">
                                <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl p-6">
                                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                                        
                                        {/* Search */}
                                        <div className="flex-1 max-w-md">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                                <Input
                                                    type="text"
                                                    placeholder="Buscar propuestas..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 bg-white/80 border-slate-200/60 focus:border-emerald-400 focus:ring-emerald-400/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Status Filters */}
                                        <div className="flex items-center gap-2 overflow-x-auto">
                                            {statusFilters.map((filter) => {
                                                const IconComponent = filter.icon;
                                                const isActive = selectedStatus === filter.id;
                                                
                                                return (
                                                    <button
                                                        key={filter.id}
                                                        onClick={() => setSelectedStatus(filter.id)}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                                                            isActive
                                                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                                                                : 'bg-white/80 text-slate-700 hover:bg-white hover:shadow-md'
                                                        }`}
                                                    >
                                                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : filter.color}`} />
                                                        {filter.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Proposal Templates */}
                            {filteredProposals.length === 0 && proposals.length === 0 && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">Templates de Propuestas</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {proposalTemplates.map((template) => {
                                            const IconComponent = template.icon;
                                            
                                            return (
                                                <Card key={template.id} className="group bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-12 h-12 ${template.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                                    <IconComponent className="w-6 h-6 text-white" />
                                                                </div>
                                                                <div>
                                                                    <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                                                                        {template.name}
                                                                    </CardTitle>
                                                                    <p className="text-sm text-slate-600">
                                                                        {template.conversionRate} conversión
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="text-right">
                                                                <p className="text-sm font-semibold text-emerald-600">{template.estimatedValue}</p>
                                                                <p className="text-xs text-slate-500">Valor promedio</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <p className="text-sm text-slate-600 mb-4">
                                                            {template.description}
                                                        </p>
                                                    </CardHeader>
                                                    
                                                    <CardContent className="pt-0">
                                                        <Button
                                                            onClick={() => handleUseTemplate(template)}
                                                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                                            size="sm"
                                                        >
                                                            <Zap className="w-4 h-4 mr-2" />
                                                            Usar Template
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Existing Proposals */}
                            {filteredProposals.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-slate-900">Tus Propuestas</h2>
                                    
                                    {filteredProposals.map((proposal) => {
                                        const StatusIcon = getStatusIcon(proposal.status);
                                        
                                        return (
                                            <Card key={proposal.id} className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center shadow-lg">
                                                                <StatusIcon className="w-6 h-6 text-emerald-600" />
                                                            </div>
                                                            
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="text-lg font-bold text-slate-900">{proposal.title}</h3>
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(proposal.status)}`}>
                                                                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                                                                    <span>Cliente: {proposal.prospect_name || 'Sin asignar'}</span>
                                                                    <span>Valor: {formatCurrency(proposal.total_amount)}</span>
                                                                    <span>Creado: {formatDate(proposal.created_at)}</span>
                                                                </div>
                                                                
                                                                {proposal.description && (
                                                                    <p className="text-sm text-slate-600 line-clamp-1">{proposal.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                onClick={() => viewProposal(proposal)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-slate-200 hover:bg-slate-50"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            
                                                            <Button
                                                                onClick={() => duplicateProposal(proposal)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-slate-200 hover:bg-slate-50"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </Button>
                                                            
                                                            <Button
                                                                onClick={() => editProposal(proposal)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-slate-200 hover:bg-slate-50"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </Button>
                                                            
                                                            {proposal.status === 'draft' && (
                                                                <Button
                                                                    onClick={() => sendProposal(proposal)}
                                                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                                                                    size="sm"
                                                                >
                                                                    <Send className="w-4 h-4 mr-2" />
                                                                    Enviar
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Empty State */}
                            {filteredProposals.length === 0 && proposals.length > 0 && (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Presentation className="w-12 h-12 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        No se encontraron propuestas
                                    </h3>
                                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                        Intenta ajustar los filtros de búsqueda o crear una nueva propuesta
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Envío */}
            {showSendModal && sendingProposal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">📧 Enviar Propuesta</h3>
                        
                        <div className="space-y-5">
                            {/* Selector de Cliente */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    🎯 Seleccionar Cliente
                                </label>
                                <select
                                    id="clientSelector"
                                    onChange={(e) => {
                                        const clientId = e.target.value;
                                        const client = clients.find(c => c.id === clientId);
                                        setSelectedClient(client);
                                        
                                        // Auto-rellenar email
                                        const emailField = document.getElementById('recipientEmail') as HTMLInputElement;
                                        if (client && emailField) {
                                            emailField.value = client.email;
                                        }
                                    }}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                >
                                    <option value="">-- Selecciona un cliente --</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} ({client.company || 'Particular'})
                                        </option>
                                    ))}
                                </select>
                                {clients.length === 0 && (
                                    <p className="text-sm text-amber-600 mt-2">
                                        ⚠️ No tienes clientes registrados. Ve a la sección Clientes para añadir algunos.
                                    </p>
                                )}
                            </div>

                            {/* Email (auto-rellenado) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    ✉️ Email de Destino
                                </label>
                                <input
                                    type="email"
                                    id="recipientEmail"
                                    placeholder="Se completará automáticamente al seleccionar cliente"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                                    readOnly
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Este campo se completa automáticamente al seleccionar un cliente
                                </p>
                            </div>

                            {/* Preview de la propuesta */}
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-emerald-800">📋 Resumen de la Propuesta</span>
                                </div>
                                <div className="text-sm text-emerald-700 space-y-1">
                                    <p><strong>Proyecto:</strong> {sendingProposal.title}</p>
                                    <p><strong>Valor Total:</strong> {formatCurrency(sendingProposal.total_amount)}</p>
                                    <p><strong>Servicios:</strong> {sendingProposal.services?.items?.length || 0} incluidos</p>
                                    <p><strong>Plazo:</strong> {sendingProposal.timeline}</p>
                                </div>
                            </div>

                            {/* Información adicional */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-blue-600">ℹ️</span>
                                    <span className="text-sm font-medium text-blue-800">Información del Envío</span>
                                </div>
                                <div className="text-xs text-blue-700 space-y-1">
                                    <p>• La propuesta se enviará con diseño profesional Taskelio</p>
                                    <p>• Incluye todos los detalles de servicios y precios</p>
                                    <p>• El cliente podrá responder directamente a tu email</p>
                                    <p>• El estado se actualizará automáticamente a "Enviada"</p>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={() => {
                                        setShowSendModal(false);
                                        setSelectedClient(null);
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    ❌ Cancelar
                                </Button>
                                <Button
                                    onClick={() => {
                                        const clientSelector = document.getElementById('clientSelector') as HTMLSelectElement;
                                        const recipientEmail = (document.getElementById('recipientEmail') as HTMLInputElement)?.value;
                                        
                                        if (!clientSelector.value || !recipientEmail) {
                                            alert('⚠️ Por favor selecciona un cliente');
                                            return;
                                        }
                                        
                                        const selectedClient = clients.find(c => c.id === clientSelector.value);
                                        if (!selectedClient) {
                                            alert('⚠️ Cliente no encontrado');
                                            return;
                                        }
                                        
                                        sendProposalEmail(recipientEmail, selectedClient.name);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                                    disabled={clients.length === 0}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    🚀 Enviar Propuesta
                                </Button>
                            </div>

                            {clients.length === 0 && (
                                <div className="text-center text-sm text-slate-500 mt-4">
                                    💡 <strong>Tip:</strong> Primero añade algunos clientes en la sección "Clientes" para poder enviar propuestas
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Vista (Solo Lectura) */}
            {showViewModal && viewingProposal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                👁️ Vista de Propuesta
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewingProposal.status)}`}>
                                {viewingProposal.status.charAt(0).toUpperCase() + viewingProposal.status.slice(1)}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Columna Izquierda - Información Principal */}
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                        📝 Título del Proyecto
                                    </h4>
                                    <p className="text-slate-700 font-medium">{viewingProposal.title}</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                        📋 Descripción del Proyecto
                                    </h4>
                                    <div className="text-slate-700 text-sm whitespace-pre-line max-h-40 overflow-y-auto">
                                        {viewingProposal.description || 'Sin descripción'}
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                        📄 Términos y Condiciones
                                    </h4>
                                    <div className="text-slate-700 text-sm whitespace-pre-line">
                                        {viewingProposal.terms || 'Sin términos definidos'}
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                        ⏰ Tiempo de Entrega
                                    </h4>
                                    <p className="text-slate-700 font-medium">{viewingProposal.timeline || 'Sin definir'}</p>
                                </div>
                            </div>

                            {/* Columna Derecha - Información Comercial */}
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                        👤 Información del Cliente
                                    </h4>
                                    <div className="space-y-2 text-sm text-blue-700">
                                        <p><strong>📧 Nombre:</strong> {viewingProposal.prospect_name || 'Sin asignar'}</p>
                                        <p><strong>✉️ Email:</strong> {viewingProposal.prospect_email || 'Sin asignar'}</p>
                                        <p><strong>📊 Estado:</strong> <span className="capitalize">{viewingProposal.status}</span></p>
                                        {viewingProposal.sent_at && (
                                            <p><strong>📅 Enviada:</strong> {formatDate(viewingProposal.sent_at)}</p>
                                        )}
                                        {viewingProposal.viewed_at && (
                                            <p><strong>👁️ Vista:</strong> {formatDate(viewingProposal.viewed_at)}</p>
                                        )}
                                        {viewingProposal.responded_at && (
                                            <p><strong>💬 Respuesta:</strong> {formatDate(viewingProposal.responded_at)}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                    <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                                        💰 Resumen Financiero
                                    </h4>
                                    <div className="space-y-2 text-sm text-emerald-700">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span className="font-semibold">{formatCurrency(viewingProposal.pricing?.subtotal || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>IVA (21%):</span>
                                            <span className="font-semibold">{formatCurrency(viewingProposal.pricing?.taxes || 0)}</span>
                                        </div>
                                        <div className="border-t border-emerald-200 pt-2 flex justify-between font-bold text-base">
                                            <span>Total:</span>
                                            <span className="text-emerald-600">{formatCurrency(viewingProposal.total_amount)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                        🎯 Servicios Incluidos
                                    </h4>
                                    <div className="space-y-2 text-sm text-amber-700 max-h-64 overflow-y-auto">
                                        {viewingProposal.services?.items?.map((service: any, index: number) => (
                                            <div key={index} className="bg-white p-3 rounded border border-amber-200">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-medium">{service.name}</span>
                                                    <span className="font-semibold text-emerald-600">
                                                        {formatCurrency(service.price * service.quantity)}
                                                    </span>
                                                </div>
                                                {service.description && (
                                                    <p className="text-xs text-amber-600 leading-relaxed">{service.description}</p>
                                                )}
                                            </div>
                                        )) || <p className="text-amber-600">No hay servicios definidos</p>}
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                        📅 Información Adicional
                                    </h4>
                                    <div className="space-y-1 text-xs text-slate-600">
                                        <p><strong>Creada:</strong> {formatDate(viewingProposal.created_at)}</p>
                                        <p><strong>Válida hasta:</strong> {formatDate(viewingProposal.valid_until || '')}</p>
                                        <p><strong>Moneda:</strong> {viewingProposal.currency}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex gap-3 pt-6 border-t border-slate-200 mt-6">
                            <Button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setViewingProposal(null);
                                }}
                                variant="outline"
                                className="flex-1"
                            >
                                ❌ Cerrar
                            </Button>
                            
                            <Button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setEditingProposal(viewingProposal);
                                    setShowEditModal(true);
                                    setViewingProposal(null);
                                }}
                                variant="outline"
                                className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                                ✏️ Editar
                            </Button>
                            
                            {viewingProposal.status === 'draft' && (
                                <Button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setSendingProposal(viewingProposal);
                                        setShowSendModal(true);
                                        setViewingProposal(null);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                                >
                                    📧 Enviar
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edición */}
            {showEditModal && editingProposal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
                            ✏️ Editar Propuesta
                        </h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Columna Izquierda - Datos Básicos */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        📝 Título de la Propuesta
                                    </label>
                                    <input
                                        type="text"
                                        id="editTitle"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        defaultValue={editingProposal.title}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        📋 Descripción del Proyecto
                                    </label>
                                    <textarea
                                        id="editDescription"
                                        rows={8}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        defaultValue={editingProposal.description}
                                        placeholder="Descripción detallada del proyecto, objetivos, características principales..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        📄 Términos y Condiciones
                                    </label>
                                    <textarea
                                        id="editTerms"
                                        rows={4}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        defaultValue={editingProposal.terms}
                                        placeholder="Forma de pago, condiciones, garantías, revisiones incluidas..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ⏰ Tiempo de Entrega
                                    </label>
                                    <input
                                        type="text"
                                        id="editTimeline"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        defaultValue={editingProposal.timeline}
                                        placeholder="Ej: 6-8 semanas, 3 meses, etc."
                                    />
                                </div>
                            </div>

                            {/* Columna Derecha - Información de Asignación */}
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                        ℹ️ Información de Envío
                                    </h4>
                                    <div className="space-y-2 text-sm text-blue-700">
                                        <p><strong>📧 Cliente:</strong> {editingProposal.prospect_name || 'Sin asignar'}</p>
                                        <p><strong>✉️ Email:</strong> {editingProposal.prospect_email || 'Sin asignar'}</p>
                                        <p><strong>📊 Estado:</strong> <span className="capitalize">{editingProposal.status}</span></p>
                                        {editingProposal.sent_at && (
                                            <p><strong>📅 Enviada:</strong> {formatDate(editingProposal.sent_at)}</p>
                                        )}
                                    </div>
                                    <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                                        <p className="text-xs text-blue-600">
                                            💡 <strong>Nota:</strong> El cliente y email se asignan al momento del envío. 
                                            Usa el botón "Enviar" para seleccionar el destinatario.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                    <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                                        💰 Resumen Financiero
                                    </h4>
                                    <div className="space-y-2 text-sm text-emerald-700">
                                        {(() => {
                                            const services = editingProposal.services?.items || [];
                                            const subtotal = services.reduce((sum: number, service: any) => 
                                                sum + ((service.price || 0) * (service.quantity || 1)), 0
                                            );
                                            const taxes = subtotal * 0.21;
                                            const total = subtotal + taxes;
                                            
                                            return (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span>Subtotal:</span>
                                                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>IVA (21%):</span>
                                                        <span className="font-semibold">{formatCurrency(taxes)}</span>
                                                    </div>
                                                    <div className="border-t border-emerald-200 pt-2 flex justify-between font-bold">
                                                        <span>Total:</span>
                                                        <span className="text-emerald-600">{formatCurrency(total)}</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                        <p className="text-xs mt-2">
                                            💡 Los precios se calculan automáticamente según los servicios incluidos
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                        🎯 Servicios y Precios
                                        <Button
                                            onClick={() => {
                                                const services = editingProposal.services?.items || [];
                                                services.push({ name: '', quantity: 1, price: 0, description: '' });
                                                setEditingProposal({
                                                    ...editingProposal,
                                                    services: { items: services }
                                                });
                                            }}
                                            size="sm"
                                            className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2 py-1"
                                        >
                                            ➕ Añadir
                                        </Button>
                                    </h4>
                                    
                                    <div className="space-y-3">
                                        {(editingProposal.services?.items || []).map((service: any, index: number) => (
                                            <div key={index} className="bg-white p-3 rounded-lg border border-amber-200">
                                                <div className="grid grid-cols-1 gap-2">
                                                    <div className="flex gap-2 items-start">
                                                        <div className="flex-1">
                                                            <label className="text-xs text-slate-600 mb-1 block">Servicio</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Nombre del servicio"
                                                                defaultValue={service.name}
                                                                onChange={(e) => {
                                                                    const services = [...(editingProposal.services?.items || [])];
                                                                    services[index] = { ...services[index], name: e.target.value };
                                                                    setEditingProposal({
                                                                        ...editingProposal,
                                                                        services: { items: services }
                                                                    });
                                                                }}
                                                                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                            />
                                                        </div>
                                                        <Button
                                                            onClick={() => {
                                                                const services = editingProposal.services?.items || [];
                                                                services.splice(index, 1);
                                                                setEditingProposal({
                                                                    ...editingProposal,
                                                                    services: { items: services }
                                                                });
                                                            }}
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:bg-red-50 px-2 py-1.5 mt-5"
                                                        >
                                                            🗑️
                                                        </Button>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="text-xs text-slate-600 mb-1 block">Descripción</label>
                                                        <textarea
                                                            rows={2}
                                                            placeholder="Descripción del servicio"
                                                            defaultValue={service.description}
                                                            onChange={(e) => {
                                                                const services = [...(editingProposal.services?.items || [])];
                                                                services[index] = { ...services[index], description: e.target.value };
                                                                setEditingProposal({
                                                                    ...editingProposal,
                                                                    services: { items: services }
                                                                });
                                                            }}
                                                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <label className="text-xs text-slate-600 mb-1 block">Cantidad</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                step="1"
                                                                placeholder="1"
                                                                defaultValue={service.quantity}
                                                                onChange={(e) => {
                                                                    const services = [...(editingProposal.services?.items || [])];
                                                                    services[index] = { ...services[index], quantity: parseInt(e.target.value) || 1 };
                                                                    setEditingProposal({
                                                                        ...editingProposal,
                                                                        services: { items: services }
                                                                    });
                                                                }}
                                                                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-xs text-slate-600 mb-1 block">Precio (€)</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                defaultValue={service.price}
                                                                onChange={(e) => {
                                                                    const services = [...(editingProposal.services?.items || [])];
                                                                    services[index] = { ...services[index], price: parseFloat(e.target.value) || 0 };
                                                                    setEditingProposal({
                                                                        ...editingProposal,
                                                                        services: { items: services }
                                                                    });
                                                                }}
                                                                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-xs text-slate-600 mb-1 block">Total</label>
                                                            <div className="bg-emerald-50 px-2 py-1.5 text-sm rounded border font-semibold text-emerald-700">
                                                                {formatCurrency((service.price || 0) * (service.quantity || 1))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {(!editingProposal.services?.items || editingProposal.services.items.length === 0) && (
                                            <div className="text-center py-6 text-amber-600">
                                                <p className="text-sm">🔧 No hay servicios definidos</p>
                                                <p className="text-xs mt-1">Haz clic en "➕ Añadir" para crear tu primer servicio</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-3 p-2 bg-amber-100 rounded">
                                        <p className="text-xs text-amber-600">
                                            💡 <strong>Consejo:</strong> Los precios se actualizan automáticamente. Puedes modificar servicios, cantidades y precios en tiempo real.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 pt-6 border-t border-slate-200 mt-6">
                            <Button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingProposal(null);
                                }}
                                variant="outline"
                                className="flex-1"
                            >
                                ❌ Cancelar
                            </Button>
                            <Button
                                onClick={() => {
                                    const title = (document.getElementById('editTitle') as HTMLInputElement)?.value;
                                    const description = (document.getElementById('editDescription') as HTMLTextAreaElement)?.value;
                                    const terms = (document.getElementById('editTerms') as HTMLTextAreaElement)?.value;
                                    const timeline = (document.getElementById('editTimeline') as HTMLInputElement)?.value;
                                    
                                    if (!title?.trim()) {
                                        alert('⚠️ El título es obligatorio');
                                        return;
                                    }
                                    
                                    const services = editingProposal?.services?.items || [];
                                    if (services.length === 0) {
                                        alert('⚠️ Debe incluir al menos un servicio');
                                        return;
                                    }
                                    
                                    // Validar que todos los servicios tengan nombre y precio
                                    const incompleteServices = services.some((service: any) => 
                                        !service.name?.trim() || (service.price || 0) <= 0
                                    );
                                    
                                    if (incompleteServices) {
                                        alert('⚠️ Todos los servicios deben tener nombre y precio válido');
                                        return;
                                    }
                                    
                                    saveProposal({
                                        title: title.trim(),
                                        description: description?.trim(),
                                        terms: terms?.trim(),
                                        timeline: timeline?.trim()
                                    });
                                }}
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                            >
                                💾 Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Nueva Propuesta */}
            {showNewProposalModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
                            ✨ Crear Nueva Propuesta
                        </h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Columna Izquierda - Datos Básicos */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        📝 Título de la Propuesta *
                                    </label>
                                    <input
                                        type="text"
                                        value={newProposal.title}
                                        onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Ej: Desarrollo de Sitio Web Profesional"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        📋 Descripción del Proyecto
                                    </label>
                                    <textarea
                                        rows={6}
                                        value={newProposal.description}
                                        onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Descripción detallada del proyecto, objetivos, características principales..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        📄 Términos y Condiciones
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={newProposal.terms}
                                        onChange={(e) => setNewProposal({...newProposal, terms: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Forma de pago, condiciones, garantías, revisiones incluidas..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ⏰ Tiempo de Entrega
                                    </label>
                                    <input
                                        type="text"
                                        value={newProposal.timeline}
                                        onChange={(e) => setNewProposal({...newProposal, timeline: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Ej: 6-8 semanas, 3 meses, etc."
                                    />
                                </div>
                            </div>

                            {/* Columna Derecha - Servicios y Resumen */}
                            <div className="space-y-4">
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                        🎯 Servicios y Precios *
                                        <Button
                                            onClick={() => {
                                                const services = [...newProposal.services.items];
                                                services.push({ name: '', quantity: 1, price: 0, description: '' });
                                                setNewProposal({
                                                    ...newProposal,
                                                    services: { items: services }
                                                });
                                            }}
                                            size="sm"
                                            className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2 py-1"
                                        >
                                            ➕ Añadir
                                        </Button>
                                    </h4>
                                    
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {newProposal.services.items.map((service, index) => (
                                            <div key={index} className="bg-white p-3 rounded-lg border border-amber-200">
                                                <div className="grid grid-cols-1 gap-2">
                                                    <div className="flex gap-2 items-start">
                                                        <div className="flex-1">
                                                            <label className="text-xs text-slate-600 mb-1 block">Servicio</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Nombre del servicio"
                                                                value={service.name}
                                                                onChange={(e) => {
                                                                    const services = [...newProposal.services.items];
                                                                    services[index] = { ...services[index], name: e.target.value };
                                                                    setNewProposal({
                                                                        ...newProposal,
                                                                        services: { items: services }
                                                                    });
                                                                }}
                                                                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                            />
                                                        </div>
                                                        {newProposal.services.items.length > 1 && (
                                                            <Button
                                                                onClick={() => {
                                                                    const services = newProposal.services.items.filter((_, i) => i !== index);
                                                                    setNewProposal({
                                                                        ...newProposal,
                                                                        services: { items: services }
                                                                    });
                                                                }}
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 hover:bg-red-50 px-2 py-1.5 mt-5"
                                                            >
                                                                🗑️
                                                            </Button>
                                                        )}
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="text-xs text-slate-600 mb-1 block">Descripción</label>
                                                        <textarea
                                                            rows={2}
                                                            placeholder="Descripción del servicio"
                                                            value={service.description}
                                                            onChange={(e) => {
                                                                const services = [...newProposal.services.items];
                                                                services[index] = { ...services[index], description: e.target.value };
                                                                setNewProposal({
                                                                    ...newProposal,
                                                                    services: { items: services }
                                                                });
                                                            }}
                                                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <label className="text-xs text-slate-600 mb-1 block">Cantidad</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                step="1"
                                                                placeholder="1"
                                                                value={service.quantity}
                                                                onChange={(e) => {
                                                                    const services = [...newProposal.services.items];
                                                                    services[index] = { ...services[index], quantity: parseInt(e.target.value) || 1 };
                                                                    setNewProposal({
                                                                        ...newProposal,
                                                                        services: { items: services }
                                                                    });
                                                                }}
                                                                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-xs text-slate-600 mb-1 block">Precio (€)</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                value={service.price}
                                                                onChange={(e) => {
                                                                    const services = [...newProposal.services.items];
                                                                    services[index] = { ...services[index], price: parseFloat(e.target.value) || 0 };
                                                                    setNewProposal({
                                                                        ...newProposal,
                                                                        services: { items: services }
                                                                    });
                                                                }}
                                                                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-xs text-slate-600 mb-1 block">Total</label>
                                                            <div className="bg-emerald-50 px-2 py-1.5 text-sm rounded border font-semibold text-emerald-700">
                                                                {formatCurrency((service.price || 0) * (service.quantity || 1))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                    <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                                        💰 Resumen Financiero
                                    </h4>
                                    <div className="space-y-2 text-sm text-emerald-700">
                                        {(() => {
                                            const services = newProposal.services.items || [];
                                            const subtotal = services.reduce((sum, service) => 
                                                sum + ((service.price || 0) * (service.quantity || 1)), 0
                                            );
                                            const taxes = subtotal * 0.21;
                                            const total = subtotal + taxes;
                                            
                                            return (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span>Subtotal:</span>
                                                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>IVA (21%):</span>
                                                        <span className="font-semibold">{formatCurrency(taxes)}</span>
                                                    </div>
                                                    <div className="border-t border-emerald-200 pt-2 flex justify-between font-bold">
                                                        <span>Total:</span>
                                                        <span className="text-emerald-600">{formatCurrency(total)}</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                        <p className="text-xs mt-2">
                                            💡 Los precios se calculan automáticamente según los servicios incluidos
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 pt-6 border-t border-slate-200 mt-6">
                            <Button
                                onClick={() => {
                                    setShowNewProposalModal(false);
                                    setNewProposal({
                                        title: '',
                                        description: '',
                                        terms: '',
                                        timeline: '',
                                        services: { items: [{ name: '', quantity: 1, price: 0, description: '' }] }
                                    });
                                }}
                                variant="outline"
                                className="flex-1"
                            >
                                ❌ Cancelar
                            </Button>
                            <Button
                                onClick={() => {
                                    if (!newProposal.title?.trim()) {
                                        alert('⚠️ El título es obligatorio');
                                        return;
                                    }
                                    
                                    const validServices = newProposal.services.items.filter(service => 
                                        service.name?.trim() && (service.price || 0) > 0
                                    );
                                    
                                    if (validServices.length === 0) {
                                        alert('⚠️ Debe incluir al menos un servicio con nombre y precio válido');
                                        return;
                                    }
                                    
                                    createNewProposal();
                                }}
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                            >
                                ✨ Crear Propuesta
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
