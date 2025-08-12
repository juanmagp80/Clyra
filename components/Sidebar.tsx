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
  MessageCircle,
  Settings,
  Users,
  Zap,
  Bot,
  Presentation,
  Building2,
  Receipt,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  userEmail?: string;
  onLogout: () => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Clientes',
    href: '/dashboard/clients',
    icon: Users,
  },
  {
    name: 'Proyectos',
    href: '/dashboard/projects',
    icon: Briefcase,
  },
  {
    name: 'Templates',
    href: '/dashboard/templates',
    icon: Zap,
  },
  {
    name: 'Automaciones',
    href: '/dashboard/automations',
    icon: Bot,
  },
  {
    name: 'Propuestas',
    href: '/dashboard/proposals',
    icon: Presentation,
  },
  {
    name: 'Tareas',
    href: '/dashboard/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Tiempo',
    href: '/dashboard/time-tracking',
    icon: Clock,
  },
  {
    name: 'Facturas',
    href: '/dashboard/invoices',
    icon: FileText,
  },
  {
    name: 'Calendario',
    href: '/dashboard/calendar',
    icon: Calendar,
  },
  {
    name: 'Reportes',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
  {
    name: 'Email',
    href: '/dashboard/emails',
    icon: Mail,
  },
  {
    name: 'Comunicaciones',
    href: '/dashboard/client-communications',
    icon: MessageCircle,
  },
  {
    name: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
    submenu: [
      {
        name: 'General',
        href: '/dashboard/settings',
      },
      {
        name: 'Datos Fiscales 🏢',
        href: '/dashboard/settings/company',
        icon: Building2,
        highlight: true,
      }
    ]
  },
];

export default function Sidebar({ userEmail, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  return (
    <div className="flex h-full w-56 flex-col fixed inset-y-0 z-50 bg-white/95 backdrop-blur-2xl border-r border-slate-200/60 shadow-2xl shadow-slate-900/5">
      {/* Premium Logo - Más compacto */}
      <div className="flex h-12 items-center border-b border-slate-200/60 px-4 bg-gradient-to-r from-indigo-50/50 to-violet-50/50">
        <h1 className="text-lg font-black tracking-tight relative">
          <span className="relative bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
            Taskelio
            <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full opacity-80"></div>
          </span>
        </h1>
        <span className="ml-2 text-xs bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">
          PRO
        </span>
      </div>

      {/* Premium Navigation - Con submenús */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const IconComponent = item.icon;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedMenus.includes(item.name);
          const hasActiveSubmenu = hasSubmenu && item.submenu?.some(sub => 
            pathname === sub.href || pathname.startsWith(sub.href + '/')
          );

          return (
            <div key={item.name}>
              {hasSubmenu ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    'group flex items-center justify-between w-full px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-300 relative',
                    isActive || hasActiveSubmenu
                      ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-700 hover:text-indigo-900 hover:bg-white/80 hover:shadow-md hover:shadow-slate-900/5'
                  )}
                >
                  {(isActive || hasActiveSubmenu) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-violet-400 opacity-20 rounded-lg"></div>
                  )}
                  <div className="flex items-center">
                    <IconComponent
                      className={cn(
                        'mr-3 h-4 w-4 flex-shrink-0 transition-transform duration-300',
                        isActive || hasActiveSubmenu
                          ? 'text-white group-hover:scale-110'
                          : 'text-slate-600 group-hover:text-indigo-600 group-hover:scale-110'
                      )}
                    />
                    <span className="relative z-10">{item.name}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-current" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-current" />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-300 relative',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-700 hover:text-indigo-900 hover:bg-white/80 hover:shadow-md hover:shadow-slate-900/5'
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-violet-400 opacity-20 rounded-lg"></div>
                  )}
                  <IconComponent
                    className={cn(
                      'mr-3 h-4 w-4 flex-shrink-0 transition-transform duration-300',
                      isActive
                        ? 'text-white group-hover:scale-110'
                        : 'text-slate-600 group-hover:text-indigo-600 group-hover:scale-110'
                    )}
                  />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              )}

              {/* Submenú */}
              {hasSubmenu && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.submenu?.map((subItem) => {
                    const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                    const SubIcon = subItem.icon;
                    
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          'group flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200',
                          isSubActive
                            ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-900 shadow-sm'
                            : subItem.highlight
                            ? 'text-indigo-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 border border-indigo-200/50'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        )}
                      >
                        {SubIcon && (
                          <SubIcon
                            className={cn(
                              'mr-2 h-3 w-3 flex-shrink-0',
                              isSubActive ? 'text-indigo-600' : 'text-current'
                            )}
                          />
                        )}
                        {subItem.name}
                        {subItem.highlight && (
                          <div className="ml-auto w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Premium User section - Más compacto */}
      <div className="border-t border-slate-200/60 p-3 bg-gradient-to-r from-slate-50/50 to-indigo-50/30">
        <div className="flex items-center mb-3 p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-md shadow-slate-900/5">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-xs font-bold text-white">
                {userEmail?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-2 flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {userEmail?.split('@')[0] || 'Usuario'}
            </p>
            <p className="text-xs text-slate-600 truncate font-medium">
              {userEmail || 'Sin email'}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <Link href="/dashboard/settings">
            <Button variant="ghost" className="w-full justify-start text-slate-700 hover:text-indigo-900 hover:bg-white/80 rounded-lg font-semibold transition-all duration-300 hover:shadow-md hover:shadow-slate-900/5" size="sm">
              <Settings className="mr-2 h-3 w-3" />
              <span className="text-xs">Configuración</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50/80 rounded-lg font-semibold transition-all duration-300 hover:shadow-md hover:shadow-red-500/10"
            size="sm"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-3 w-3" />
            <span className="text-xs">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </div>
  );
}