'use client';

import NotificationBell from '@/components/NotificationBell';
import Sidebar from '@/components/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useNotifications } from '@/hooks/useNotifications';
import {
    AlertCircle,
    Bell,
    BellOff,
    CheckCircle,
    ExternalLink,
    Info,
    MessageCircle,
    Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationsPageClientProps {
    userEmail: string;
}

export default function NotificationsPageClient({ userEmail }: NotificationsPageClientProps) {
    const router = useRouter();
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications(userEmail);

    const handleLogout = async () => {
        try {
            const { createSupabaseClient } = await import('@/src/lib/supabase-client');
            const supabase = createSupabaseClient();
            if (supabase) {
                await supabase.auth.signOut();
            }
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Función para manejar click en notificación
    const handleNotificationClick = async (notification: any) => {
        // Marcar como leída
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        // Navegar si tiene una ruta
        if (notification.route) {
            router.push(notification.route);
        }
    };

    // Obtener icono según el tipo
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-600" />;
            default:
                return <MessageCircle className="w-5 h-5 text-slate-600" />;
        }
    };

    // Obtener color de fondo según el tipo
    const getNotificationBgColor = (type: string, isRead: boolean) => {
        const base = isRead ? 'bg-white' : '';
        switch (type) {
            case 'success':
                return `${base} ${!isRead ? 'bg-green-50' : ''} border-green-200`;
            case 'warning':
                return `${base} ${!isRead ? 'bg-yellow-50' : ''} border-yellow-200`;
            case 'error':
                return `${base} ${!isRead ? 'bg-red-50' : ''} border-red-200`;
            case 'info':
                return `${base} ${!isRead ? 'bg-blue-50' : ''} border-blue-200`;
            default:
                return `${base} ${!isRead ? 'bg-slate-50' : ''} border-slate-200`;
        }
    };

    // Formatear fecha completa
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Agrupar notificaciones por fecha
    const groupNotificationsByDate = () => {
        const groups: { [key: string]: typeof notifications } = {};
        
        notifications.forEach(notification => {
            const date = new Date(notification.created_at);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            let key = '';
            if (date.toDateString() === today.toDateString()) {
                key = 'Hoy';
            } else if (date.toDateString() === yesterday.toDateString()) {
                key = 'Ayer';
            } else {
                key = date.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
            
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(notification);
        });
        
        return groups;
    };

    const groupedNotifications = groupNotificationsByDate();

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />
            
            <div className="flex-1 ml-56">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                    Notificaciones
                                </h1>
                                <p className="text-slate-600">
                                    Mantente al día con las alertas importantes de tu negocio
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <NotificationBell userEmail={userEmail} />
                                <Badge variant="secondary" className="text-sm">
                                    {unreadCount} sin leer
                                </Badge>
                                {unreadCount > 0 && (
                                    <Button
                                        onClick={markAllAsRead}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Marcar todas leídas
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contenido */}
                    {loading ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <div className="animate-pulse">
                                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">Cargando notificaciones...</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : notifications.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <BellOff className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                    No hay notificaciones
                                </h3>
                                <p className="text-slate-500 max-w-md mx-auto">
                                    Cuando tengas nuevas alertas sobre proyectos, clientes o facturas, 
                                    aparecerán aquí para mantenerte informado.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]) => (
                                <div key={dateGroup}>
                                    <h2 className="text-lg font-semibold text-slate-900 mb-4 sticky top-0 bg-slate-50 py-2">
                                        {dateGroup}
                                    </h2>
                                    
                                    <div className="space-y-3">
                                        {groupNotifications.map((notification) => (
                                            <Card
                                                key={notification.id}
                                                className={`transition-all hover:shadow-md cursor-pointer group ${
                                                    getNotificationBgColor(notification.type, notification.is_read)
                                                } ${!notification.is_read ? 'ring-2 ring-blue-100' : ''}`}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-4">
                                                        {/* Icono */}
                                                        <div className="flex-shrink-0 mt-1">
                                                            {getNotificationIcon(notification.type)}
                                                        </div>

                                                        {/* Contenido */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <h3 className={`font-medium text-slate-900 ${
                                                                        !notification.is_read ? 'font-semibold' : ''
                                                                    }`}>
                                                                        {notification.title}
                                                                    </h3>
                                                                    <p className="text-slate-600 mt-1 leading-relaxed">
                                                                        {notification.message}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 mt-3">
                                                                        <span className="text-sm text-slate-500">
                                                                            {formatDate(notification.created_at)}
                                                                        </span>
                                                                        
                                                                        {!notification.is_read && (
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                Nuevo
                                                                            </Badge>
                                                                        )}
                                                                        
                                                                        {notification.type !== 'info' && (
                                                                            <Badge 
                                                                                variant={notification.type === 'error' ? 'destructive' : 'outline'}
                                                                                className="text-xs"
                                                                            >
                                                                                {notification.type === 'success' && 'Éxito'}
                                                                                {notification.type === 'warning' && 'Aviso'}
                                                                                {notification.type === 'error' && 'Error'}
                                                                            </Badge>
                                                                        )}
                                                                        
                                                                        {notification.route && (
                                                                            <div className="flex items-center gap-1 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <ExternalLink className="w-3 h-3" />
                                                                                <span className="text-xs">Ir a página</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Acciones */}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteNotification(notification.id);
                                                                    }}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-100 hover:text-red-600"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
