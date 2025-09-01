"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/src/lib/utils';
import {
    AlertCircle,
    Bell,
    BellOff,
    CheckCircle,
    ExternalLink,
    Info,
    MessageCircle,
    Trash2,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface NotificationBellProps {
    userEmail?: string;
    className?: string;
}

export default function NotificationBell({ userEmail, className }: NotificationBellProps) {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications(userEmail);

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Cerrar dropdown cuando se haga click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Función para manejar click en notificación
    const handleNotificationClick = async (notification: any) => {
        // Marcar como leída
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        // Navegar si tiene una ruta
        if (notification.route) {
            router.push(notification.route);
            setIsOpen(false);
        }
    };

    // Obtener icono según el tipo
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-yellow-600" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            case 'info':
                return <Info className="w-4 h-4 text-blue-600" />;
            default:
                return <MessageCircle className="w-4 h-4 text-slate-600" />;
        }
    };

    // Formatear fecha
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return date.toLocaleDateString();
    };

    return (
        <div className={cn('relative', className)} ref={dropdownRef}>
            {/* Botón de campana */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'relative p-2 rounded-lg transition-all duration-200',
                    'hover:bg-slate-100 dark:hover:bg-slate-800',
                    isOpen && 'bg-slate-100 dark:bg-slate-800'
                )}
            >
                {unreadCount > 0 ? (
                    <Bell className="w-5 h-5 text-indigo-600 animate-pulse" />
                ) : (
                    <BellOff className="w-5 h-5 text-slate-600" />
                )}
                {/* Badge de contador */}
                {unreadCount > 0 && (
                    <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-bounce"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {/* Dropdown de notificaciones */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 max-h-[32rem] overflow-hidden">
                    {/* Header */}
                    <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                                Notificaciones
                            </h3>
                            <div className="flex items-center gap-1 sm:gap-2">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={markAllAsRead}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1"
                                    >
                                        Marcar todas
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                    className="p-1"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Lista de notificaciones */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-slate-500">
                                <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p className="text-sm">Cargando...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 sm:p-8 text-center">
                                <BellOff className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium text-sm">No hay notificaciones</p>
                                <p className="text-slate-400 text-xs mt-1">Te notificaremos cuando tengas nuevas alertas</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            'p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group',
                                            !notification.is_read && 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-blue-500'
                                        )}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            {/* Icono */}
                                            <div className="flex-shrink-0 mt-0.5">
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            {/* Contenido */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className={cn(
                                                        'text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight',
                                                        !notification.is_read && 'font-semibold'
                                                    )}>
                                                        {notification.title}
                                                    </h4>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <span className="text-xs text-slate-500">
                                                            {formatDate(notification.created_at)}
                                                        </span>
                                                        {notification.route && (
                                                            <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                                    {notification.message}
                                                </p>

                                                {/* Acciones */}
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        {!notification.is_read && (
                                                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                                                Nuevo
                                                            </Badge>
                                                        )}
                                                        {notification.type !== 'info' && (
                                                            <Badge 
                                                                variant={notification.type === 'error' ? 'destructive' : 'outline'}
                                                                className="text-xs px-1.5 py-0.5"
                                                            >
                                                                {notification.type === 'success' && 'Éxito'}
                                                                {notification.type === 'warning' && 'Aviso'}
                                                                {notification.type === 'error' && 'Error'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    router.push('/dashboard/notifications');
                                    setIsOpen(false);
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-800 w-full"
                            >
                                Ver todas las notificaciones
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
