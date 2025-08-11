'use client';

import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardClientSimple({ userEmail }: { userEmail: string }) {
    const supabase = createSupabaseClient();
    const router = useRouter();
    
    // Estados para las métricas
    const [totalClients, setTotalClients] = useState(0);
    const [loading, setLoading] = useState(true);

    const handleLogout = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Cargar métricas del dashboard
    const loadDashboardData = async () => {
        if (!supabase) return;
        
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            // Contar clientes
            const { count: clientsCount } = await supabase
                .from('clients')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            setTotalClients(clientsCount || 0);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
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
                    Taskelio
                    <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px',
                        marginLeft: '0.5rem'
                    }}>
                        PRO
                    </span>
                </div>
                
                <nav style={{ marginBottom: '2rem' }}>
                    <Link href="/dashboard" style={{ 
                        display: 'block',
                        padding: '0.5rem',
                        color: '#1e293b',
                        textDecoration: 'none',
                        marginBottom: '0.5rem',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '0.375rem',
                        fontWeight: '500'
                    }}>
                        🏠 Dashboard
                    </Link>
                    <Link href="/dashboard/clients" style={{ 
                        display: 'block',
                        padding: '0.5rem',
                        color: '#64748b',
                        textDecoration: 'none',
                        marginBottom: '0.5rem',
                        borderRadius: '0.375rem'
                    }}>
                        👥 Clientes
                    </Link>
                    <div style={{ 
                        padding: '0.5rem',
                        color: '#94a3b8',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem'
                    }}>
                        📁 Proyectos (Próximamente)
                    </div>
                    <div style={{ 
                        padding: '0.5rem',
                        color: '#94a3b8',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem'
                    }}>
                        📅 Calendario (Próximamente)
                    </div>
                    <div style={{ 
                        padding: '0.5rem',
                        color: '#94a3b8',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem'
                    }}>
                        💰 Facturación (Próximamente)
                    </div>
                </nav>

                <div style={{ 
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '1rem'
                }}>
                    <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#dbeafe',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#1d4ed8'
                        }}>
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ 
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#1e293b'
                            }}>
                                {userEmail.split('@')[0]}
                            </div>
                            <div style={{ 
                                fontSize: '0.75rem',
                                color: '#64748b'
                            }}>
                                {userEmail}
                            </div>
                        </div>
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
                        🚪 Cerrar sesión
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
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ 
                        fontSize: '2rem', 
                        fontWeight: 'bold',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }}>
                        Dashboard
                    </h1>
                    <p style={{ 
                        color: '#64748b',
                        margin: 0
                    }}>
                        Resumen de tu actividad freelance
                    </p>
                </div>

                {/* Stats Grid */}
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem'
                        }}>
                            <h3 style={{ 
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#64748b',
                                margin: 0
                            }}>
                                Total Clientes
                            </h3>
                            <span style={{ fontSize: '1.25rem' }}>👥</span>
                        </div>
                        <div style={{ 
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: '#1e293b',
                            marginBottom: '0.25rem'
                        }}>
                            {loading ? '...' : totalClients}
                        </div>
                        <p style={{ 
                            fontSize: '0.75rem',
                            color: '#64748b',
                            margin: 0
                        }}>
                            Clientes registrados
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem'
                        }}>
                            <h3 style={{ 
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#64748b',
                                margin: 0
                            }}>
                                Proyectos Activos
                            </h3>
                            <span style={{ fontSize: '1.25rem' }}>📁</span>
                        </div>
                        <div style={{ 
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: '#1e293b',
                            marginBottom: '0.25rem'
                        }}>
                            0
                        </div>
                        <p style={{ 
                            fontSize: '0.75rem',
                            color: '#64748b',
                            margin: 0
                        }}>
                            Próximamente disponible
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem'
                        }}>
                            <h3 style={{ 
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#64748b',
                                margin: 0
                            }}>
                                Ingresos Mensuales
                            </h3>
                            <span style={{ fontSize: '1.25rem' }}>💰</span>
                        </div>
                        <div style={{ 
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: '#1e293b',
                            marginBottom: '0.25rem'
                        }}>
                            €0
                        </div>
                        <p style={{ 
                            fontSize: '0.75rem',
                            color: '#64748b',
                            margin: 0
                        }}>
                            Próximamente disponible
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1rem'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ 
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem'
                        }}>
                            Acciones Rápidas
                        </h3>
                        <p style={{ 
                            color: '#64748b',
                            fontSize: '0.875rem',
                            marginBottom: '1rem'
                        }}>
                            Tareas más frecuentes
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Link 
                                href="/dashboard/clients"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.375rem',
                                    textDecoration: 'none',
                                    color: '#374151',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <span style={{ marginRight: '0.5rem' }}>➕</span>
                                Añadir Cliente
                            </Link>
                            
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.75rem',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.375rem',
                                color: '#64748b'
                            }}>
                                <span style={{ marginRight: '0.5rem' }}>📁</span>
                                Crear Proyecto (Próximamente)
                            </div>
                            
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.75rem',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.375rem',
                                color: '#64748b'
                            }}>
                                <span style={{ marginRight: '0.5rem' }}>🧾</span>
                                Nueva Factura (Próximamente)
                            </div>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ 
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem'
                        }}>
                            Bienvenido a Taskelio
                        </h3>
                        <p style={{ 
                            color: '#64748b',
                            fontSize: '0.875rem',
                            marginBottom: '1rem'
                        }}>
                            Tu CRM profesional para freelancers
                        </p>
                        
                        <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                            <p style={{ marginBottom: '0.5rem' }}>
                                ✅ Gestión de clientes completada
                            </p>
                            <p style={{ marginBottom: '0.5rem', color: '#64748b' }}>
                                🔄 Proyectos en desarrollo
                            </p>
                            <p style={{ marginBottom: '0.5rem', color: '#64748b' }}>
                                🔄 Facturación en desarrollo
                            </p>
                            <p style={{ marginBottom: '0.5rem', color: '#64748b' }}>
                                🔄 Control de tiempo en desarrollo
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
