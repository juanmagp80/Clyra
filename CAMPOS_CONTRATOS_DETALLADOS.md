# 📋 **CAMPOS ESPECÍFICOS POR TIPO DE CONTRATO**

## **🎯 Desarrollo Web (`web_development`)**

### **Campos Obligatorios (*)**
- **Tecnologías a utilizar*** - `technologies`
  - Ejemplo: "React, Node.js, MongoDB, Tailwind CSS"
  - Uso en contrato: `{{technologies}}`

- **Duración estimada (días)*** - `project_duration`
  - Ejemplo: "30"
  - Uso en contrato: `{{project_duration}}`

- **Funcionalidades principales*** - `main_features`
  - Ejemplo: "Sistema de autenticación, panel de administración, carrito de compras"
  - Uso en contrato: `{{main_features}}`

### **Campos Opcionales**
- **Entregables adicionales** - `additional_deliverables`
  - Ejemplo: "Capacitación del equipo, hosting por 1 año"
  - Uso en contrato: `{{additional_deliverables}}`

### **Incluido por defecto**
- Código fuente completo
- Documentación técnica
- Manual de usuario

---

## **🎨 Diseño Gráfico (`design`)**

### **Campos del template actual**
- **Tipo de diseño** - `design_type`
- **Propuestas iniciales** - `initial_proposals`
- **Revisiones incluidas** - `revisions_included`
- **Fecha primera entrega** - `first_delivery_date`
- **Formatos de archivo** - `file_formats`
- **Costo por revisión adicional** - `revision_cost`

---

## **📢 Marketing Digital (`marketing`)**

### **Campos Obligatorios (*)**
- **Redes sociales a gestionar*** - `social_networks`
  - Ejemplo: "Instagram, Facebook, LinkedIn, TikTok"
  - Uso en contrato: `{{social_networks}}`

- **Objetivo principal*** - `main_objective`
  - Ejemplo: "Aumentar ventas en un 25%"
  - Uso en contrato: `{{main_objective}}`

- **KPIs a medir*** - `kpis`
  - Ejemplo: "CTR, conversiones, engagement rate"
  - Uso en contrato: `{{kpis}}`

- **Estrategia de contenido*** - `content_strategy`
  - Ejemplo: "3 posts semanales, stories diarios, reels 2 veces por semana"
  - Uso en contrato: `{{content_strategy}}`

### **Campos de Configuración**
- **Duración inicial (meses)** - `contract_duration`
  - Ejemplo: "3"
  - Uso en contrato: `{{contract_duration}}`

- **Meta de alcance** - `reach_goal`
  - Ejemplo: "10,000 personas/mes"
  - Uso en contrato: `{{reach_goal}}`

- **Meta de engagement** - `engagement_goal`
  - Ejemplo: "5% engagement rate"
  - Uso en contrato: `{{engagement_goal}}`

### **Campos Económicos (con cálculo automático)**
- **Honorarios profesionales (€/mes)** - `professional_fee`
  - Ejemplo: "800"
  - Uso en contrato: `{{professional_fee}}`

- **Presupuesto publicitario (€/mes)** - `ad_budget`
  - Ejemplo: "500"
  - Uso en contrato: `{{ad_budget}}`

- **Total mensual (€)** - `monthly_total` (calculado automáticamente)
  - Se calcula: professional_fee + ad_budget
  - Uso en contrato: `{{monthly_total}}`

### **Campos de Comunicación**
- **Campañas publicitarias** - `advertising_campaigns`
- **Frecuencia de reuniones** - `meeting_frequency`
- **Canal de comunicación** - `communication_channel`

---

## **💼 Consultoría (`consulting`)**

### **Campos Obligatorios (*)**
- **Área de especialización*** - `specialization`
  - Ejemplo: "Transformación digital"
  - Uso en contrato: `{{specialization}}`

- **Modalidad de trabajo*** - `work_modality`
  - Opciones: "Presencial", "Remoto", "Híbrido"
  - Uso en contrato: `{{work_modality}}`

