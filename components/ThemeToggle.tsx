'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export default function ThemeToggle() {
    const [isAnimating, setIsAnimating] = useState(false);
    const themeContext = useTheme();
    const theme = themeContext?.theme || 'light';
    const toggleTheme = themeContext?.toggleTheme || (() => {});
    const mounted = themeContext?.mounted ?? true;

    const handleToggle = () => {
        setIsAnimating(true);
        toggleTheme();
        setTimeout(() => setIsAnimating(false), 600);
    };

    // Mostrar un placeholder mientras se monta
    if (!mounted) {
        return (
            <div className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-white/60 dark:border-slate-700/60 rounded-2xl shadow-xl w-12 h-12 flex items-center justify-center">
                <div className="w-6 h-6 bg-slate-300 dark:bg-slate-600 rounded-full animate-pulse"></div>
            </div>
        );
    }

    return (
        <button
            onClick={handleToggle}
            className={`group relative p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-white/60 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-600 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-500 overflow-hidden ${isAnimating ? 'animate-themeToggle' : ''
                }`}
            title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        >
            {/* Fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Contenedor de iconos */}
            <div className="relative w-6 h-6 flex items-center justify-center">
                {/* Icono de Sol - Modo Claro */}
                <Sun
                    className={`absolute w-6 h-6 text-yellow-500 dark:text-yellow-400 transition-all duration-500 transform ${theme === 'light'
                            ? 'rotate-0 scale-100 opacity-100'
                            : 'rotate-90 scale-0 opacity-0'
                        }`}
                />

                {/* Icono de Luna - Modo Oscuro */}
                <Moon
                    className={`absolute w-6 h-6 text-indigo-400 dark:text-indigo-300 transition-all duration-500 transform ${theme === 'dark'
                            ? 'rotate-0 scale-100 opacity-100'
                            : '-rotate-90 scale-0 opacity-0'
                        }`}
                />
            </div>

            {/* Efecto de brillo al hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm dark:from-purple-400/20 dark:via-indigo-400/20 dark:to-blue-400/20"></div>

            {/* Partículas flotantes */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1 left-1 w-1 h-1 bg-yellow-400 dark:bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-2 right-1 w-1 h-1 bg-orange-400 dark:bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute bottom-1 left-2 w-1 h-1 bg-pink-400 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>
        </button>
    );
}
