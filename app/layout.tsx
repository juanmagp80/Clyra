import type { Metadata } from 'next';
import './globals.css';
import './fallback.css';

export const metadata: Metadata = {
  title: 'Clyra - Gestión de Clientes',
  description: 'Sistema de gestión de clientes con Supabase y Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
