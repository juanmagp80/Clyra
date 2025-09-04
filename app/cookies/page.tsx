import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Cookies | Taskelio',
  description: 'Información sobre el uso de cookies en Taskelio',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🍪 Política de Cookies
          </h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                ¿Qué son las cookies?
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo 
                cuando visitas un sitio web. Nos ayudan a hacer que tu experiencia sea mejor 
                al recordar tus preferencias y analizar cómo usas nuestro sitio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Tipos de cookies que utilizamos
              </h2>
              
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    🔒 Cookies Necesarias (Obligatorias)
                  </h3>
                  <p className="text-green-700 mb-2">
                    Esenciales para el funcionamiento básico del sitio.
                  </p>
                  <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
                    <li>Autenticación y sesión de usuario</li>
                    <li>Seguridad y prevención de fraudes</li>
                    <li>Preferencias de idioma</li>
                    <li>Carrito de compras y estado de la aplicación</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    📊 Cookies de Análisis (Opcionales)
                  </h3>
                  <p className="text-blue-700 mb-2">
                    Nos ayudan a entender cómo usas el sitio para mejorarlo.
                  </p>
                  <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
                    <li>Google Analytics - Estadísticas de uso</li>
                    <li>Tiempo de permanencia en páginas</li>
                    <li>Rutas de navegación más comunes</li>
                    <li>Dispositivos y navegadores utilizados</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">
                    🎯 Cookies de Marketing (Opcionales)
                  </h3>
                  <p className="text-purple-700 mb-2">
                    Para mostrarte contenido relevante en otros sitios.
                  </p>
                  <ul className="list-disc list-inside text-purple-600 text-sm space-y-1">
                    <li>Píxel de Facebook para remarketing</li>
                    <li>Google Ads para publicidad dirigida</li>
                    <li>Seguimiento de conversiones</li>
                    <li>Personalización de anuncios</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">
                    ⚙️ Cookies Funcionales (Opcionales)
                  </h3>
                  <p className="text-orange-700 mb-2">
                    Mejoran la funcionalidad recordando tus preferencias.
                  </p>
                  <ul className="list-disc list-inside text-orange-600 text-sm space-y-1">
                    <li>Tema oscuro/claro preferido</li>
                    <li>Configuración de dashboard</li>
                    <li>Preferencias de notificaciones</li>
                    <li>Chat de soporte (Intercom/Zendesk)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Gestionar tus preferencias
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 mb-3">
                  Puedes cambiar tus preferencias de cookies en cualquier momento:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Usando nuestro banner de cookies</li>
                  <li>Desde la configuración de tu navegador</li>
                  <li>Contactando con nosotros directamente</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Información de terceros
              </h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-700">Google Analytics</h3>
                <p className="text-gray-600 text-sm">
                  Usamos Google Analytics para analizar el uso del sitio. 
                  Puedes optar por no participar visitando: 
                  <a href="https://tools.google.com/dlpage/gaoptout" 
                     className="text-blue-600 hover:underline" 
                     target="_blank" 
                     rel="noopener noreferrer">
                    Google Analytics Opt-out
                  </a>
                </p>
              </div>
            </section>

            <section className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">
                💡 ¿Necesitas ayuda?
              </h2>
              <p className="text-blue-700">
                Si tienes preguntas sobre nuestras cookies, contacta con nosotros en:
                <a href="mailto:cookies@taskelio.com" className="text-blue-800 hover:underline font-medium">
                  cookies@taskelio.com
                </a>
              </p>
            </section>

            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                📄 Última actualización
              </h2>
              <p className="text-gray-600">
                Esta política fue actualizada por última vez el 4 de septiembre de 2025.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
