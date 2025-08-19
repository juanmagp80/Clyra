// Utilidades para aplicar modo oscuro consistentemente
export const darkModeClasses = {
    // Contenedores principales
    container: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500",

    // Cards y paneles
    card: "bg-white/60 dark:bg-slate-800/60 backdrop-blur-2xl border border-white/60 dark:border-slate-700/40 shadow-xl shadow-slate-500/5 dark:shadow-black/10 transition-colors duration-300",
    cardHover: "hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500",

    // Modales
    modal: "bg-white/95 dark:bg-slate-800/95 backdrop-blur-3xl rounded-3xl shadow-2xl shadow-black/30 border border-white/60 dark:border-slate-700/60 relative overflow-hidden animate-slideInUp transition-colors duration-300",
    modalOverlay: "fixed inset-0 bg-black/70 backdrop-blur-2xl z-50 flex items-start justify-center pt-8 pb-8 px-4 animate-fadeIn overflow-y-auto",

    // Inputs y forms
    input: "w-full px-4 py-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-500 focus:border-purple-500 dark:focus:border-purple-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-slate-900 dark:text-slate-100 font-semibold placeholder-slate-400 dark:placeholder-slate-500 shadow-lg focus:shadow-2xl transform focus:scale-[1.02]",

    // Botones
    buttonPrimary: "px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 dark:from-purple-500 dark:via-pink-500 dark:to-indigo-500 dark:hover:from-purple-600 dark:hover:via-pink-600 dark:hover:to-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 hover:-translate-y-1 transition-all duration-500",
    buttonSecondary: "px-8 py-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-xl border-2 border-white/60 dark:border-slate-600/60 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300",

    // Texto
    textPrimary: "text-slate-900 dark:text-slate-100 transition-colors duration-300",
    textSecondary: "text-slate-600 dark:text-slate-300 transition-colors duration-300",
    textMuted: "text-slate-500 dark:text-slate-400 transition-colors duration-300",

    // Headers y títulos
    headerGradient: "bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 dark:from-slate-100 dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent",

    // Sidebar y navegación
    sidebar: "bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-slate-200/60 dark:border-slate-700/60 shadow-2xl shadow-slate-900/5 dark:shadow-black/20 transition-colors duration-300",
    sidebarItem: "text-slate-700 dark:text-slate-300 hover:text-indigo-900 dark:hover:text-indigo-400 hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all duration-300",

    // Elementos interactivos
    interactive: "hover:scale-105 transition-transform duration-300",
    glass: "backdrop-blur-2xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/40",

    // Estados especiales
    success: "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700",
    warning: "text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700",
    error: "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700"
};

// Función helper para combinar clases
export const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

// Hook personalizado para modo oscuro
export const useDarkModeClass = (lightClass: string, darkClass: string = '') => {
    return `${lightClass} ${darkClass}`;
};
