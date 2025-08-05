import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  DollarSign,
  Globe,
  Play,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Gestión de Clientes",
      description: "Mantén toda la información de tus clientes organizada y accesible.",
      highlight: "Fácil de usar"
    },
    {
      icon: Calendar,
      title: "Calendario de Proyectos",
      description: "Planifica deadlines y no vuelvas a perder una fecha importante.",
      highlight: "Organizativo"
    },
    {
      icon: DollarSign,
      title: "Facturación Rápida",
      description: "Crea facturas profesionales y haz seguimiento de pagos.",
      highlight: "Profesional"
    },
    {
      icon: BarChart3,
      title: "Métricas Claras",
      description: "Visualiza el progreso de tus proyectos y ingresos de forma simple.",
      highlight: "Visual"
    },
    {
      icon: Zap,
      title: "Flujo Simplificado",
      description: "Automatiza tareas repetitivas para ahorrar tiempo valioso.",
      highlight: "Eficiente"
    },
    {
      icon: Globe,
      title: "Acceso desde Cualquier Lugar",
      description: "Trabaja desde donde quieras con acceso web completo.",
      highlight: "Flexible"
    }
  ];

  const testimonials = [
    {
      name: "Ana García",
      role: "Diseñadora Freelance",
      company: "Madrid",
      content: "Taskelia me ayudó a organizar mejor mis proyectos. Ahora puedo enfocarme más en diseñar y menos en administrar.",
      growth: "Más organizada"
    },
    {
      name: "Carlos Ruiz",
      role: "Desarrollador Web",
      company: "Barcelona",
      content: "Las facturas automáticas me ahorran horas cada semana. Es exactamente lo que necesitaba.",
      growth: "5h/semana ahorradas"
    },
    {
      name: "María López",
      role: "Consultora Marketing",
      company: "Valencia",
      content: "Simple pero potente. Me permite gestionar mis clientes sin complicaciones innecesarias.",
      growth: "Más eficiente"
    }
  ];

  const metrics = [
    { value: "2K+", label: "Freelancers Activos", sublabel: "Y creciendo cada día" },
    { value: "€850K+", label: "Facturado por Usuarios", sublabel: "En los últimos 12 meses" },
    { value: "15h", label: "Tiempo Ahorrado/Semana", sublabel: "Promedio por usuario" },
    { value: "4.8★", label: "Calificación", sublabel: "800+ reseñas" }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Texto como logo principal - tipografía llamativa */}
            <h1 className="text-2xl font-black tracking-tight relative">
              <span className="relative text-white">
                Taskelia
                {/* Punto decorativo sutil */}
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-80 animate-pulse"></div>
              </span>
            </h1>
            <span className="text-xs bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-300 px-2 py-1 rounded-full">
              VERSIÓN BETA
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white border-white/20 hover:bg-white/10">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 border-0">
                Comenzar Ahora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-6xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">
              Gestión de proyectos freelance simplificada
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-none">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Organiza Tu
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Negocio
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Gestiona clientes, proyectos y facturas en un solo lugar.
            <span className="text-purple-400 font-semibold">Dedica más tiempo a lo que realmente importa</span>: crear.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-6 justify-center flex-wrap mb-8">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-lg px-12 py-4 rounded-full border-0 shadow-2xl shadow-purple-500/25 group">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-lg px-12 py-4 rounded-full border-0 shadow-2xl shadow-purple-500/25 group">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Ver Demo
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Configuración 2 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Cancela cuando quieras</span>
            </div>
          </div>
        </div>
      </section>
      {/* Metrics Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-2xl p-6 hover:from-white/10 hover:to-white/20 transition-all duration-300 hover:scale-105">
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {metric.value}
                  </h3>
                  <p className="text-white font-medium">{metric.label}</p>
                  <p className="text-sm text-gray-400 mt-1">{metric.sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Características principales</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Todo lo que necesitas
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                en un solo lugar
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Simplifica tu flujo de trabajo y enfócate en lo que mejor sabes hacer.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-gradient-to-br from-white/5 to-white/10 border-white/10 hover:from-white/10 hover:to-white/20 transition-all duration-300 hover:scale-105 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 group-hover:scale-110 transition-transform">
                        <IconComponent className="h-6 w-6 text-purple-300" />
                      </div>
                      <span className="text-xs bg-gradient-to-r from-green-400/20 to-emerald-400/20 border border-green-400/30 text-green-300 px-2 py-1 rounded-full">
                        {feature.highlight}
                      </span>
                    </div>
                    <CardTitle className="text-xl text-white group-hover:text-purple-300 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-32 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-gray-300">Lo que dicen nuestros usuarios</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Casos reales de
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                freelancers como tú
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experiencias auténticas de profesionales que usan Taskelia a diario.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-br from-white/5 to-white/10 border-white/10 hover:from-white/10 hover:to-white/20 transition-all duration-300 hover:scale-105 group overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-gray-300 text-base italic leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-purple-300">{testimonial.role}</p>
                      <p className="text-xs text-gray-400">{testimonial.company}</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-gradient-to-r from-green-400/20 to-emerald-400/20 border border-green-400/30 rounded-full px-3 py-1">
                        <span className="text-sm font-bold text-green-300">{testimonial.growth}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-32 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-none">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ¿Listo para
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                simplificar?
              </span>
            </h2>
            <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
              Únete a <span className="text-purple-400 font-bold">miles de freelancers</span> que ya organizaron su trabajo.
            </p>

            <div className="flex gap-6 justify-center flex-wrap mb-12">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-xl px-16 py-6 rounded-full border-0 shadow-2xl shadow-purple-500/25 group">
                  <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Comenzar Gratis
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Prueba gratis 14 días</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Sin costos de configuración</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              {/* Texto tipográfico para footer */}
              <h2 className="text-xl font-black tracking-tight relative">
                <span className="relative text-white">
                  Taskelia
                  {/* Punto decorativo sutil */}
                  <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-70"></div>
                </span>
              </h2>
            </div>
            <p className="text-gray-400 text-center">
              &copy; 2025 Taskelia. Herramientas simples para freelancers organizados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}