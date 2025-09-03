'use client';

import Sidebar from '@/components/Sidebar';
import TrialBanner from '@/components/TrialBanner';
import { Button } from '@/components/ui/Button';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useTrialStatus } from '@/src/lib/useTrialStatus';
import { showToast } from '@/utils/toast';
import { ArrowLeft, FileText, Users, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/datepicker.css';
import { es } from 'date-fns/locale';

interface ContractTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    template_content: string;
    variables: string[];
}

interface Client {
    id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    address?: string;
}

export default function CreateContractClient() {
    const router = useRouter();
    const { canUseFeatures } = useTrialStatus();
    const [step, setStep] = useState(1); // 1: Template, 2: Client, 3: Details
    const [templates, setTemplates] = useState<ContractTemplate[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        contract_value: '',
        currency: 'EUR',
        start_date: '',
        end_date: '',
        payment_terms: '',
        project_details: {} as Record<string, string>
    });

    // Separate state for DatePicker objects
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Function to generate professional contract format
    const generateProfessionalContract = (content: string, contractData: any, profileData: any, clientData: any) => {
        const contractNumber = `CONT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
        const currentDate = new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                            CONTRATO DE SERVICIOS PROFESIONALES
                                    DOCUMENTO OFICIAL
                              Número de Contrato: ${contractNumber}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 LUGAR Y FECHA: ${profileData?.city || '[Ciudad]'}, ${currentDate}

══════════════════════════════════════════════════════════════════════════════

                                    PARTES CONTRATANTES

══════════════════════════════════════════════════════════════════════════════

🔹 EL CONSULTOR/PRESTADOR DE SERVICIOS:
   Nombre: ${profileData?.name || '[Nombre del Consultor]'}
   DNI/NIF: ${profileData?.dni || '[DNI del Consultor]'}
   Dirección: ${profileData?.address || '[Dirección del Consultor]'}
   Email: ${profileData?.email || '[Email del Consultor]'}

🔹 EL CLIENTE/CONTRATANTE:
   Nombre/Razón Social: ${clientData.name}
   ${clientData.company ? `Empresa: ${clientData.company}` : ''}
   Dirección: ${clientData.address || '[Dirección del Cliente]'}
   Email: ${clientData.email}
   ${clientData.phone ? `Teléfono: ${clientData.phone}` : ''}

══════════════════════════════════════════════════════════════════════════════

                                 DETALLES DEL CONTRATO

══════════════════════════════════════════════════════════════════════════════

📋 TÍTULO DEL PROYECTO: ${contractData.title}

💰 VALOR DEL CONTRATO: ${contractData.contract_value} ${contractData.currency}

📅 PERÍODO DE VIGENCIA:
   • Fecha de Inicio: ${contractData.start_date}
   • Fecha de Finalización: ${contractData.end_date}

💳 CONDICIONES DE PAGO: ${contractData.payment_terms}

══════════════════════════════════════════════════════════════════════════════

                              CONTENIDO DEL CONTRATO

══════════════════════════════════════════════════════════════════════════════

${content}

══════════════════════════════════════════════════════════════════════════════

                                      FIRMAS

══════════════════════════════════════════════════════════════════════════════

EL CONSULTOR:                                    EL CLIENTE:


_____________________________                   _____________________________
${profileData?.name || '[Nombre del Consultor]'}                      ${clientData.name}
DNI: ${profileData?.dni || '[DNI]'}                              DNI/CIF: [Documento del Cliente]


Fecha: _______________                          Fecha: _______________


══════════════════════════════════════════════════════════════════════════════

                               INFORMACIÓN ADICIONAL

══════════════════════════════════════════════════════════════════════════════

📌 Este contrato ha sido generado mediante el sistema Clyra
📌 Número de referencia: ${contractNumber}
📌 Fecha de generación: ${currentDate}
📌 Jurisdicción aplicable: ${profileData?.city || '[Ciudad]'}, España

──────────────────────────────────────────────────────────────────────────────

                    © ${new Date().getFullYear()} - Documento Oficial Clyra
                              Todos los derechos reservados

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;
    };

    useEffect(() => {
        loadTemplates();
        loadClients();
    }, []);

    const loadTemplates = async () => {
        try {
            const supabase = createSupabaseClient();
            const { data, error } = await supabase
                .from('contract_templates')
                .select('*')
                .eq('is_active', true)
                .order('category', { ascending: true });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            console.error('Error loading templates:', error);
            
            // Mostrar error más específico si las tablas no existen
            if (error && typeof error === 'object' && 'message' in error) {
                const errorMessage = (error as any).message;
                if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
                    showToast.error('Error: Las tablas de contratos no existen. Ejecuta la migración SQL en Supabase.');
                } else {
                    showToast.error(`Error al cargar templates: ${errorMessage}`);
                }
            } else {
                showToast.error('Error al cargar los templates. Verifica que las tablas existan en Supabase.');
            }
        }
    };

    const loadClients = async () => {
        try {
            const supabase = createSupabaseClient();
            const { data, error } = await supabase
                .from('clients')
                .select('id, name, email, company, phone, address')
                .order('name', { ascending: true });

            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error('Error loading clients:', error);
            showToast.error('Error al cargar los clientes');
        }
    };

    const getCategoryIcon = (category: string) => {
        const icons = {
            web_development: '💻',
            design: '🎨',
            marketing: '📢',
            consulting: '💼',
            content: '✍️',
            general: '📄'
        };
        return icons[category as keyof typeof icons] || '📄';
    };

    const getCategoryName = (category: string) => {
        const names = {
            web_development: 'Desarrollo Web',
            design: 'Diseño Gráfico',
            marketing: 'Marketing Digital',
            consulting: 'Consultoría',
            content: 'Redacción de Contenidos',
            general: 'General'
        };
        return names[category as keyof typeof names] || 'General';
    };

    const handleTemplateSelect = (template: ContractTemplate) => {
        setSelectedTemplate(template);
        setFormData({
            ...formData,
            title: `Contrato - ${template.name}`,
            description: template.description || ''
        });
    };

    const handleNext = () => {
        if (step === 1 && !selectedTemplate) {
            showToast.error('Selecciona un template de contrato');
            return;
        }
        if (step === 2 && !selectedClient) {
            showToast.error('Selecciona un cliente');
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleCreateContract = async () => {
        if (!selectedTemplate || !selectedClient) return;
        
        try {
            setLoading(true);
            const supabase = createSupabaseClient();
            
            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error('Usuario no autenticado');
            }

            // Obtener datos del perfil del usuario
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            // Generate contract content with replaced variables
            let contractContent = selectedTemplate.template_content;
            
            // Replace common variables
            const replacements = {
                freelancer_name: profile?.name || user.email?.split('@')[0] || 'Nombre del Freelancer',
                freelancer_dni: profile?.dni || '[DNI del Freelancer]',
                freelancer_address: profile?.address || '[Dirección del Freelancer]',
                client_name: selectedClient.name,
                client_document_type: 'DNI',
                client_document: '[Documento del cliente]',
                client_address: selectedClient.address || '[Dirección del cliente]',
                project_name: formData.title,
                project_description: formData.description,
                technologies: formData.project_details.technologies || '[Tecnologías]',
                main_features: formData.project_details.main_features || '[Funcionalidades principales]',
                project_duration: formData.project_details.project_duration || '[Duración del proyecto]',
                additional_deliverables: formData.project_details.additional_deliverables || '[Entregables adicionales]',
                design_type: formData.project_details.design_type || '[Tipo de diseño]',
                initial_proposals: formData.project_details.initial_proposals || '3',
                revisions_included: formData.project_details.revisions_included || '2',
                first_delivery_date: formData.project_details.first_delivery_date || '[Fecha primera entrega]',
                file_formats: formData.project_details.file_formats || 'PDF, PNG, JPG, AI',
                revision_cost: formData.project_details.revision_cost || '50',
                social_networks: formData.project_details.social_networks || '[Redes sociales]',
                content_strategy: formData.project_details.content_strategy || '[Estrategia de contenido]',
                advertising_campaigns: formData.project_details.advertising_campaigns || '[Campañas publicitarias]',
                reporting_frequency: formData.project_details.reporting_frequency || 'Mensual',
                main_objective: formData.project_details.main_objective || '[Objetivo principal]',
                kpis: formData.project_details.kpis || '[KPIs a medir]',
                reach_goal: formData.project_details.reach_goal || '[Meta de alcance]',
                engagement_goal: formData.project_details.engagement_goal || '[Meta de engagement]',
                contract_duration: formData.project_details.contract_duration || '6',
                notice_period: formData.project_details.notice_period || '30',
                professional_fee: formData.project_details.professional_fee || formData.contract_value,
                ad_budget: formData.project_details.ad_budget || '500',
                monthly_total: formData.project_details.monthly_total || formData.contract_value,
                meeting_frequency: formData.project_details.meeting_frequency || 'Semanal',
                communication_channel: formData.project_details.communication_channel || 'Email y WhatsApp',
                specialization: formData.project_details.specialization || '[Especialización]',
                project_scope: formData.project_details.project_scope || formData.description,
                expected_outcomes: formData.project_details.expected_outcomes || '[Resultados esperados]',
                work_modality: formData.project_details.work_modality || 'Remoto',
                estimated_hours: formData.project_details.estimated_hours || '[Horas estimadas]',
                weekly_hours: formData.project_details.weekly_hours || '20',
                hourly_rate: formData.project_details.hourly_rate || '50',
                total_estimate: formData.project_details.total_estimate || formData.contract_value,
                billing_frequency: formData.project_details.billing_frequency || 'Mensual',
                content_type: formData.project_details.content_type || '[Tipo de contenido]',
                content_quantity: formData.project_details.content_quantity || '[Cantidad]',
                average_length: formData.project_details.average_length || '500',
                tone_style: formData.project_details.tone_style || 'Profesional',
                max_revisions: formData.project_details.max_revisions || '2',
                delivery_frequency: formData.project_details.delivery_frequency || 'Semanal',
                review_deadline: formData.project_details.review_deadline || '3',
                price_per_word: formData.project_details.price_per_word || '0.05',
                price_per_piece: formData.project_details.price_per_piece || '100',
                seo_optimization: formData.project_details.seo_optimization || 'Sí',
                target_keywords: formData.project_details.target_keywords || '[Palabras clave]',
                keyword_density: formData.project_details.keyword_density || '2',
                contract_value: formData.contract_value,
                currency: formData.currency,
                start_date: new Date(formData.start_date).toLocaleDateString('es-ES'),
                end_date: new Date(formData.end_date).toLocaleDateString('es-ES'),
                payment_terms: formData.payment_terms,
                contract_date: new Date().toLocaleDateString('es-ES'),
                city: profile?.city || '[Tu Ciudad]',
                jurisdiction: profile?.city || '[Tu Jurisdicción]'
            };

            // Replace variables in template
            Object.entries(replacements).forEach(([key, value]) => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                contractContent = contractContent.replace(regex, String(value) || `[${key}]`);
            });

            // Apply professional format to the contract
            const contractData = {
                title: formData.title,
                contract_value: formData.contract_value,
                currency: formData.currency,
                start_date: new Date(formData.start_date).toLocaleDateString('es-ES'),
                end_date: new Date(formData.end_date).toLocaleDateString('es-ES'),
                payment_terms: formData.payment_terms
            };

            contractContent = generateProfessionalContract(contractContent, contractData, profile, selectedClient);

            // Validar datos antes de insertar
            if (!formData.title.trim()) {
                throw new Error('El título del contrato es obligatorio');
            }
            
            if (!contractContent.trim()) {
                throw new Error('El contenido del contrato no puede estar vacío');
            }

            console.log('Datos a insertar:', {
                user_id: user.id,
                client_id: selectedClient.id,
                template_id: selectedTemplate.id,
                title: formData.title,
                description: formData.description,
                contract_value: parseFloat(formData.contract_value) || 0,
                currency: formData.currency,
                start_date: formData.start_date,
                end_date: formData.end_date,
                payment_terms: formData.payment_terms
            });

            const { data, error } = await supabase
                .from('contracts')
                .insert({
                    user_id: user.id,
                    client_id: selectedClient.id,
                    template_id: selectedTemplate.id,
                    title: formData.title,
                    description: formData.description,
                    contract_content: contractContent,
                    contract_value: parseFloat(formData.contract_value) || 0,
                    currency: formData.currency,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    payment_terms: formData.payment_terms,
                    project_details: formData.project_details
                })
                .select()
                .single();

            if (error) throw error;

            showToast.success('Contrato creado exitosamente');
            router.push(`/dashboard/contracts/${data.id}`);
        } catch (error) {
            console.error('Error creating contract:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            
            // Mostrar error más específico
            if (error && typeof error === 'object' && 'message' in error) {
                const errorMessage = (error as any).message;
                console.error('Error message:', errorMessage);
                
                if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
                    showToast.error('Error: Las tablas de contratos no existen. Ejecuta la migración SQL en Supabase.');
                } else if (errorMessage.includes('violates foreign key constraint')) {
                    showToast.error('Error: Cliente no válido. Verifica que el cliente exista.');
                } else if (errorMessage.includes('null value in column')) {
                    showToast.error('Error: Faltan campos obligatorios en el formulario.');
                } else {
                    showToast.error(`Error al crear el contrato: ${errorMessage}`);
                }
            } else {
                showToast.error('Error desconocido al crear el contrato. Revisa la consola para más detalles.');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    1
                </div>
                <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    2
                </div>
                <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    3
                </div>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Selecciona un Template de Contrato
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`cursor-pointer p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                            selectedTemplate?.id === template.id
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <div className="text-center mb-4">
                            <div className="text-4xl mb-2">{getCategoryIcon(template.category)}</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {template.name}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {template.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                            Categoría: {getCategoryName(template.category)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Selecciona el Cliente
            </h2>
            {clients.length === 0 ? (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No tienes clientes registrados
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Necesitas al menos un cliente para crear un contrato.
                    </p>
                    <Button onClick={() => router.push('/dashboard/clients/create')}>
                        Crear Cliente
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.map((client) => (
                        <div
                            key={client.id}
                            onClick={() => setSelectedClient(client)}
                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                                selectedClient?.id === client.id
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {client.name}
                            </h3>
                            {client.company && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {client.company}
                                </p>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                {client.email}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Detalles del Contrato
            </h2>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Título del Contrato
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Ej: Desarrollo de sitio web corporativo"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción del Proyecto
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Describe el proyecto en detalle..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Valor del Contrato
                        </label>
                        <input
                            type="number"
                            value={formData.contract_value}
                            onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Moneda
                        </label>
                        <select
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Calendar className="inline w-4 h-4 mr-2" />
                            Fecha de Inicio
                        </label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date: Date | null) => {
                                setStartDate(date);
                                setFormData({ 
                                    ...formData, 
                                    start_date: date ? date.toISOString().split('T')[0] : '' 
                                });
                            }}
                            locale={es}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Selecciona fecha de inicio"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                            wrapperClassName="w-full"
                            calendarClassName="bonsai-datepicker-calendar"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Calendar className="inline w-4 h-4 mr-2" />
                            Fecha de Finalización
                        </label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date: Date | null) => {
                                setEndDate(date);
                                setFormData({ 
                                    ...formData, 
                                    end_date: date ? date.toISOString().split('T')[0] : '' 
                                });
                            }}
                            locale={es}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Selecciona fecha de finalización"
                            minDate={startDate || undefined}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                            wrapperClassName="w-full"
                            calendarClassName="bonsai-datepicker-calendar"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Términos de Pago
                    </label>
                    <textarea
                        value={formData.payment_terms}
                        onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Ej: 50% al inicio, 50% al finalizar el proyecto"
                    />
                </div>

                {/* Campos específicos según el template */}
                {selectedTemplate && renderTemplateSpecificFields()}
            </div>
        </div>
    );

    const renderTemplateSpecificFields = () => {
        if (!selectedTemplate) return null;

        const updateProjectDetail = (key: string, value: string) => {
            setFormData({
                ...formData,
                project_details: {
                    ...formData.project_details,
                    [key]: value
                }
            });
        };

        switch (selectedTemplate.category) {
            case 'web_development':
                return (
                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Detalles del Desarrollo Web
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tecnologías a utilizar
                                </label>
                                <input
                                    type="text"
                                    value={formData.project_details.technologies || ''}
                                    onChange={(e) => updateProjectDetail('technologies', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="React, Node.js, MongoDB..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Duración estimada (días)
                                </label>
                                <input
                                    type="number"
                                    value={formData.project_details.project_duration || ''}
                                    onChange={(e) => updateProjectDetail('project_duration', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="30"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Funcionalidades principales
                            </label>
                            <textarea
                                value={formData.project_details.main_features || ''}
                                onChange={(e) => updateProjectDetail('main_features', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Sistema de usuarios, Panel administrativo, API REST..."
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Entregables adicionales
                            </label>
                            <input
                                type="text"
                                value={formData.project_details.additional_deliverables || ''}
                                onChange={(e) => updateProjectDetail('additional_deliverables', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Manual de usuario, capacitación..."
                            />
                        </div>
                    </div>
                );

            case 'design':
                return (
                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Detalles del Diseño
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tipo de diseño
                                </label>
                                <input
                                    type="text"
                                    value={formData.project_details.design_type || ''}
                                    onChange={(e) => updateProjectDetail('design_type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Logo, Branding, Web..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Propuestas iniciales
                                </label>
                                <input
                                    type="number"
                                    value={formData.project_details.initial_proposals || ''}
                                    onChange={(e) => updateProjectDetail('initial_proposals', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Revisiones incluidas
                                </label>
                                <input
                                    type="number"
                                    value={formData.project_details.revisions_included || ''}
                                    onChange={(e) => updateProjectDetail('revisions_included', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="2"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Formatos de archivo
                                </label>
                                <input
                                    type="text"
                                    value={formData.project_details.file_formats || ''}
                                    onChange={(e) => updateProjectDetail('file_formats', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="AI, PDF, PNG, JPG"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Costo por revisión adicional (€)
                                </label>
                                <input
                                    type="number"
                                    value={formData.project_details.revision_cost || ''}
                                    onChange={(e) => updateProjectDetail('revision_cost', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="50"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'marketing':
                return (
                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Detalles del Marketing Digital
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Redes sociales a gestionar
                                </label>
                                <input
                                    type="text"
                                    value={formData.project_details.social_networks || ''}
                                    onChange={(e) => updateProjectDetail('social_networks', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Instagram, Facebook, LinkedIn..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Objetivo principal
                                </label>
                                <input
                                    type="text"
                                    value={formData.project_details.main_objective || ''}
                                    onChange={(e) => updateProjectDetail('main_objective', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Aumentar ventas, visibilidad..."
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Estrategia de contenido
                            </label>
                            <textarea
                                value={formData.project_details.content_strategy || ''}
                                onChange={(e) => updateProjectDetail('content_strategy', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Describe la estrategia de contenido..."
                            />
                        </div>
                    </div>
                );

            case 'consulting':
                return (
                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Detalles de la Consultoría
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Especialización
                                </label>
                                <input
                                    type="text"
                                    value={formData.project_details.specialization || ''}
                                    onChange={(e) => updateProjectDetail('specialization', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Estrategia empresarial, IT..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Modalidad de trabajo
                                </label>
                                <select
                                    value={formData.project_details.work_modality || ''}
                                    onChange={(e) => updateProjectDetail('work_modality', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Presencial">Presencial</option>
                                    <option value="Remoto">Remoto</option>
                                    <option value="Híbrido">Híbrido</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Horas estimadas
                                </label>
                                <input
                                    type="number"
                                    value={formData.project_details.estimated_hours || ''}
                                    onChange={(e) => updateProjectDetail('estimated_hours', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="40"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tarifa por hora (€)
                                </label>
                                <input
                                    type="number"
                                    value={formData.project_details.hourly_rate || ''}
                                    onChange={(e) => updateProjectDetail('hourly_rate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="75"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'content':
                return (
                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Detalles de Redacción
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tipo de contenido
                                </label>
                                <input
                                    type="text"
                                    value={formData.project_details.content_type || ''}
                                    onChange={(e) => updateProjectDetail('content_type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Blog posts, web copy..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cantidad de piezas
                                </label>
                                <input
                                    type="number"
                                    value={formData.project_details.content_quantity || ''}
                                    onChange={(e) => updateProjectDetail('content_quantity', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Palabras promedio
                                </label>
                                <input
                                    type="number"
                                    value={formData.project_details.average_length || ''}
                                    onChange={(e) => updateProjectDetail('average_length', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tono y estilo
                                </label>
                                <input
                                    type="text"
                                    value={formData.project_details.tone_style || ''}
                                    onChange={(e) => updateProjectDetail('tone_style', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Profesional, cercano..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Revisiones máximas
                                </label>
                                <input
                                    type="number"
                                    value={formData.project_details.max_revisions || ''}
                                    onChange={(e) => updateProjectDetail('max_revisions', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="2"
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar onLogout={() => {}} />
            
            <div className="flex-1 flex flex-col overflow-hidden ml-56">
                <TrialBanner />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto px-6 py-8">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center mb-6">
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
                                        Crear Nuevo Contrato
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        Genera un contrato profesional en pocos pasos
                                    </p>
                                </div>
                            </div>

                            {renderStepIndicator()}
                        </div>

                        {/* Content */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    {step > 1 && (
                                        <Button
                                            variant="outline"
                                            onClick={handleBack}
                                        >
                                            Anterior
                                        </Button>
                                    )}
                                </div>
                                <div>
                                    {step < 3 ? (
                                        <Button
                                            onClick={handleNext}
                                        >
                                            Siguiente
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleCreateContract}
                                            disabled={loading}
                                        >
                                            {loading ? 'Creando...' : 'Crear Contrato'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
