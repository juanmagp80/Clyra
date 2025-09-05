# 🎛️ Panel de Control: Detector Automático de Eventos

## 🚀 **Cómo activar y usar el detector desde la interfaz:**

### 📱 **Pasos para usar en tu aplicación:**

1. **Ir a Dashboard** → **Automatizaciones IA**
2. **Buscar**: "🔍 Detector de Eventos Automático"
3. **Clic en "Ejecutar"**
4. **Configurar período**: 1 hora, 6 horas, 24 horas, 1 semana
5. **Activar**: El sistema detecta y procesa automáticamente

## 🎯 **Qué hace exactamente cada evento:**

### 📋 **Contrato Firmado** 
**Acción:** Genera email de bienvenida personalizado
```
📧 Email generado:
Asunto: "¡Bienvenida María! Tu proyecto está confirmado - Desarrollo App Móvil"
Contenido: 
- Confirmación del contrato firmado
- Detalles del proyecto (€5,000, 3 meses)
- Próximos pasos del proceso
- Datos de contacto del equipo
- Timeline del proyecto
- Link al portal del cliente
```
**Guardado en:** `ai_insights` como email automático

---

### 💰 **Pago Recibido**
**Acción:** Genera email de confirmación de pago
```
📧 Email generado:
Asunto: "Pago confirmado - €2,500 (Factura TEST-628)"
Contenido:
- Confirmación del pago recibido
- Detalles de la factura
- Próxima fase del proyecto
- Agradecimiento personalizado
- Siguientes hitos del proyecto
```
**Guardado en:** `ai_insights` como confirmación automática

---

### 🎉 **Proyecto Completado**
**Acción:** Genera email de entrega y cierre
```
📧 Email generado:
Asunto: "¡Tu proyecto Web Corporativa ha sido completado!"
Contenido:
- Resumen del trabajo realizado
- Links a entregables finales
- Solicitud de feedback/testimonial
- Propuesta de mantenimiento
- Invitación a futuros proyectos
- Instrucciones de uso
```
**Guardado en:** `ai_insights` como cierre de proyecto

---

### 👤 **Cliente Nuevo Registrado**
**Acción:** Genera email de onboarding
```
📧 Email generado:
Asunto: "Bienvenido Carlos, empezamos juntos este viaje"
Contenido:
- Bienvenida personalizada
- Proceso de trabajo explicado
- Próximos pasos del onboarding
- Link al portal del cliente
- Contactos del equipo
- Expectativas y timeline
```
**Guardado en:** `ai_insights` como onboarding automático

## 🔄 **Proceso completo del detector:**

### **Paso 1: Detección** 🔍
```
Sistema escanea base de datos → Busca cambios recientes → Identifica eventos
```

### **Paso 2: Obtención de Datos** 📊
```
Para cada evento → Obtiene datos del cliente → Obtiene datos del proyecto → Contextualiza
```

### **Paso 3: Generación IA** 🤖
```
OpenAI recibe contexto completo → Genera email personalizado → Adapta tono y contenido
```

### **Paso 4: Guardado** 💾
```
Email guardado en ai_insights → Disponible en historial → Métricas actualizadas
```

## ⚡ **Activación automática 24/7:**

### **Opción 1: Cron Job** (Recomendado)
```bash
# Ejecutar cada hora
0 * * * * curl -X POST http://tu-app.com/api/ai/workflows/auto \
  -H "Content-Type: application/json" \
  -d '{"autoDetect": true, "userId": "TU_USER_ID"}'
```

### **Opción 2: Webhook en Supabase**
```sql
-- Trigger automático cuando cambia status de contrato
CREATE TRIGGER contract_signed_trigger
    AFTER UPDATE ON contracts
    FOR EACH ROW
    WHEN (NEW.status = 'signed' AND OLD.status != 'signed')
    EXECUTE FUNCTION notify_webhook('contract_signed');
```

### **Opción 3: Integración en tu App**
```javascript
// Después de cualquier acción importante
await updateContract(contractId, { status: 'signed' });

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

## 📊 **Panel de métricas del detector:**

### **Métricas que puedes ver:**
- ✅ **Eventos detectados** en período seleccionado
- ✅ **Emails generados** automáticamente
- ✅ **Tasa de éxito** de procesamiento
- ✅ **Tiempo de respuesta** promedio
- ✅ **Tipos de eventos** más frecuentes
- ✅ **Historial completo** en `ai_insights`

## 🎯 **Beneficios inmediatos:**

### **Para ti:**
- ⚡ **0 segundos** configurando emails manualmente
- 🤖 **IA contextual** que entiende tu negocio
- 🔄 **Automatización 24/7** sin supervisión
- 📈 **Escalabilidad infinita** para cualquier volumen

### **Para tus clientes:**
- ✨ **Comunicación inmediata** al firmar contratos
- 📧 **Emails personalizados** con su información específica
- 🎯 **Información relevante** según el estado del proyecto
- 💬 **Tono profesional** adaptado a cada situación

---

## 🧪 **Cómo probar que funciona AHORA:**

### **Método 1: Script de prueba**
```bash
cd /home/juan/Documentos/clyra
node test-auto-detector.js
```

### **Método 2: API directa**
```bash
curl "http://localhost:3000/api/ai/workflows/auto?userId=2478a228-7db8-48e2-b58d-66368b15cf01&hours=24"
```

### **Método 3: Procesamiento completo**
```bash
curl -X POST http://localhost:3000/api/ai/workflows/auto \
  -H "Content-Type: application/json" \
  -d '{"autoDetect": true, "userId": "2478a228-7db8-48e2-b58d-66368b15cf01"}'
```

### **Método 4: Interfaz web**
1. Ve a Dashboard → Automatizaciones IA
2. Busca "🔍 Detector de Eventos Automático" 
3. Clic en "Ejecutar"
4. Configura período: 24 horas
5. ¡Ver la magia en acción!

---

**¡Tu negocio ahora funciona en piloto automático con IA!** 🚀✨

**Cada evento importante genera automáticamente el email perfecto para ese momento específico.**
