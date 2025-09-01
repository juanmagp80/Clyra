'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
    MessageCircle, 
    Send, 
    Paperclip, 
    Clock, 
    CheckCircle,
    AlertCircle,
    User,
    Building2,
    ArrowLeft,
    RefreshCw
} from 'lucide-react';

interface ClientInfo {
    id: string;
    name: string;
    company?: string;
    is_valid: boolean;
}

interface FreelancerInfo {
    name: string;
    company?: string;
    email: string;
}

interface Message {
    id: string;
    message: string;
    sender_type: 'client' | 'freelancer';
    attachments: string[];
    created_at: string;
    is_read: boolean;
}

export default function ClientPortalPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    // Estados principales
    const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
    const [freelancerInfo, setFreelancerInfo] = useState<FreelancerInfo | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para nuevo mensaje
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);

    useEffect(() => {
        if (token) {
            validateTokenAndLoadData();
        }
    }, [token]);

    // Actualización automática de mensajes cada 3 segundos
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (clientInfo) {
            interval = setInterval(() => {
                loadMessages();
            }, 3000); // Actualizar cada 3 segundos
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [clientInfo]);

    const validateTokenAndLoadData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔍 Validating token:', token);

            // Validar token y obtener información del cliente
            const response = await fetch('/api/client-portal/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error:', errorText);
                
                // Intentar parsear como JSON
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.details || errorData.error || 'Error de servidor');
                } catch (parseError) {
                    // Si no es JSON válido, es probablemente HTML (página de error)
                    if (errorText.includes('<!DOCTYPE')) {
                        throw new Error('El servidor devolvió una página HTML en lugar de datos JSON. Esto suele indicar un problema de configuración o que la ruta API no existe.');
                    }
                    throw new Error(errorText || 'Error de conexión');
                }
            }

            const data = await response.json();
            console.log('✅ Token validation success:', data);
            console.log('👤 Freelancer info received:', data.freelancer);

            if (!data.client.is_valid) {
                throw new Error('Este enlace ha expirado o no es válido');
            }

            setClientInfo(data.client);
            setFreelancerInfo(data.freelancer);
            console.log('💾 FreelancerInfo set to:', data.freelancer);

            // Cargar mensajes
            await loadMessages();
        } catch (error: any) {
            console.error('❌ Error validating token:', error);
            setError(error.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const response = await fetch('/api/client-portal/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            setSending(true);

            const response = await fetch('/api/client-portal/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    token, 
                    message: newMessage,
                    attachments: [] // TODO: Implementar subida de archivos
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error enviando mensaje');
            }

            // Limpiar formulario
            setNewMessage('');
            setAttachments([]);

            // Recargar mensajes
            await loadMessages();

            // Scroll al final
            setTimeout(() => {
                const messagesContainer = document.getElementById('messages-container');
                if (messagesContainer) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }, 100);

        } catch (error: any) {
            console.error('Error sending message:', error);
            alert('Error enviando mensaje: ' + error.message);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffHours < 24) {
            return date.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else {
            return date.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit',
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Validando acceso...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                    <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Denegado</h2>
                        <p className="text-slate-600 mb-4">{error}</p>
                        
                        {/* Información adicional para debugging */}
                        <div className="bg-slate-50 rounded-lg p-4 mb-4 text-left">
                            <h3 className="font-medium text-slate-800 mb-2">Información de debugging:</h3>
                            <ul className="text-sm text-slate-600 space-y-1">
                                <li>• Token: {token?.substring(0, 8)}...</li>
                                <li>• URL actual: {window.location.href}</li>
                                <li>• Si el problema persiste, contacta al freelancer que te envió este enlace</li>
                            </ul>
                        </div>
                        
                        <div className="flex gap-3">
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="flex-1"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reintentar
                            </Button>
                            <Button
                                onClick={() => router.push('/')}
                                variant="outline"
                                className="flex-1"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver al Inicio
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
            {/* Header */}
            <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-slate-900">
                                Portal de Comunicación
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                                <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {clientInfo?.name}
                                </div>
                                {clientInfo?.company && (
                                    <div className="flex items-center gap-1">
                                        <Building2 className="w-4 h-4" />
                                        {clientInfo.company}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-xs text-slate-500 mt-1">Conectado</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Container */}
            <div className="max-w-4xl mx-auto p-4">
                <Card className="h-[calc(100vh-200px)] flex flex-col">
                    {/* Messages Area */}
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <div 
                            id="messages-container"
                            className="h-full overflow-y-auto p-4 space-y-4"
                        >
                            {messages.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">
                                        ¡Hola {clientInfo?.name}! 👋
                                    </p>
                                    <p className="text-slate-400 text-sm mt-2">
                                        Puedes escribirme cualquier pregunta o comentario.
                                        <br />
                                        Te responderé lo antes posible.
                                    </p>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isClient = message.sender_type === 'client';
                                    const isFreelancer = message.sender_type === 'freelancer';
                                    
                                                    // Debug info
                                                    if (isFreelancer) {
                                                        console.log('🔍 Freelancer message debug:', {
                                                            freelancerInfo,
                                                            hasCompany: freelancerInfo?.company,
                                                            companyTrimmed: freelancerInfo?.company?.trim(),
                                                            hasName: freelancerInfo?.name
                                                        });
                                                    }
                                                    
                                                    const freelancerDisplayName = (() => {
                                                        if (!freelancerInfo) return 'Freelancer';
                                                        if (freelancerInfo.company && freelancerInfo.company.trim() !== '') {
                                                            return freelancerInfo.company;
                                                        }
                                                        return freelancerInfo.name || 'Freelancer';
                                                    })();
                                                    
                                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${
                                                isClient ? 'justify-end' : 'justify-start'
                                            }`}
                                        >
                                            <div className={`flex items-start gap-3 max-w-xs lg:max-w-md ${isClient ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {/* Avatar */}
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                                                    isClient 
                                                        ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                                                        : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                                                }`}>
                                                    <User className="w-4 h-4 text-white" />
                                                </div>

                                                <div className="flex flex-col">
                                                    {/* Nombre del remitente */}
                                                    <div className={`text-xs font-medium mb-1 ${
                                                        isClient 
                                                            ? 'text-right text-emerald-600' 
                                                            : 'text-left text-blue-600'
                                                    }`}>
                                                        {isClient ? clientInfo?.name || 'Tú' : freelancerDisplayName}
                                                    </div>

                                                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                                                        isClient
                                                            ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-br-md'
                                                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-slate-900 rounded-bl-md'
                                                    }`}>
                                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                                            {message.message}
                                                        </p>
                                                        
                                                        {message.attachments && message.attachments.length > 0 && (
                                                            <div className="mt-2 space-y-1">
                                                                {message.attachments.map((attachment, index) => (
                                                                    <div key={index} className="flex items-center gap-2 text-xs">
                                                                        <Paperclip className="w-3 h-3" />
                                                                        <span className="underline cursor-pointer">
                                                                            {attachment}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        <div className={`flex items-center gap-1 mt-2 text-xs ${
                                                            isClient
                                                                ? 'text-white/70'
                                                                : 'text-blue-600/70'
                                                        }`}>
                                                            <Clock className="w-3 h-3" />
                                                            {formatMessageTime(message.created_at)}
                                                            {isClient && (
                                                                <CheckCircle className="w-3 h-3 ml-1" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>

                    {/* Message Input */}
                    <div className="border-t border-slate-200 p-4">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <div className="relative">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Escribe tu mensaje..."
                                        className="pr-12 resize-none"
                                        disabled={sending}
                                    />
                                    {attachments.length > 0 && (
                                        <div className="absolute -top-8 left-0 bg-slate-100 text-xs px-2 py-1 rounded">
                                            {attachments.length} archivo(s)
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <Button
                                onClick={sendMessage}
                                disabled={!newMessage.trim() || sending}
                                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4"
                            >
                                {sending ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            Tu mensaje se enviará directamente. Responderé lo antes posible. 🚀
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
