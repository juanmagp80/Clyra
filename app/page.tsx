import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Mail,
  Star,
  Users
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Gestión de Clientes",
      description: "Organiza toda la información de tus clientes en un solo lugar"
    },
    {
      icon: Calendar,
      title: "Calendario Integrado",
      description: "Programa y gestiona tus citas y reuniones eficientemente"
    },
    {
      icon: DollarSign,
      title: "Facturación Automática",
      description: "Crea y envía facturas profesionales con un solo clic"
    },
    {
      icon: Clock,
      title: "Control de Tiempo",
      description: "Registra el tiempo dedicado a cada proyecto y cliente"
    },
    {
      icon: BarChart3,
      title: "Reportes Detallados",
      description: "Analiza tu rendimiento con gráficos y estadísticas"
    },
    {
      icon: Mail,
      title: "Email Marketing",
      description: "Mantén comunicación constante con tus clientes"
    }
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Diseñadora Freelance",
      content: "Clyra me ha ayudado a organizar mejor mi negocio y aumentar mis ingresos un 40%"
    },
    {
      name: "Carlos Ruiz",
      role: "Consultor IT",
      content: "La mejor inversión que he hecho para mi consultora. Ahorro 10 horas semanales"
    },
    {
      name: "Ana López",
      role: "Marketing Digital",
      content: "Interface intuitiva y todas las funciones que necesito en un solo lugar"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">Clyra</h1>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              PRO
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Comenzar gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            El CRM perfecto para <span className="text-primary">freelancers</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gestiona clientes, proyectos, tiempo y facturación desde una sola plataforma.
            Diseñado especialmente para profesionales independientes.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Comenzar gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Ver demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Sin tarjeta de crédito • Configuración en 2 minutos
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Todo lo que necesitas</h2>
            <p className="text-xl text-muted-foreground">
              Funcionalidades diseñadas para impulsar tu negocio freelance
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto text-center">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">2.5k+</h3>
              <p className="text-muted-foreground">Freelancers activos</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">€1.2M+</h3>
              <p className="text-muted-foreground">Facturado en la plataforma</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">98%</h3>
              <p className="text-muted-foreground">Satisfacción del cliente</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Lo que dicen nuestros usuarios</h2>
            <p className="text-xl text-muted-foreground">
              Freelancers como tú ya están creciendo con Clyra
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para hacer crecer tu negocio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de freelancers que ya confían en Clyra
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Comenzar ahora gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Clyra. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}