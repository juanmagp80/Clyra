'use client';

import { Button } from '@/components/ui/Button';
import { cn } from '@/src/lib/utils';
import {
  BarChart3,
  Briefcase,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  Home,
  LogOut,
  Mail,
  Settings,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  {
    name: 'Dashboard',
    href: '/demo',
    icon: Home,
  },
  {
    name: 'Clientes',
    href: '/demo/clients',
    icon: Users,
  },
  {
    name: 'Proyectos',
    href: '/demo/projects',
    icon: Briefcase,
  },
  {
    name: 'Tareas',
    href: '/demo/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Tiempo',
    href: '/demo/time-tracking',
    icon: Clock,
  },
  {
    name: 'Facturas',
    href: '/demo/invoices',
    icon: FileText,
  },
  {
    name: 'Calendario',
    href: '/demo/calendar',
    icon: Calendar,
  },
  {
    name: 'Reportes',
    href: '/demo/reports',
    icon: BarChart3,
  },
  {
    name: 'Email',
    href: '/demo/email',
    icon: Mail,
  },
];

export default function DemoSidebar() {
  const pathname = usePathname();

  const handleDemoLogout = () => {
    // Para el demo, redirigir a la landing page
    window.location.href = '/';
  };

  return (
    <div className="flex h-full w-64 flex-col fixed inset-y-0 z-50 bg-card border-r">
      {/* Logo tipográfico con badge de Demo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black tracking-tight relative">
            <span className="relative text-foreground">
              Taskelio
              {/* Punto decorativo sutil */}
              <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full opacity-70"></div>
            </span>
          </h1>
        </div>
        <span className="ml-3 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
          DEMO
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (pathname !== '/demo' && pathname.startsWith(item.href + '/'));
          const IconComponent = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <IconComponent
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Demo User section */}
      <div className="border-t p-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                U
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Usuario Demo
            </p>
            <p className="text-xs text-muted-foreground truncate">
              demo@taskelio.com
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <Link href="/demo/settings">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            size="sm"
            onClick={handleDemoLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Salir del Demo
          </Button>
        </div>
      </div>
    </div>
  );
}
