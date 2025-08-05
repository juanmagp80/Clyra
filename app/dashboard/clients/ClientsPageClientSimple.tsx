'use client';

import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Client = {
    id: string;
    name: string;
    email: string;
    tag: string;
    phone?: string;
    company?: string;
    created_at: string;
};

interface ClientsPageClientProps {
    userEmail: string;
}

export default function ClientsPageClientSimple({ userEmail }: ClientsPageClientProps) {
    const supabase = createSupabaseClient();
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Formulario para nuevo cliente
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        tag: ''
    });

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const fetchClients = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching clients:', error);
            } else {
                setClients(data as Client[]);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addClient = async () => {
        if (!formData.name.trim()) return;

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { error } = await supabase.from('clients').insert([
                {
                    ...formData,
                    user_id: user.id,
                },
            ]);

            if (error) {
                console.error('Error adding client:', error);
            } else {
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    tag: ''
                });
                setShowForm(false);
                fetchClients();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
            {/* Sidebar */}
            <div style={{ 
                width: '256px', 
                backgroundColor: '#f8fafc', 
                borderRight: '1px solid #e2e8f0',
                padding: '1rem',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto'
            }}>
                <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#3b82f6',
                    marginBottom: '2rem'
                }}>
                    Taskelia
                </div>
                
                <nav style={{ marginBottom: '2rem' }}>
                    <Link href="/dashboard" style={{ 
                        display: 'block',
                        padding: '0.5rem',
                        color: '#64748b',
                        textDecoration: 'none',
                        marginBottom: '0.5rem',
                        borderRadius: '0.375rem'
                    }}>
                        🏠 Dashboard
                    </Link>
                    <Link href="/dashboard/clients" style={{ 
                        display: 'block',
                        padding: '0.5rem',
                        color: '#1e293b',
                        textDecoration: 'none',
                        marginBottom: '0.5rem',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '0.375rem',
                        fontWeight: '500'
                    }}>
                        👥 Clientes
                    </Link>
                </nav>

                <div style={{ 
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '1rem'
                }}>
                    <div style={{ 
                        fontSize: '0.875rem',
                        color: '#64748b',
                        marginBottom: '0.5rem'
                    }}>
                        {userEmail}
                    </div>
                    <button 
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer'
                        }}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
            
            {/* Main content */}
            <main style={{ 
                marginLeft: '256px', 
                flex: 1, 
                padding: '2rem' 
            }}>
                {/* Header */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '2rem', 
                            fontWeight: 'bold',
                            margin: 0,
                            marginBottom: '0.5rem'
                        }}>
                            Clientes
                        </h1>
                        <p style={{ 
                            color: '#64748b',
                            margin: 0
                        }}>
                            Gestiona tu cartera de clientes
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        ➕ Nuevo Cliente
                    </button>
                </div>

                {/* Formulario de nuevo cliente */}
                {showForm && (
                    <div style={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ 
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem'
                        }}>
                            Añadir Nuevo Cliente
                        </h3>
                        
                        <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div>
                                <label style={{ 
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    marginBottom: '0.25rem'
                                }}>
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nombre completo"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ 
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    marginBottom: '0.25rem'
                                }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="email@ejemplo.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ 
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    marginBottom: '0.25rem'
                                }}>
                                    Teléfono
                                </label>
                                <input
                                    type="text"
                                    placeholder="+34 600 000 000"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ 
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    marginBottom: '0.25rem'
                                }}>
                                    Empresa
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nombre de la empresa"
                                    value={formData.company}
                                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                                onClick={addClient}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Añadir Cliente
                            </button>
                            <button 
                                onClick={() => setShowForm(false)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista de clientes */}
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1rem'
                }}>
                    {loading ? (
                        <div style={{ 
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '2rem',
                            color: '#64748b'
                        }}>
                            Cargando clientes...
                        </div>
                    ) : clients.length === 0 ? (
                        <div style={{ 
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '2rem',
                            color: '#64748b'
                        }}>
                            No tienes clientes todavía
                        </div>
                    ) : (
                        clients.map((client) => (
                            <div 
                                key={client.id} 
                                style={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    padding: '1.5rem',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    transition: 'box-shadow 0.2s'
                                }}
                            >
                                <div style={{ 
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '1rem'
                                }}>
                                    <div>
                                        <h3 style={{ 
                                            fontSize: '1.125rem',
                                            fontWeight: 'bold',
                                            margin: 0,
                                            marginBottom: '0.25rem'
                                        }}>
                                            {client.name}
                                        </h3>
                                        {client.company && (
                                            <p style={{ 
                                                color: '#64748b',
                                                fontSize: '0.875rem',
                                                margin: 0
                                            }}>
                                                {client.company}
                                            </p>
                                        )}
                                    </div>
                                    {client.tag && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            backgroundColor: '#dbeafe',
                                            color: '#1d4ed8',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px'
                                        }}>
                                            {client.tag}
                                        </span>
                                    )}
                                </div>
                                
                                <div style={{ 
                                    marginBottom: '1rem',
                                    fontSize: '0.875rem',
                                    color: '#64748b'
                                }}>
                                    {client.email && (
                                        <div style={{ marginBottom: '0.25rem' }}>
                                            📧 {client.email}
                                        </div>
                                    )}
                                    {client.phone && (
                                        <div style={{ marginBottom: '0.25rem' }}>
                                            📞 {client.phone}
                                        </div>
                                    )}
                                    <div>
                                        📅 {new Date(client.created_at).toLocaleDateString('es-ES')}
                                    </div>
                                </div>
                                
                                <Link 
                                    href={`/dashboard/clients/${client.id}`}
                                    style={{
                                        display: 'inline-block',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        textDecoration: 'none',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        border: '1px solid #d1d5db'
                                    }}
                                >
                                    👁️ Ver detalles
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
