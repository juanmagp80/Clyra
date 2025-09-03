# Sistema de Contratos - Guía de Instalación

## 📋 **Sistema Completo de Contratos Profesionales**

Este sistema proporciona una solución completa para la gestión de contratos freelance con templates oficiales y profesionales.

## 🚀 **Instalación**

### 1. **Ejecutar la Migración de Base de Datos**

```sql
-- Ejecutar en Supabase SQL Editor
-- El archivo está en: /database/contracts_migration.sql
```

Esto creará:
- Tabla `contract_templates` con 5 templates profesionales
- Tabla `contracts` para contratos generados
- Políticas RLS (Row Level Security)
- Triggers para `updated_at`

### 2. **Templates Incluidos**

El sistema incluye 5 templates profesionales:

#### 📍 **1. Contrato de Desarrollo Web**
- Ideal para proyectos de desarrollo web y aplicaciones
- Incluye tecnologías, funcionalidades, entregables
- Variables para proyectos técnicos

#### 🎨 **2. Contrato de Diseño Gráfico**
- Perfecto para servicios de diseño y branding
- Incluye revisiones, formatos de archivo, derechos de uso
- Variables específicas para proyectos creativos

#### 📢 **3. Contrato de Marketing Digital**
- Para servicios de marketing y redes sociales
- Incluye KPIs, objetivos, presupuestos publicitarios
- Variables para estrategias de marketing

#### 💼 **4. Contrato de Consultoría**
- Template general para servicios de consultoría
- Modalidades de trabajo, honorarios por hora
- Variables para diferentes especializaciones

#### ✍️ **5. Contrato de Redacción de Contenidos**
- Para servicios de copywriting y creación de contenidos
- Incluye SEO, palabras clave, originalidad
- Variables específicas para contenido

## 🔧 **Características del Sistema**

### **Templates Dinámicos**
- Variables intercambiables `{{variable_name}}`
- Contenido legal profesional
- Adaptables a diferentes industrias

### **Gestión Completa**
- Creación paso a paso (Template → Cliente → Detalles)
- Estados: borrador, enviado, firmado, activo, completado, terminado
- Integración con sistema de clientes existente

### **Funcionalidades Avanzadas**
- Vista previa de contratos
- Descarga en PDF (impresión)
- Seguimiento de estados
- Estadísticas y métricas

## 📊 **Estados de Contratos**

- **Draft**: Borrador en preparación
- **Sent**: Enviado al cliente
- **Signed**: Firmado por ambas partes
- **Active**: Contrato en ejecución
- **Completed**: Proyecto completado
- **Terminated**: Contrato terminado anticipadamente

## 🎯 **Variables de Templates**

### **Variables Comunes**
```
{{freelancer_name}} - Nombre del freelancer
{{freelancer_dni}} - DNI del freelancer
{{freelancer_address}} - Dirección del freelancer
{{client_name}} - Nombre del cliente
{{client_document}} - Documento del cliente
{{client_address}} - Dirección del cliente
{{project_name}} - Nombre del proyecto
{{project_description}} - Descripción del proyecto
{{contract_value}} - Valor del contrato
{{currency}} - Moneda
{{start_date}} - Fecha de inicio
{{end_date}} - Fecha de finalización
{{payment_terms}} - Términos de pago
{{contract_date}} - Fecha del contrato
{{city}} - Ciudad
{{jurisdiction}} - Jurisdicción legal
```

### **Variables Específicas por Template**

#### **Desarrollo Web**
```
{{technologies}} - Tecnologías a utilizar
{{main_features}} - Funcionalidades principales
{{project_duration}} - Duración del proyecto
{{additional_deliverables}} - Entregables adicionales
```

#### **Diseño Gráfico**
```
{{design_type}} - Tipo de diseño
{{initial_proposals}} - Número de propuestas iniciales
{{revisions_included}} - Revisiones incluidas
{{file_formats}} - Formatos de archivo
{{revision_cost}} - Costo de revisiones adicionales
```

#### **Marketing Digital**
```
{{social_networks}} - Redes sociales a gestionar
{{content_strategy}} - Estrategia de contenido
{{advertising_campaigns}} - Campañas publicitarias
{{kpis}} - KPIs a medir
{{reach_goal}} - Meta de alcance
{{engagement_goal}} - Meta de engagement
```

## 🔐 **Seguridad**

- **RLS habilitado**: Solo usuarios autenticados ven sus contratos
- **Templates públicos**: Accesibles para todos los usuarios autenticados
- **Políticas granulares**: CRUD completo para propietarios

## 🎨 **Interfaz de Usuario**

### **Dashboard de Contratos**
- Vista de lista con filtros y búsqueda
- Estadísticas en tiempo real
- Estados visuales con badges de color

### **Creación de Contratos**
- Wizard de 3 pasos
- Selección visual de templates
- Formulario intuitivo para detalles

### **Vista de Contrato**
- Preview completo del documento
- Panel lateral con información del cliente
- Acciones rápidas (descargar, enviar, editar)

## 📈 **Beneficios para Freelancers**

✅ **Profesionalización**: Contratos legalmente sólidos y profesionales
✅ **Ahorro de tiempo**: Templates pre-configurados
✅ **Organización**: Gestión centralizada de todos los contratos
✅ **Seguimiento**: Estados y métricas en tiempo real
✅ **Personalización**: Variables adaptables a cada proyecto
✅ **Protección legal**: Clausulas estándar de la industria

## 🚀 **Próximas Mejoras**

- [ ] Firma digital integrada
- [ ] Envío automático por email
- [ ] Templates personalizables por usuario
- [ ] Integración con facturación
- [ ] Recordatorios automáticos
- [ ] Plantillas multi-idioma

## 💡 **Uso Recomendado**

1. **Configurar perfil**: Completa tu información personal para auto-reemplazar variables
2. **Revisar templates**: Adapta el contenido según tu país/jurisdicción
3. **Crear clientes**: Asegúrate de tener clientes registrados antes de crear contratos
4. **Seguimiento**: Actualiza estados conforme avance el proyecto

---

**¡Tu sistema de contratos profesional está listo! 🎉**
