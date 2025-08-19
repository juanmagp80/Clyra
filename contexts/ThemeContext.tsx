'use client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Siempre usar tema claro
    const [theme, setTheme] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Forzar tema claro siempre
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('clyra-theme', 'light');
        setMounted(true);
    }, []);

    // Funciones deshabilitadas - no permiten cambio de tema
    const toggleTheme = () => {
        console.log('Tema toggle deshabilitado - usando solo modo claro');
    };

    const setThemeForced = (newTheme: Theme) => {
        console.log('Cambio de tema deshabilitado - usando solo modo claro');
        // Siempre mantener tema claro
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    };

    const value = {
        theme: 'light' as Theme,
        toggleTheme,
        setTheme: setThemeForced,
        mounted
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        // Siempre retornar tema claro por defecto
        return {
            theme: 'light' as Theme,
            toggleTheme: () => {
                console.log('Tema toggle deshabilitado - usando solo modo claro');
            },
            setTheme: (newTheme: Theme) => {
                console.log('Cambio de tema deshabilitado - usando solo modo claro');
            },
            mounted: false
        };
    }
    return context;
}
