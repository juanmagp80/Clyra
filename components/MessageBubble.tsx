'use client';

import { useClientMessages } from '@/hooks/useClientMessages';
import { cn } from '@/src/lib/utils';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MessageBubbleProps {
    userEmail: string;
    className?: string;
}

export default function MessageBubble({ userEmail, className }: MessageBubbleProps) {
    const { unreadCount } = useClientMessages(userEmail);
    const router = useRouter();

    if (unreadCount === 0) return null;

    const handleClick = () => {
        router.push('/dashboard/client-communications');
    };

    return (
        <div className={cn('fixed top-4 right-4 z-50', className)}>
            <div 
                onClick={handleClick}
                className="relative cursor-pointer group animate-bounce"
            >
                {/* Bocadillo principal */}
                <div className="bg-green-500 text-white px-4 py-2 rounded-2xl shadow-lg border-2 border-green-600 max-w-xs">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-semibold">
                            {unreadCount === 1 
                                ? '¡Tienes 1 mensaje nuevo!' 
                                : `¡Tienes ${unreadCount} mensajes nuevos!`
                            }
                        </span>
                    </div>
                    
                    {/* Cola del bocadillo */}
                    <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                        <div className="w-3 h-3 bg-green-500 border-r-2 border-b-2 border-green-600 transform rotate-45"></div>
                    </div>
                </div>

                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl animate-pulse"></div>
                
                {/* Efectos de partículas */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
            </div>
        </div>
    );
}
