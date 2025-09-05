# 🔄 Workflows Automáticos con IA - Clyra

## 🎯 Descripción General

Sistema de workflows automáticos potenciados por OpenAI que replica y mejora las funcionalidades de Bonsai, permitiendo automatizar tareas empresariales con inteligencia artificial contextual.

## ⚡ Nuevas Funcionalidades Implementadas

### 1. 📧 Email Inteligente Automático
- **Función:** `generateSmartEmail()`
- **Triggers soportados:**
  - `contract_signed` - Contrato firmado
  - `payment_received` - Pago recibido
  - `project_completed` - Proyecto completado
  - `meeting_scheduled` - Reunión programada
  - `deadline_approaching` - Fecha límite próxima
  - `invoice_sent` - Factura enviada
  - `client_onboarding` - Bienvenida cliente nuevo

**Ventajas sobre workflows estáticos:**
- ✅ Contenido contextual generado por IA
- ✅ Tono adaptado al tipo de cliente
- ✅ Detalles específicos del proyecto/evento
- ✅ Próximos pasos automáticos

### 2. 📋 Generador de Formularios Dinámicos
- **Función:** `generateDynamicForm()`
- **Propósitos soportados:**
  - `client_intake` - Captación de cliente nuevo
  - `project_brief` - Brief de proyecto
  - `feedback_collection` - Recolección de feedback
  - `change_request` - Solicitud de cambios
  - `meeting_preparation` - Preparación de reunión

**Ventajas sobre formularios estáticos:**
- ✅ Preguntas adaptadas al contexto específico
- ✅ Campos dinámicos según la industria
- ✅ Validaciones inteligentes
- ✅ Tiempo estimado automático

### 3. 🗓️ Programador de Reuniones Inteligente
- **Función:** `scheduleSmartMeeting()`
- **Propósitos soportados:**
  - `project_kickoff` - Inicio de proyecto
  - `client_check_in` - Seguimiento con cliente
  - `project_review` - Revisión de proyecto
  - `problem_solving` - Resolución de problemas
  - `contract_discussion` - Discusión de contrato
  - `feedback_session` - Sesión de feedback

**Ventajas sobre calendarios estáticos:**
- ✅ Agenda personalizada por IA
- ✅ Invitaciones contextuales
- ✅ Preparación automática
- ✅ Objetivos específicos del meeting

### 4. 🔗 Enlace de Calendario Personalizado
- **Función:** `generateCalendarLink()`
- **Tipos de eventos:**
  - `consultation` - Consulta inicial
  - `project_meeting` - Reunión de proyecto
  - `review_session` - Sesión de revisión
  - `discovery_call` - Llamada de descubrimiento
  - `feedback_meeting` - Reunión de feedback

**Ventajas sobre enlaces genéricos:**
- ✅ Configuración inteligente por contexto
- ✅ Descripción personalizada automática
- ✅ Preguntas de preparación específicas
- ✅ Objetivos claros del encuentro

## 🚀 Cómo Usar el Sistema

### 1. Desde la Interfaz Web

1. **Ir a Dashboard de Automatizaciones IA**
2. **Seleccionar workflow automático:**
   - 📧 Email Inteligente Automático
   - 📋 Generador de Formularios Dinámicos
   - 🗓️ Programador de Reuniones Inteligente
   - 🔗 Enlace de Calendario Personalizado

3. **Completar formulario específico:**
   - Seleccionar tipo/propósito
   - Agregar contexto relevante
   - Especificar detalles adicionales

4. **Ejecutar y recibir resultado IA**

### 2. Via API (Para Integración Automática)

```javascript
// Ejemplo: Email automático al firmar contrato
const response = await fetch('/api/ai/automations/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        type: 'smart_email',
        data: {
            trigger: 'contract_signed',
            context: {
                client: { name: 'María González', company: 'TechStart' },
                contract: { value: 8500, project: 'App Móvil' }
            }
        },
        userId: 'user@example.com'
    })
});
```

## 📊 Ejemplos de Resultados IA

### Email Inteligente - Contrato Firmado
```json
{
  "subject": "¡Bienvenida María! Tu proyecto de App Móvil está confirmado",
  "body": "<p>Estimada María,</p><p>¡Excelentes noticias! Hemos recibido tu contrato firmado para el desarrollo de la App Móvil por €8,500...</p>",
  "tone": "professional",
  "next_steps": [
    "Programar reunión de kickoff",
    "Enviar acceso al portal del cliente",
    "Solicitar assets iniciales"
  ],
  "schedule_followup": "2024-09-12"
}
```

