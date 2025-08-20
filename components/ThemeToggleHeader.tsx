'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sparkles, Sun } from 'lucide-react';
import { useState } from 'react';

export default function ThemeToggleHeader() {
    const [isAnimating, setIsAnimating] = useState(false);
    let theme = 'light';
    let toggleTheme = () => { };
    let mounted = false;
    let themeContext: any = null;
    try {
        themeContext = useTheme();
    } catch (error) {
        themeContext = null;
    }
    if (themeContext) {
        theme = themeContext.theme;
        toggleTheme = themeContext.toggleTheme;
        mounted = themeContext.mounted;
    } else {
        mounted = true;
    }

    const handleToggle = () => {
        setIsAnimating(true);
        toggleTheme();
        setTimeout(() => setIsAnimating(false), 600);
    };

    // Mostrar un placeholder mientras se monta
    if (!mounted) {
        return (
            <div className="px-6 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-2 border-white/70 dark:border-slate-700/70 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-6 h-6 bg-slate-300 dark:bg-slate-600 rounded-full animate-pulse"></div>
                <div className="w-20 h-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
                <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"></div>
            </div>
        );
    }

    return (
        <button
            onClick={handleToggle}
            className={`group relative px-6 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-2 border-white/70 dark:border-slate-700/70 hover:border-purple-300 dark:hover:border-purple-500 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-500 overflow-hidden ${isAnimating ? 'animate-themeToggle' : ''
                }`}
            title={theme === 'light' ? 'Cambiar a modo oscuro 🌙' : 'Cambiar a modo claro ☀️'}
        >
            {/* Gradiente de fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 dark:from-purple-400/10 dark:via-pink-400/10 dark:to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Contenido del botón */}
            <div className="relative flex items-center gap-3 z-10">
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
                        className={`absolute w-6 h-6 text-indigo-500 dark:text-indigo-300 transition-all duration-500 transform ${theme === 'dark'
                                ? 'rotate-0 scale-100 opacity-100'
                                : '-rotate-90 scale-0 opacity-0'
                            }`}
                    />
                </div>

                {/* Texto */}
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                    {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                </span>

                {/* Sparkles decorativo */}
                <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
            </div>

            {/* Efecto de brillo al hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-pink-400/20 dark:from-purple-400/20 dark:via-indigo-400/20 dark:to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>

            {/* Border brillante animado */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-indigo-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>

            {/* Partículas flotantes mejoradas */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-400 dark:bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-3 right-3 w-1 h-1 bg-orange-400 dark:bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute bottom-2 left-4 w-1 h-1 bg-pink-400 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute bottom-3 right-2 w-1 h-1 bg-purple-400 dark:bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse" style={{ animationDelay: '0.9s' }}></div>
            </div>
        </button>
    );
}
