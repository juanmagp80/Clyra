# 🔄 Workflows Automáticos con IA + Detección Automática - Clyra

## 🎯 Descripción General

Sistema de workflows automáticos potenciados por OpenAI que replica y mejora las funcionalidades de Bonsai, con **detección automática de eventos** desde la base de datos para automatizar completamente el flujo de trabajo sin intervención manual.

## ⚡ Funcionalidades Implementadas

### 🔍 **NUEVO: Detector Automático de Eventos**
- **Función:** Escanea automáticamente la base de datos
- **Detecta:** Contratos firmados, pagos recibidos, proyectos completados, nuevos clientes
- **Procesa:** Genera automáticamente emails contextuales para cada evento
- **Período:** Configurable (1 hora a 1 semana)

**✨ Ventaja clave:** **¡No necesitas escribir contextos manualmente!** El sistema obtiene toda la información automáticamente de tu base de datos.

### 1. 📧 Email Inteligente Automático (MEJORADO)
- **Modo Manual:** Introduces contexto manualmente
- **Modo Automático:** Sistema obtiene datos de BD automáticamente
- **Triggers soportados:**
  - `contract_signed` - Contrato firmado (datos automáticos)
  - `payment_received` - Pago recibido (datos automáticos)
  - `project_completed` - Proyecto completado (datos automáticos)
  - `client_onboarding` - Nuevo cliente (datos automáticos)
  - `meeting_scheduled` - Reunión programada
  - `invoice_sent` - Factura enviada (datos automáticos)

### 2-4. Otros Workflows (Ya implementados)
- 📋 Generador de Formularios Dinámicos
- 🗓️ Programador de Reuniones Inteligente  
- 🔗 Enlace de Calendario Personalizado

## 🚀 Cómo Funciona la Detección Automática

### Paso a Paso:

1. **📊 Escaneo de Base de Datos**
   ```javascript
   // El sistema verifica automáticamente:
   - Contratos con status = 'signed' (últimas 24h)
   - Facturas con status = 'paid' (últimas 24h) 
   - Proyectos con status = 'completed' (últimas 24h)
   - Clientes recién creados (últimas 24h)
   ```

2. **🔍 Obtención de Datos Contextuales**
   ```javascript
   // Para cada evento detectado, obtiene:
   {
     client: { name, company, email, phone },
     contract: { value, project, startDate, status },
     project: { name, budget, completedTasks, totalHours },
     payment: { amount, invoiceNumber, date }
   }
   ```

3. **🤖 Generación de Email IA**
   ```javascript
   // OpenAI recibe contexto completo y genera:
   {
     subject: "Email personalizado",
     body: "Contenido contextual específico",
     tone: "professional/friendly",
     next_steps: ["acción1", "acción2"]
   }
   ```

4. **💾 Guardado Automático**
   - Email guardado en `ai_insights`
   - Historial completo disponible
   - Métricas de automatización

## 📊 Ejemplos Reales de Detección Automática

### Contrato Firmado → Email Automático
```javascript
// 🔍 DETECTADO AUTOMÁTICAMENTE:
{
  client: {
    name: "María González",
    company: "TechStart SA", 
    email: "maria@techstart.com"
  },
  contract: {
    value: 8500,
    project: "Desarrollo App Móvil",
    startDate: "2024-09-10"
  }
}

// 📧 EMAIL GENERADO POR IA:
{
  subject: "¡Bienvenida María! Tu proyecto está confirmado - Desarrollo App Móvil",
  body: "Estimada María, ¡Excelentes noticias! Hemos recibido tu contrato firmado...",
  next_steps: [
    "Programar reunión de kickoff para el 12/09",
    "Enviar acceso al portal del cliente", 
    "Solicitar assets iniciales del proyecto"
  ]
}
```

### Pago Recibido → Email Automático
```javascript
// 🔍 DETECTADO AUTOMÁTICAMENTE:
{
  client: { name: "Carlos López", company: "InnovaCorp" },
  payment: { amount: 3500, invoiceNumber: "INV-2024-089" },
  project: { name: "Rediseño Web Corporativo" }
}

// 📧 EMAIL GENERADO POR IA:
{
  subject: "Pago confirmado - €3,500 (INV-2024-089)",
  body: "Estimado Carlos, confirmamos la recepción de tu pago...",
  next_steps: [
    "Continuar con fase 2 del proyecto",
    "Enviar update semanal del progreso"
  ]
}
```

## 🛠️ Uso del Sistema

### 1. Detector Automático (RECOMENDADO)

#### Desde la Interfaz:
1. **Dashboard → Automatizaciones IA**
2. **Seleccionar "🔍 Detector de Eventos Automático"**
3. **Configurar período (1h - 1 semana)**
4. **Ejecutar → IA procesa todo automáticamente**

#### Via API (Para Cron Jobs):
```javascript
// Detección automática completa
const response = await fetch('/api/ai/workflows/auto', {
    method: 'POST',
    body: JSON.stringify({
        autoDetect: true,
        userId: 'user@example.com'
    })
});

// Procesa TODOS los eventos recientes automáticamente
```