- **Alcance del proyecto*** - `project_scope`
  - Ejemplo: "Análisis de procesos actuales y propuesta de mejoras"
  - Uso en contrato: `{{project_scope}}`

- **Objetivos esperados*** - `expected_outcomes`
  - Ejemplo: "Reducir costos operativos en un 20%"
  - Uso en contrato: `{{expected_outcomes}}`

- **Horas estimadas*** - `estimated_hours`
  - Ejemplo: "40"
  - Uso en contrato: `{{estimated_hours}}`

- **Horas semanales*** - `weekly_hours`
  - Ejemplo: "8"
  - Uso en contrato: `{{weekly_hours}}`

- **Tarifa por hora (€)*** - `hourly_rate`
  - Ejemplo: "75"
  - Uso en contrato: `{{hourly_rate}}`

### **Campos Calculados Automáticamente**
- **Importe total estimado (€)** - `total_estimate`
  - Se calcula: estimated_hours × hourly_rate
  - Uso en contrato: `{{total_estimate}}`

### **Campos de Configuración**
- **Frecuencia de facturación** - `billing_frequency`
  - Opciones: "Semanal", "Quincenal", "Mensual", "Al finalizar", "Por hitos"
  - Uso en contrato: `{{billing_frequency}}`

- **Entregables adicionales** - `additional_deliverables`
  - Ejemplo: "Presentación ejecutiva, manual de procesos"
  - Uso en contrato: `{{additional_deliverables}}`

### **Incluido por defecto**
- Informe inicial de diagnóstico
- Plan de acción detallado
- Implementación de soluciones
- Informe final con recomendaciones

---

## **✍️ Redacción de Contenidos (`content`)**

### **Campos del template actual**
- **Tipo de contenido** - `content_type`
- **Cantidad de contenido** - `content_quantity`
- **Extensión promedio** - `average_length`
- **Tono y estilo** - `tone_style`
- **Máximo de revisiones** - `max_revisions`
- **Frecuencia de entrega** - `delivery_frequency`
- **Plazo para revisiones** - `review_deadline`
- **Precio por palabra** - `price_per_word`
- **Precio por pieza** - `price_per_piece`
- **Optimización SEO** - `seo_optimization`
- **Palabras clave objetivo** - `target_keywords`
- **Densidad de palabra clave** - `keyword_density`

---

## **🔄 Cálculos Automáticos**

### **Consultoría**
```javascript
total_estimate = estimated_hours × hourly_rate
contract_value = total_estimate
```

### **Marketing Digital**
```javascript
monthly_total = professional_fee + ad_budget
contract_value = monthly_total
```

### **Desarrollo Web**
```javascript
// Sin cálculos automáticos
// El valor se introduce manualmente en contract_value
```

---

## **💡 Consejos de Uso**

### **Para Consultoría**
- Sé específico en la especialización
- Define claramente el alcance para evitar scope creep
- Establece objetivos medibles
- Considera la modalidad según las necesidades del cliente

### **Para Marketing Digital**
- Define KPIs específicos y medibles
- Separa honorarios profesionales del presupuesto publicitario
- Establece expectativas realistas de alcance y engagement
- Define claramente la estrategia de contenido

### **Para Desarrollo Web**
- Lista todas las tecnologías principales
- Sé específico en las funcionalidades
- Incluye tiempo para testing y debugging
- Define claramente qué está incluido y qué no

---

## **🚀 Flujo de Trabajo**

1. **Selecciona el template** según el tipo de servicio
2. **Completa los campos obligatorios** marcados con (*)
3. **Los cálculos automáticos** se actualizarán en tiempo real
4. **Revisa en la previsualización** cómo se ven todos los datos
5. **Edita los datos del freelancer** si es necesario
6. **Crea el contrato** cuando todo esté correcto

¡El sistema se encarga automáticamente de reemplazar todas las variables `{{variable}}` en los templates con los datos introducidos!
