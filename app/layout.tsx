import type { Metadata } from 'next';
import './globals.css';
import './fallback.css';

export const metadata: Metadata = {
  title: 'Taskelio — Tu CRM ligero para freelancers',
  description: 'Organiza clientes, tareas y proyectos. Todo en uno. El CRM que entiende tu forma de trabajar.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