### 2. Evento Específico (Manual)
```javascript
// Procesar evento específico conocido
const response = await fetch('/api/ai/workflows/auto', {
    method: 'POST', 
    body: JSON.stringify({
        eventType: 'contract_signed',
        entityId: 'contract_123',
        userId: 'user@example.com'
    })
});
```

### 3. Solo Detección (Sin Procesar)
```javascript
// Solo ver qué eventos hay disponibles
const response = await fetch('/api/ai/workflows/auto?userId=user@example.com&hours=24');
```

## 🔄 Configuración para Automatización Completa

### Opción 1: Cron Job (Recomendado)
```bash
# Ejecutar cada hora
0 * * * * curl -X POST http://tu-app.com/api/ai/workflows/auto \
  -H "Content-Type: application/json" \
  -d '{"autoDetect": true, "userId": "tu@email.com"}'
```

### Opción 2: Webhook en Supabase
```sql
-- Trigger cuando se actualiza un contrato
CREATE OR REPLACE FUNCTION notify_contract_signed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'signed' AND OLD.status != 'signed' THEN
        -- Llamar a tu API automáticamente
        PERFORM net.http_post(
            'https://tu-app.com/api/ai/workflows/auto',
            '{"eventType": "contract_signed", "entityId": "' || NEW.id || '", "userId": "' || NEW.user_email || '"}'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contract_signed_trigger
    AFTER UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION notify_contract_signed();
```

### Opción 3: Integración en Aplicación
```javascript
// Después de firmar contrato en tu app
await signContract(contractId);

// Trigger automático
await fetch('/api/ai/workflows/auto', {
    method: 'POST',
    body: JSON.stringify({
        eventType: 'contract_signed',
        entityId: contractId,
        userId: userEmail
    })
});
```

## 🧪 Pruebas del Sistema

### Prueba Completa Automática
```bash
node test-auto-detector.js
```

### Verificar Eventos Disponibles
```bash
curl "http://localhost:3000/api/ai/workflows/auto?userId=test@example.com&hours=24"
```

### Procesar Todos los Eventos
```bash
curl -X POST http://localhost:3000/api/ai/workflows/auto \
  -H "Content-Type: application/json" \
  -d '{"autoDetect": true, "userId": "test@example.com"}'
```

## 📈 Comparación: Manual vs Automático

| Aspecto | Modo Manual (Antes) | Modo Automático (Ahora) |
|---------|-------------------|------------------------|
| **Datos de entrada** | ✋ Usuario escribe contexto | ✅ BD automática |
| **Detección eventos** | ✋ Usuario selecciona | ✅ Automática 24/7 |
| **Personalización** | 📝 Templates básicos | 🤖 IA contextual real |
| **Escalabilidad** | ⚡ Limitada | 🚀 Infinita |
| **Errores humanos** | ❌ Posibles | ✅ Eliminados |
| **Tiempo setup** | ⏱️ 5-10 min por email | ⚡ 0 segundos |

## 🎯 Casos de Uso Empresariales

### Flujo Completo Automático: Nuevo Proyecto
1. **Cliente firma contrato** 
   → 📧 Email bienvenida + próximos pasos
2. **Primer pago recibido** 
   → 📧 Confirmación + kickoff programado  
3. **Proyecto 50% completado** 
   → 📧 Update de progreso + preview
4. **Proyecto completado** 
   → 📧 Entrega + solicitud feedback
5. **Pago final recibido** 
   → 📧 Agradecimiento + propuesta mantenimiento

### Todo automático, sin intervención manual ✨

## 🔧 Configuración Técnica

### Variables de Entorno
```bash
OPENAI_API_KEY=tu_openai_api_key
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_key
```

### Estructura de Base de Datos Requerida
```sql
-- Tablas que el sistema lee automáticamente:
- contracts (id, user_id, status, amount, title, client_id)
- invoices (id, user_id, status, amount, paid_date, client_id)  
- projects (id, user_id, status, name, budget, client_id)
- clients (id, user_id, name, company, email, created_at)
- calendar_events (id, user_id, title, start_time, client_id)
```

## 🚀 Roadmap v2.0

### Próximas Mejoras
- **🔄 Webhooks bidireccionales** para tiempo real
- **📊 Analytics de automatización** con métricas
- **🤖 Aprendizaje de patrones** de comunicación exitosos
- **📱 Notificaciones push** para eventos críticos
- **🔗 Integración Zapier/Make** para workflows externos

### Integraciones Planificadas
- **📧 Envío automático real** via Resend/SendGrid
- **📅 Programación en Google Calendar** automática
- **💬 Notificaciones Slack/Discord** 
- **📊 Dashboards de automatización** en tiempo real

---

**¡Tu negocio ahora funciona en piloto automático con IA! 🤖✨**

**Sin escribir contextos. Sin configurar reglas. Solo IA que entiende tu negocio.** 🚀
