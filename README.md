# Taskelio - CRM para Freelancers

Una aplicación SaaS moderna diseñada específicamente para freelancers que buscan organizar su negocio de manera simple y eficiente.

## ✨ Características

- **Gestión de Clientes**: Mantén toda la información organizada
- **Proyectos**: Planifica deadlines y haz seguimiento  
- **Facturación**: Crea facturas profesionales rápidamente
- **Métricas**: Visualiza tu progreso e ingresos
- **Autenticación Social**: Login con GitHub y Google
- **Demo Interactivo**: Prueba todas las funcionalidades

## 🚀 Inicio Rápido

### Opción 1: Modo Demo (Sin configuración)
```bash
# Clona el repositorio
git clone <tu-repo>
cd Taskelio

# Instala dependencias e inicia
./start.sh
```

### Opción 2: Funcionalidad Completa (Con Supabase)

1. **Configura Supabase**:
   - Ve a [supabase.com](https://supabase.com) y crea un proyecto gratuito
   - En Settings > API, copia tu Project URL y anon key
   - Edita `.env.local` y reemplaza los valores placeholder

2. **Configura OAuth (opcional)**:
   - En Authentication > Providers, habilita GitHub/Google
   - Añade la URL de callback: `http://localhost:3000/auth/callback`

3. **Inicia la aplicación**:
   ```bash
   npm install
   npm run dev
   ```

## 📂 Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── login/             # Página de inicio de sesión
│   ├── register/          # Página de registro
│   ├── dashboard/         # Panel principal
│   ├── auth/callback/     # Callback OAuth
├── components/            # Componentes reutilizables
├── src/lib/              # Configuración de Supabase
└── .env.local            # Variables de entorno
```

## 🎯 URLs Importantes

- **Landing**: `http://localhost:3000`
- **Login**: `http://localhost:3000/login`  
- **Registro**: `http://localhost:3000/register`
- **Dashboard**: `http://localhost:3000/dashboard`

## 🔧 Configuración de Variables de Entorno

Copia `.env.example` a `.env.local` y configura:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 📱 Funcionalidades

### Sin Configuración (Modo Demo)
- ✅ Interfaz completa y navegación
- ✅ Dashboard con datos ficticios  
- ✅ Diseño responsive
- ❌ Autenticación (solo UI)

### Con Supabase Configurado
- ✅ Todo lo anterior +
- ✅ Login/registro funcional
- ✅ Autenticación social (GitHub/Google)
- ✅ Persistencia de datos
- ✅ Sesiones de usuario

## 🚀 Deploy en Vercel

1. Conecta tu repositorio a [Vercel](https://vercel.com)
2. Añade las variables de entorno en el dashboard de Vercel
3. Actualiza `NEXT_PUBLIC_SITE_URL` con tu dominio de producción

## 📝 Licencia

MIT License - ve el archivo LICENSE para más detalles.
// Updated sáb 16 ago 2025 11:21:24 CEST
