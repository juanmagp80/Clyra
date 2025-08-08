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
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div
                className={`relative bg-white rounded-3xl shadow-2xl border border-white/80 ${width} w-full p-8 animate-modalPop z-[9999999]`}
                style={{ minWidth: 320 }}
            >
                <button
                    className="absolute top-4 right-4 text-slate-400 hover:text-pink-600 transition-colors text-2xl font-bold focus:outline-none"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    ×
                </button>
                {title && (
                    <h2 className="text-2xl font-bold mb-6 text-gradient bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                        {title}
                    </h2>
                )}
                <div>{children}</div>
            </div>
        </div>
    );
}
