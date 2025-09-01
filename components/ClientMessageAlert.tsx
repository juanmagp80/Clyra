'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { useClientMessages } from '@/hooks/useClientMessages';
import { cn } from '@/src/lib/utils';
import { MessageCircle, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClientMessageAlertProps {
    userEmail: string;
    className?: string;
}

export default function ClientMessageAlert({ userEmail, className }: ClientMessageAlertProps) {
    const { unreadCount } = useClientMessages(userEmail);
    const router = useRouter();

    const handleClick = () => {
        router.push('/dashboard/client-communications');
    };

    return (
        <div className={cn('relative', className)}>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleClick}
                className={cn(
                    'relative p-2 rounded-lg transition-all duration-200',
                    'hover:bg-slate-100 dark:hover:bg-slate-800',
                    unreadCount > 0 && 'animate-pulse'
                )}
                title={unreadCount > 0 ? `Tienes ${unreadCount} mensajes nuevos de clientes` : 'Sin mensajes nuevos'}
            >
                {unreadCount > 0 ? (
                    <MessageCircle className="w-5 h-5 text-green-600" />
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
        </div>
    );
}
