# 🧪 Guía para Probar el Detector de Riesgos de Proyecto

## 📋 Datos Necesarios

Para probar completamente el **Detector de Riesgos de Proyecto**, necesitas crear:

### 1. Cliente
- Ve a **Dashboard → Clientes**
- Crea un nuevo cliente:
  - **Nombre**: "TechCorp Solutions"
  - **Email**: "contacto@techcorp.com"
  - **Empresa**: "TechCorp Solutions"
  - **Teléfono**: "+34 600 123 456"

### 2. Proyecto
- Ve a **Dashboard → Proyectos** 
- Crea un nuevo proyecto:
  - **Nombre**: "Sistema de Gestión Empresarial"
  - **Cliente**: Selecciona "TechCorp Solutions"
  - **Descripción**: "Desarrollo de un sistema completo de gestión empresarial con módulos de CRM, inventario, facturación y reportes"
  - **Fecha inicio**: Hoy
  - **Fecha fin**: En 3 meses
  - **Presupuesto**: €15,000
  - **Estado**: "En progreso"

### 3. Tareas (Opcional pero recomendado)
- Ve a **Dashboard → Tareas**
- Crea algunas tareas para el proyecto:
  - "Análisis de requisitos"
  - "Diseño de base de datos"
  - "Desarrollo del módulo CRM"
  - "Integración de APIs"
  - "Testing y validación"

## 🎯 Probando el Detector de Riesgos

1. Ve a **Dashboard → Automatizaciones IA**
2. Busca "**Detector de Riesgos de Proyecto**"
3. Haz clic en **"Ejecutar"**
4. **Paso 1**: Selecciona el cliente "TechCorp Solutions"
5. **Paso 2**: Selecciona el proyecto "Sistema de Gestión Empresarial"
6. Haz clic en **"Analizar Riesgos"**

## 📊 Resultados Esperados

El sistema analizará automáticamente y mostrará:

- **Puntuación de Riesgo General**: Del 1 al 10
- **Riesgos Identificados**: Por categorías (timeline, budget, scope, technical, client, team, external)
- **Plan de Mitigación**: Estrategias específicas para reducir riesgos
- **Señales de Alerta Temprana**: Indicadores a monitorear

## ✅ Verificación

- Los datos se muestran correctamente (no "NaN%" ni errores)
- La puntuación de riesgo es un número entre 1-10
- Los riesgos están categorizados apropiadamente
- El plan de mitigación es específico y útil

## 🔄 Casos de Prueba Adicionales

Una vez que funcione básicamente:
1. Crea proyectos con diferentes características (presupuestos altos/bajos, plazos cortos/largos)
2. Prueba con proyectos que tienen muchas tareas vs pocos
3. Verifica que la IA adapta sus análisis según el contexto del proyecto

---

**¡Ahora puedes probar el sistema completo con todo su potencial!** 🚀
