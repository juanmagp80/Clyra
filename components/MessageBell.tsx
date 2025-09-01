'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { useClientMessages } from '@/hooks/useClientMessages';
import { cn } from '@/src/lib/utils';
import {
    MessageCircle,
    MessageSquare,
    User,
    X,
    Clock,
    ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface MessageBellProps {
    userEmail?: string;
    className?: string;
}

export default function MessageBell({ userEmail, className }: MessageBellProps) {
    const {
        messages,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead
    } = useClientMessages(userEmail);

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

    // Función para manejar click en mensaje
    const handleMessageClick = async (message: any) => {
        // Marcar como leído
        if (!message.is_read) {
            await markAsRead(message.id);
        }

        // Navegar a comunicaciones con el cliente
        router.push('/dashboard/client-communications');
        setIsOpen(false);
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
            {/* Botón de mensajes */}
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
                    <MessageCircle className="w-5 h-5 text-green-600 animate-pulse" />
                ) : (
                    <MessageSquare className="w-5 h-5 text-slate-600" />
                )}
                
                {/* Badge de contador */}
                {unreadCount > 0 && (
                    <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-bounce bg-green-600 hover:bg-green-600"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {/* Dropdown de mensajes */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 max-h-[32rem] overflow-hidden">
                    {/* Header */}
                    <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-green-600" />
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                                    Mensajes de Clientes
                                </h3>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={markAllAsRead}
                                        className="text-xs text-green-600 hover:text-green-800 px-2 py-1"
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

                    {/* Lista de mensajes */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-slate-500">
                                <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p className="text-sm">Cargando...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="p-6 sm:p-8 text-center">
                                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium text-sm">No hay mensajes nuevos</p>
                                <p className="text-slate-400 text-xs mt-1">Te notificaremos cuando recibas nuevos mensajes</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            'p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group',
                                            !message.is_read && 'bg-green-50/50 dark:bg-green-900/10 border-l-4 border-l-green-500'
                                        )}
                                        onClick={() => handleMessageClick(message)}
                                    >
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0 mt-0.5">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                            </div>

                                            {/* Contenido */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className={cn(
                                                        'text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight',
                                                        !message.is_read && 'font-semibold'
                                                    )}>
                                                        {message.client_name}
                                                    </h4>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        <span className="text-xs text-slate-500">
                                                            {formatDate(message.created_at)}
                                                        </span>
                                                        <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                                
                                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                                    {message.message}
                                                </p>

                                                {/* Badge de nuevo */}
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        {!message.is_read && (
                                                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 border-green-200">
                                                                Nuevo
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {messages.length > 0 && (
                        <div className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    router.push('/dashboard/client-communications');
                                    setIsOpen(false);
                                }}
                                className="text-xs text-green-600 hover:text-green-800 w-full"
                            >
                                Ver todas las conversaciones
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
