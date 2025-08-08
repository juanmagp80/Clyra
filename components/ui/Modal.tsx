import { ReactNode, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    width?: string;
}

export default function Modal({ isOpen, onClose, children, title, width = 'max-w-lg' }: ModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-md animate-fadeIn p-4">
            <div
                className={`relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 ${width} w-full max-w-2xl mx-auto transform transition-all duration-300 ease-out`}
                style={{ 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.3)'
                }}
            >
                <button
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 hover:bg-red-100 text-slate-500 hover:text-red-600 transition-all duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-pink-400"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    ×
                </button>

                <div className="px-8 py-10">
                    {title && (
                        <h2 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-600 bg-clip-text text-transparent text-center tracking-tight leading-tight">
                            {title}
                        </h2>
                    )}
                    <div className="space-y-6 text-slate-700 text-base leading-relaxed">{children}</div>
                </div>
            </div>
        </div>
    );
}