### Formulario Dinámico - Brief de Ecommerce
```json
{
  "title": "Brief Detallado - Proyecto Ecommerce",
  "description": "Formulario especializado para proyectos de comercio electrónico",
  "fields": [
    {
      "name": "target_audience",
      "label": "¿Cuál es tu audiencia objetivo principal?",
      "type": "textarea",
      "required": true
    },
    {
      "name": "product_catalog_size",
      "label": "¿Cuántos productos planeas tener inicialmente?",
      "type": "select",
      "options": ["1-50", "51-200", "201-1000", "1000+"]
    }
  ],
  "estimated_time": "8-10 minutos"
}
```

### Reunión Inteligente - Kickoff de Proyecto
```json
{
  "meeting_title": "Kickoff: Desarrollo Dashboard Analytics",
  "duration_minutes": 90,
  "agenda": [
    {
      "item": "Presentación del equipo y roles",
      "duration": 15,
      "objective": "Establecer comunicación efectiva"
    },
    {
      "item": "Revisión detallada de requirements",
      "duration": 30,
      "objective": "Alinear expectativas técnicas"
    }
  ],
  "pre_meeting_tasks": [
    "Revisar documentación técnica",
    "Preparar questions específicas"
  ],
  "invitation_message": "Te invitamos al kickoff oficial del proyecto Dashboard Analytics..."
}
```

## 🔧 Configuración Técnica

### Variables de Entorno Requeridas
```bash
OPENAI_API_KEY=tu_openai_api_key
RESEND_API_KEY=tu_resend_api_key  # Para envío de emails
```

### Dependencias
- ✅ OpenAI GPT-4o-mini (ya configurado)
- ✅ Supabase (base de datos)
- ✅ Next.js 15 (framework)
- ✅ Resend (envío de emails)

## 🧪 Pruebas del Sistema

### Prueba Manual
```bash
# Probar todos los workflows
node test-ai-workflows.js
```

### Ejemplo de Uso Real

1. **Evento:** Cliente firma contrato
2. **Trigger automático:** `contract_signed`
3. **IA genera:** Email de bienvenida personalizado
4. **IA incluye:** Próximos pasos, timeline, contactos
5. **Resultado:** Cliente recibe comunicación profesional inmediata

## 📈 Comparación con Bonsai

| Funcionalidad | Bonsai | Clyra + IA |
|---------------|--------|-------------|
| **Emails automáticos** | Templates estáticos | ✅ Contenido IA contextual |
| **Formularios** | Formularios fijos | ✅ Preguntas adaptativas IA |
| **Reuniones** | Calendarios básicos | ✅ Agendas personalizadas IA |
| **Personalización** | Variables simples | ✅ Contexto completo IA |
| **Inteligencia** | Reglas IF/THEN | ✅ OpenAI GPT-4o-mini |

## 🔄 Workflows de Ejemplo en Acción

### Flujo Completo: Nuevo Cliente
1. **Cliente se registra** → `client_onboarding`
2. **IA genera email de bienvenida** personalizado
3. **IA crea formulario de intake** específico para su industria
4. **IA programa reunión de consulta** con agenda personalizada
5. **IA configura enlace de calendario** para futuras citas

### Flujo Completo: Proyecto Terminado
1. **Proyecto completado** → `project_completed`
2. **IA genera email de entrega** con resumen del proyecto
3. **IA crea formulario de feedback** específico para el tipo de proyecto
4. **IA programa reunión de cierre** con puntos de evaluación
5. **IA genera propuesta de mantenimiento** personalizada

## 🎯 Beneficios Clave

### Para el Negocio
- ⚡ **Automatización inteligente** vs reglas básicas
- 🎯 **Comunicación contextual** vs templates genéricos
- 📈 **Escalabilidad sin pérdida de personalización**
- 💰 **Mejor conversión** por relevancia del contenido

### Para el Cliente
- ✨ **Experiencia personalizada** desde el primer contacto
- 📝 **Formularios relevantes** a su situación específica
- 🗓️ **Reuniones bien estructuradas** con objetivos claros
- 💬 **Comunicaciones profesionales** adaptadas a su contexto

## 🚀 Próximas Mejoras

### v2.0 - Integración Total
- **Triggers automáticos reales** en eventos de Supabase
- **Envío automático de emails** via Resend
- **Integración con Google Calendar** para reuniones
- **Webhooks para sistemas externos**

### v2.1 - IA Avanzada
- **Aprendizaje de patrones** de comunicación exitosos
- **A/B testing automático** de contenido generado
- **Predicción de mejor momento** para envío
- **Análisis de engagement** automático

---

**¡El futuro de la automatización empresarial es inteligente! 🤖✨**
