'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Sidebar from '@/components/Sidebar';
import { SpanishInvoiceData, SpanishCompanyData, validateSpanishNIF, validateSpanishCIF } from '@/lib/spanish-invoice-utils';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
    FileText, 
    Building2, 
    User, 
    Euro, 
    Calendar, 
    Hash, 
    Plus, 
    Trash2, 
    Save,
    ArrowLeft,
    Download
} from 'lucide-react';

interface Client {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    nif?: string;
    tax_id?: string; // Agregar tax_id como alternativa
    address?: string;
    postal_code?: string;
    city?: string;
    province?: string;
    country?: string;
    [key: string]: any; // Permitir propiedades adicionales
}

interface CreateSpanishInvoiceProps {
    userEmail: string;
}

export default function CreateSpanishInvoice({ userEmail }: CreateSpanishInvoiceProps) {
    const [loading, setLoading] = useState(false);
    const [loadingCompany, setLoadingCompany] = useState(true);
    const [loadingClients, setLoadingClients] = useState(true);
    const [companyData, setCompanyData] = useState<SpanishCompanyData | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [invoiceData, setInvoiceData] = useState<SpanishInvoiceData>({
        invoiceNumber: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        clientName: '',
        clientNIF: '',
        clientAddress: '',
        clientCity: '',
        clientPostalCode: '',
        clientProvince: '',
        items: [{
            description: '',
            quantity: 1,
            unitPrice: 0,
            vatRate: 21,
            vatAmount: 0,
            total: 0
        }],
        subtotal: 0,
        totalVAT: 0,
        total: 0,
        notes: '',
        paymentTerms: '30 días'
    });
    
    const supabase = createSupabaseClient();
    const router = useRouter();

    // Cargar datos de la empresa y clientes al inicializar
    useEffect(() => {
        loadCompanyData();
        loadClients();
        generateInvoiceNumber();
    }, []);

    const loadCompanyData = async () => {
        try {
            setLoadingCompany(true);
            
            if (!supabase) {
                setLoadingCompany(false);
                return;
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log('❌ No user found');
                setLoadingCompany(false);
                return;
            }

            console.log('🔍 Loading company data for user:', user.id);

            const { data, error } = await supabase
                .from('company_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            console.log('📊 Company data query result:', { data, error });

            if (error && error.code !== 'PGRST116') {
                console.error('❌ Error loading company data:', error);
                setLoadingCompany(false);
                return;
            }

            if (data) {
                console.log('✅ Company data found:', data);
                setCompanyData({
                    companyName: data.company_name,
                    nif: data.nif,
                    address: data.address,
                    city: data.city,
                    postalCode: data.postal_code,
                    province: data.province,
                    country: data.country || 'España',
                    phone: data.phone,
                    email: data.email,
                    website: data.website,
                    registrationNumber: data.registration_number,
                    socialCapital: data.social_capital
                });
            } else {
                console.log('⚠️ No company data found for user:', user.id);
            }
        } catch (error) {
            console.error('Error en loadCompanyData:', error);
        } finally {
            setLoadingCompany(false);
        }
    };

    const loadClients = async () => {
        try {
            setLoadingClients(true);
            
            if (!supabase) {
                setLoadingClients(false);
                return;
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log('❌ No user found for clients');
                setLoadingClients(false);
                return;
            }

            console.log('🔍 Loading clients for user:', user.id);

            const { data, error } = await supabase
                .from('clients')
                .select('*')  // Usar * para obtener todas las columnas disponibles
                .eq('user_id', user.id)
                .order('name');

            console.log('📊 Clients query result:', { data, error, count: data?.length });

            if (error) {
                console.error('❌ Error loading clients:', error);
                toast.error('Error cargando clientes: ' + error.message);
                setLoadingClients(false);
                return;
            }

            setClients(data || []);
            console.log('✅ Clientes cargados:', data?.length || 0);
            
            if (data && data.length > 0) {
                console.log('📋 First client example:', data[0]);
            }
        } catch (error) {
            console.error('Error en loadClients:', error);
            toast.error('Error cargando clientes');
        } finally {
            setLoadingClients(false);
        }
    };

    const handleLogout = async () => {
        try {
            if (!supabase) return;
            await supabase.auth.signOut();
            router.push('/login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const generateInvoiceNumber = async () => {
        try {
            if (!supabase) return;
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Generar número basado en el año y contador
            const year = new Date().getFullYear();
            const invoiceNumber = `${year}-${String(Date.now()).slice(-6)}`;
            
            setInvoiceData(prev => ({
                ...prev,
                invoiceNumber
            }));
        } catch (error) {
            console.error('Error generating invoice number:', error);
        }
    };

    const handleClientSelect = (clientId: string) => {
        setSelectedClientId(clientId);
        
        if (clientId === '') {
            // Limpiar datos del cliente si no se selecciona ninguno
            setInvoiceData(prev => ({
                ...prev,
                clientName: '',
                clientNIF: '',
                clientAddress: '',
                clientCity: '',
                clientPostalCode: '',
                clientProvince: ''
            }));
            return;
        }

        const selectedClient = clients.find(client => client.id === clientId);
        if (selectedClient) {
            console.log('📋 Selected client data:', selectedClient);
            setInvoiceData(prev => ({
                ...prev,
                clientName: selectedClient.company || selectedClient.name,
                clientNIF: selectedClient.tax_id || selectedClient.nif || '',
                clientAddress: selectedClient.address || '',
                clientCity: selectedClient.city || '',
                clientPostalCode: selectedClient.postal_code || '',
                clientProvince: selectedClient.province || ''
            }));
        }
    };

    const updateInvoiceField = (field: keyof SpanishInvoiceData, value: any) => {
        setInvoiceData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateItemField = (index: number, field: string, value: any) => {
        const updatedItems = [...invoiceData.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        // Recalcular totales del item
        if (field === 'quantity' || field === 'unitPrice' || field === 'vatRate') {
            const item = updatedItems[index];
            const subtotal = item.quantity * item.unitPrice;
            item.vatAmount = (subtotal * item.vatRate) / 100;
            item.total = subtotal + item.vatAmount;
        }

        setInvoiceData(prev => ({
            ...prev,
            items: updatedItems
        }));

        // Recalcular totales de la factura
        calculateTotals(updatedItems);
    };

    const calculateTotals = (items: any[]) => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const totalVAT = items.reduce((sum, item) => sum + item.vatAmount, 0);
        const total = subtotal + totalVAT;

        setInvoiceData(prev => ({
            ...prev,
            subtotal,
            totalVAT,
            total
        }));
    };

    const addItem = () => {
        setInvoiceData(prev => ({
            ...prev,
            items: [...prev.items, {
                description: '',
                quantity: 1,
                unitPrice: 0,
                vatRate: 21,
                vatAmount: 0,
                total: 0
            }]
        }));
    };

    const removeItem = (index: number) => {
        if (invoiceData.items.length === 1) {
            toast.error('Debe haber al menos un concepto en la factura');
            return;
        }

        const updatedItems = invoiceData.items.filter((_, i) => i !== index);
        setInvoiceData(prev => ({
            ...prev,
            items: updatedItems
        }));
        calculateTotals(updatedItems);
    };

    const validateForm = () => {
        console.log('🔍 Iniciando validación del formulario');
        console.log('📊 Datos de la empresa:', companyData);
        console.log('📋 Datos de la factura:', invoiceData);
        
        if (!companyData) {
            console.log('❌ Falta datos de la empresa');
            toast.error('Debe configurar los datos de la empresa primero');
            router.push('/dashboard/settings/company');
            return false;
        }

        if (!invoiceData.clientName.trim()) {
            console.log('❌ Falta nombre del cliente');
            toast.error('El nombre del cliente es obligatorio');
            return false;
        }

        if (!invoiceData.clientNIF.trim()) {
            console.log('❌ Falta NIF del cliente');
            toast.error('El NIF/CIF del cliente es obligatorio');
            return false;
        }

        if (!validateSpanishNIF(invoiceData.clientNIF) && !validateSpanishCIF(invoiceData.clientNIF)) {
            console.log('❌ NIF/CIF inválido:', invoiceData.clientNIF);
            toast.error('El NIF/CIF del cliente no es válido');
            return false;
        }

        // Validar items - debe haber al menos un item con descripción
        console.log('🔍 Todos los items:', JSON.stringify(invoiceData.items, null, 2));
        
        const itemsWithDescription = invoiceData.items.filter(item => 
            item.description.trim().length > 0
        );
        
        console.log('🔍 Items con descripción:', JSON.stringify(itemsWithDescription, null, 2));
        
        if (itemsWithDescription.length === 0) {
            console.log('❌ No hay conceptos con descripción en la factura');
            toast.error('Debe agregar al menos un concepto con descripción a la factura');
            return false;
        }
        
        // Verificar que todos los items con descripción tengan datos válidos
        for (const item of itemsWithDescription) {
            if (item.quantity <= 0) {
                toast.error('Todos los conceptos deben tener cantidad mayor que 0');
                return false;
            }
            if (item.unitPrice <= 0) {
                toast.error('Todos los conceptos deben tener precio mayor que 0');
                return false;
            }
        }

        if (invoiceData.total <= 0) {
            console.log('❌ Total inválido:', invoiceData.total);
            toast.error('El importe total debe ser mayor que 0');
            return false;
        }

        console.log('✅ Validación del formulario exitosa');
        return true;
    };

    const saveInvoice = async () => {
        console.log('🔄 Iniciando saveInvoice...');
        console.log('📋 Datos de factura actuales:', invoiceData);
        
        if (!validateForm()) {
            console.log('❌ Validación de formulario falló');
            return;
        }
        
        console.log('✅ Validación de formulario exitosa');

        if (!supabase) {
            console.log('❌ No hay cliente Supabase');
            toast.error('Error de conexión con la base de datos');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Usuario no autenticado');
                return;
            }

            // Obtener o crear cliente basado en NIF
            let clientId: string;
            
            // Buscar si ya existe un cliente con este NIF
            const { data: existingClients, error: clientSearchError } = await supabase
                .from('clients')
                .select('id')
                .eq('nif', invoiceData.clientNIF)
                .eq('user_id', user.id)
                .limit(1);
                
            if (clientSearchError) {
                console.error('❌ Error buscando cliente:', clientSearchError);
                toast.error('Error al buscar el cliente en la base de datos');
                return;
            }
                
            if (existingClients && existingClients.length > 0) {
                clientId = existingClients[0].id;
                console.log('✅ Cliente encontrado:', clientId);
            } else {
                // Crear nuevo cliente con la estructura correcta de la tabla
                const { data: newClient, error: clientCreateError } = await supabase
                    .from('clients')
                    .insert([{
                        user_id: user.id,
                        name: invoiceData.clientName,
                        email: '', // Campo requerido pero puede estar vacío
                        phone: '', // Campo requerido pero puede estar vacío
                        company: invoiceData.clientName, // Usar el nombre como company
                        address: invoiceData.clientAddress,
                        nif: invoiceData.clientNIF,
                        city: invoiceData.clientCity,
                        province: invoiceData.clientProvince,
                        created_at: new Date().toISOString()
                    }])
                    .select('id')
                    .single();
                    
                if (clientCreateError) {
                    console.error('❌ Error creando cliente:', clientCreateError);
                    toast.error('Error al crear el cliente: ' + clientCreateError.message);
                    return;
                }
                
                clientId = newClient.id;
                console.log('✅ Cliente creado:', clientId);
            }

            // Generar número de factura si no existe
            const finalInvoiceNumber = invoiceData.invoiceNumber || await generateInvoiceNumber() || `FAC-${Date.now()}`;

            // Filtrar solo items con descripción válida
            const validItems = invoiceData.items.filter(item => 
                item.description.trim().length > 0
            );

            // Preparar los datos de la factura para insertar (usando la estructura real de la tabla)
            const invoiceDataToSave = {
                user_id: user.id,
                client_id: clientId,
                invoice_number: finalInvoiceNumber,
                title: `Factura ${finalInvoiceNumber}`,
                description: `Factura para ${invoiceData.clientName}`,
                amount: invoiceData.subtotal,
                tax_rate: 21, // IVA estándar español
                tax_amount: invoiceData.totalVAT,
                total_amount: invoiceData.total,
                status: 'draft' as const,
                issue_date: invoiceData.date,
                due_date: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días por defecto
                notes: invoiceData.notes + (validItems.length > 0 ? `\n\nConceptos:\n${validItems.map(item => `- ${item.description} (${item.quantity} x ${item.unitPrice}€ = ${item.total}€)`).join('\n')}` : ''),
                created_at: new Date().toISOString()
            };

            console.log('💾 Guardando factura:', invoiceDataToSave);

            // Insertar la factura en la base de datos
            const { data: savedInvoice, error } = await supabase
                .from('invoices')
                .insert([invoiceDataToSave])
                .select()
                .single();

            if (error) {
                console.error('❌ Error guardando factura:', error);
                toast.error('Error al guardar la factura: ' + error.message);
                return;
            }

            console.log('✅ Factura guardada exitosamente:', savedInvoice);

            toast.success('✅ Factura creada correctamente', {
                duration: 3000,
                description: `Factura ${finalInvoiceNumber} guardada exitosamente`
            });

            // Redirigir a la lista de facturas después de 1.5 segundos
            setTimeout(() => {
                router.push('/dashboard/invoices');
            }, 1500);

        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al crear la factura');
        } finally {
            setLoading(false);
        }
    };

    // Pantalla de carga mientras se obtienen los datos de empresa
    if (loadingCompany) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Cargando...
                            </h2>
                            <p className="text-gray-600">
                                Verificando configuración de la empresa
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!companyData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-8 text-center">
                            <Building2 className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Configuración Requerida
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Para crear facturas españolas, primero debe configurar los datos fiscales de su empresa.
                            </p>
                            <Button
                                onClick={() => router.push('/dashboard/settings/company')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
                            >
                                <Building2 className="w-4 h-4 mr-2" />
                                Configurar Empresa
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />
            
            <main className="flex-1 overflow-auto">
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={() => router.back()}
                                    variant="outline"
                                    className="p-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                        <FileText className="w-8 h-8 text-blue-600" />
                                        Nueva Factura
                                    </h1>
                                    <p className="text-gray-600">Crear una nueva factura</p>
                                </div>
                            </div>
                        </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Datos de la Empresa */}
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                Datos de la Empresa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold text-gray-800">{companyData.companyName}</h3>
                                <p className="text-sm text-gray-600">NIF: {companyData.nif}</p>
                                <p className="text-sm text-gray-600">{companyData.address}</p>
                                <p className="text-sm text-gray-600">{companyData.postalCode} {companyData.city}, {companyData.province}</p>
                                {companyData.phone && <p className="text-sm text-gray-600">Tel: {companyData.phone}</p>}
                                {companyData.email && <p className="text-sm text-gray-600">Email: {companyData.email}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Datos de la Factura */}
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                                <Hash className="w-5 h-5 text-blue-600" />
                                Datos de la Factura
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="invoiceNumber">Número de Factura</Label>
                                    <Input
                                        id="invoiceNumber"
                                        value={invoiceData.invoiceNumber}
                                        onChange={(e) => updateInvoiceField('invoiceNumber', e.target.value)}
                                        placeholder="2024-001"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="date">Fecha</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={invoiceData.date}
                                        onChange={(e) => updateInvoiceField('date', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={invoiceData.dueDate}
                                    onChange={(e) => updateInvoiceField('dueDate', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Datos del Cliente */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mt-8">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                            <User className="w-5 h-5 text-blue-600" />
                            Datos del Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Selector de Cliente */}
                        <div className="mb-6">
                            <Label htmlFor="clientSelect">Seleccionar Cliente Existente</Label>
                            <select
                                id="clientSelect"
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedClientId}
                                onChange={(e) => handleClientSelect(e.target.value)}
                                disabled={loadingClients}
                            >
                                <option value="">-- Seleccionar cliente o crear uno nuevo --</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.company ? `${client.company} (${client.name})` : client.name}
                                        {(client.tax_id || client.nif) ? ` - ${client.tax_id || client.nif}` : ''}
                                    </option>
                                ))}
                            </select>
                            {loadingClients && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Cargando clientes...
                                </p>
                            )}
                            {!loadingClients && clients.length === 0 && (
                                <p className="text-sm text-amber-600 mt-1">
                                    No tienes clientes registrados. Complete los datos manualmente o añada clientes desde el panel de clientes.
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="clientName">Nombre/Razón Social *</Label>
                                <Input
                                    id="clientName"
                                    value={invoiceData.clientName}
                                    onChange={(e) => updateInvoiceField('clientName', e.target.value)}
                                    placeholder="Nombre del cliente"
                                />
                            </div>
                            <div>
                                <Label htmlFor="clientNIF">NIF/CIF *</Label>
                                <Input
                                    id="clientNIF"
                                    value={invoiceData.clientNIF}
                                    onChange={(e) => updateInvoiceField('clientNIF', e.target.value)}
                                    placeholder="12345678A o B12345678"
                                />
                            </div>
                            <div>
                                <Label htmlFor="clientAddress">Dirección</Label>
                                <Input
                                    id="clientAddress"
                                    value={invoiceData.clientAddress}
                                    onChange={(e) => updateInvoiceField('clientAddress', e.target.value)}
                                    placeholder="Dirección del cliente"
                                />
                            </div>
                            <div>
                                <Label htmlFor="clientCity">Ciudad</Label>
                                <Input
                                    id="clientCity"
                                    value={invoiceData.clientCity}
                                    onChange={(e) => updateInvoiceField('clientCity', e.target.value)}
                                    placeholder="Ciudad"
                                />
                            </div>
                            <div>
                                <Label htmlFor="clientPostalCode">Código Postal</Label>
                                <Input
                                    id="clientPostalCode"
                                    value={invoiceData.clientPostalCode}
                                    onChange={(e) => updateInvoiceField('clientPostalCode', e.target.value)}
                                    placeholder="28001"
                                />
                            </div>
                            <div>
                                <Label htmlFor="clientProvince">Provincia</Label>
                                <Input
                                    id="clientProvince"
                                    value={invoiceData.clientProvince}
                                    onChange={(e) => updateInvoiceField('clientProvince', e.target.value)}
                                    placeholder="Provincia"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Conceptos de la Factura */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mt-8">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                            <Euro className="w-5 h-5 text-blue-600" />
                            Conceptos de la Factura
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {invoiceData.items.map((item, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                                        <div className="md:col-span-2">
                                            <Label>Descripción *</Label>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateItemField(index, 'description', e.target.value)}
                                                placeholder="Descripción del servicio/producto"
                                            />
                                        </div>
                                        <div>
                                            <Label>Cantidad</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => updateItemField(index, 'quantity', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Precio Unit. (€)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItemField(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div>
                                            <Label>IVA (%)</Label>
                                            <select
                                                className="w-full p-2 border border-gray-300 rounded-lg"
                                                value={item.vatRate}
                                                onChange={(e) => updateItemField(index, 'vatRate', parseFloat(e.target.value))}
                                            >
                                                <option value={0}>0% - Exento</option>
                                                <option value={4}>4% - Superreducido</option>
                                                <option value={10}>10% - Reducido</option>
                                                <option value={21}>21% - General</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <div className="text-sm text-gray-600">Total</div>
                                                <div className="font-bold text-lg">{item.total.toFixed(2)}€</div>
                                            </div>
                                            <Button
                                                onClick={() => removeItem(index)}
                                                variant="outline"
                                                size="sm"
                                                className="p-2 text-red-600 hover:text-red-700"
                                                disabled={invoiceData.items.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <Button
                                onClick={addItem}
                                variant="outline"
                                className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 py-4"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Añadir Concepto
                            </Button>
                        </div>

                        {/* Totales */}
                        <div className="mt-8 bg-gray-50 p-6 rounded-xl">
                            <div className="space-y-2 text-right">
                                <div className="flex justify-between text-lg">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold">{invoiceData.subtotal.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-lg">
                                    <span>IVA Total:</span>
                                    <span className="font-semibold">{invoiceData.totalVAT.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-2xl font-bold border-t border-gray-300 pt-2">
                                    <span>TOTAL:</span>
                                    <span className="text-blue-600">{invoiceData.total.toFixed(2)}€</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Observaciones */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mt-8">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl text-gray-800">Observaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            className="w-full p-4 border border-gray-300 rounded-xl resize-none"
                            rows={4}
                            value={invoiceData.notes}
                            onChange={(e) => updateInvoiceField('notes', e.target.value)}
                            placeholder="Observaciones adicionales sobre la factura..."
                        />
                    </CardContent>
                </Card>

                {/* Botones de Acción */}
                <div className="flex justify-end gap-4 mt-8 pb-8">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        disabled={loading}
                        className="px-6 py-3 rounded-xl"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={saveInvoice}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creando Factura...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Crear Factura
                            </>
                        )}
                    </Button>
                </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
