/**
 * Utilidades para Dark Mode UI/UX
 * Clases optimizadas para todos los componentes
 */

export const darkModeClasses = {
    // Fondos principales
    background: {
        primary: "bg-slate-50 dark:bg-slate-950",
        secondary: "bg-white dark:bg-slate-900",
        tertiary: "bg-slate-100 dark:bg-slate-800",
        glass: "bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl",
        glassStrong: "bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl",
        card: "bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl",
        cardHover: "bg-white/90 dark:bg-slate-700/90",
    },

    // Texto
    text: {
        primary: "text-slate-900 dark:text-slate-100",
        secondary: "text-slate-700 dark:text-slate-300",
        tertiary: "text-slate-600 dark:text-slate-400",
        muted: "text-slate-500 dark:text-slate-500",
        accent: "text-purple-600 dark:text-purple-400",
        success: "text-green-600 dark:text-green-400",
        warning: "text-yellow-600 dark:text-yellow-400",
        danger: "text-red-600 dark:text-red-400",
    },

    // Bordes
    border: {
        primary: "border-slate-200 dark:border-slate-700",
        secondary: "border-slate-300 dark:border-slate-600",
        focus: "border-purple-500 dark:border-purple-400",
        success: "border-green-500 dark:border-green-400",
        warning: "border-yellow-500 dark:border-yellow-400",
        danger: "border-red-500 dark:border-red-400",
    },

    // Sombras
    shadow: {
        sm: "shadow-sm shadow-slate-900/5 dark:shadow-black/20",
        md: "shadow-md shadow-slate-900/10 dark:shadow-black/30",
        lg: "shadow-lg shadow-slate-900/15 dark:shadow-black/40",
        xl: "shadow-xl shadow-slate-900/20 dark:shadow-black/50",
        "2xl": "shadow-2xl shadow-slate-900/25 dark:shadow-black/60",
        colored: "shadow-2xl shadow-purple-500/20 dark:shadow-purple-500/30",
    },

    // Estados interactivos
    interactive: {
        hover: "hover:bg-slate-50 dark:hover:bg-slate-800",
        hoverCard: "hover:bg-white/80 dark:hover:bg-slate-700/80",
        hoverButton: "hover:bg-slate-100 dark:hover:bg-slate-700",
        focus: "focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-purple-400/30",
        active: "active:scale-95",
    },

    // Gradientes
    gradient: {
        background: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800",
        card: "bg-gradient-to-br from-white/60 to-white/40 dark:from-slate-800/60 dark:to-slate-900/40",
        text: "bg-gradient-to-r from-slate-900 via-purple-700 to-indigo-700 dark:from-slate-100 dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent",
        button: "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700",
        accent: "bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 dark:from-purple-400/10 dark:via-pink-400/10 dark:to-indigo-400/10",
    },

    // Inputs y forms
    input: {
        base: "bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500",
        focus: "focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-purple-400/30",
    },

    // Estados especiales
    states: {
        loading: "bg-slate-200 dark:bg-slate-700 animate-pulse",
        disabled: "opacity-50 cursor-not-allowed",
        success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
        warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
        error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    }
};

// Helper functions
export const combineClasses = (...classes: string[]) => classes.filter(Boolean).join(' ');

export const getThemeClasses = (category: keyof typeof darkModeClasses, variant: string) => {
    return darkModeClasses[category][variant as keyof typeof darkModeClasses[typeof category]] || '';
};

// Preset combinations for common patterns
export const presets = {
    page: combineClasses(
        darkModeClasses.background.primary,
        darkModeClasses.text.primary,
        "min-h-screen transition-colors duration-200"
    ),

    card: combineClasses(
        darkModeClasses.background.glass,
        darkModeClasses.border.primary,
        darkModeClasses.shadow.lg,
        "rounded-2xl border transition-all duration-300"
    ),

    cardInteractive: combineClasses(
        darkModeClasses.background.glass,
        darkModeClasses.border.primary,
        darkModeClasses.shadow.lg,
        darkModeClasses.interactive.hoverCard,
        "rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl"
    ),

    button: combineClasses(
        darkModeClasses.background.secondary,
        darkModeClasses.text.primary,
        darkModeClasses.border.primary,
        darkModeClasses.interactive.hover,
        darkModeClasses.interactive.focus,
        darkModeClasses.interactive.active,
        "px-4 py-2 rounded-lg border font-medium transition-all duration-200"
    ),

    input: combineClasses(
        darkModeClasses.input.base,
        darkModeClasses.input.focus,
        "px-4 py-3 rounded-xl border-2 font-medium transition-all duration-300"
    ),

    modal: combineClasses(
        darkModeClasses.background.glassStrong,
        darkModeClasses.border.primary,
        darkModeClasses.shadow["2xl"],
        "rounded-3xl border relative overflow-hidden"
    ),

    sidebar: combineClasses(
        darkModeClasses.background.glass,
        darkModeClasses.border.primary,
        darkModeClasses.shadow.xl,
        "border-r backdrop-blur-2xl"
    )
};
