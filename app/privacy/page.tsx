import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad | Taskelio',
  description: 'Política de privacidad y protección de datos de Taskelio',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Política de Privacidad
          </h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. Información General
              </h2>
              <p className="text-gray-600 leading-relaxed">
                En Taskelio respetamos tu privacidad y estamos comprometidos con la protección 
                de tus datos personales. Esta política explica cómo recopilamos, usamos y 
                protegemos tu información personal de acuerdo con el Reglamento General de 
                Protección de Datos (RGPD).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                2. Datos que Recopilamos
              </h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-700">Datos de registro:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Nombre y apellidos</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Información de la empresa (opcional)</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-700">Datos de uso:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Información sobre cómo usas nuestra plataforma</li>
                  <li>Datos de navegación y preferencias</li>
                  <li>Dirección IP y datos del dispositivo</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. Cómo Usamos tus Datos
              </h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Proporcionar y mantener nuestro servicio</li>
                <li>Comunicarnos contigo sobre actualizaciones y soporte</li>
                <li>Mejorar la funcionalidad de la plataforma</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Tus Derechos
              </h2>
              <p className="text-gray-600 mb-3">
                Bajo el RGPD, tienes derecho a:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Acceder a tus datos personales</li>
                <li>Rectificar datos incorrectos</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Limitar el procesamiento de tus datos</li>
                <li>Portabilidad de datos</li>
                <li>Retirar el consentimiento en cualquier momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Contacto
              </h2>
              <p className="text-gray-600">
                Para ejercer tus derechos o consultas sobre esta política, 
                contacta con nosotros en: 
                <a href="mailto:privacy@taskelio.com" className="text-blue-600 hover:underline">
                  privacy@taskelio.com
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
