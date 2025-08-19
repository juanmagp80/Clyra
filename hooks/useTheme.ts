'use client';
import { useTheme as useThemeOriginal } from '@/contexts/ThemeContext';

export function useThemeSafe() {
    try {
        return useThemeOriginal();
    } catch (error) {
        // Fallback durante desarrollo o problemas de hydratación
        console.warn('ThemeProvider no disponible, usando valores por defecto');
        return {
            theme: 'light' as const,
            toggleTheme: () => {
                console.warn('toggleTheme no disponible');
            },
            setTheme: () => {
                console.warn('setTheme no disponible');
            },
            mounted: false
        };
    }
}

export { useThemeOriginal as useTheme };
