-- Actualizar categorías específicas para freelancers
-- Este script mejora las categorías para ser más específicas del trabajo freelance

-- Primero, actualizar las tareas existentes con categorías más específicas
UPDATE tasks 
SET category = CASE 
    -- Desarrollo y programación
    WHEN LOWER(title) LIKE '%frontend%' OR LOWER(title) LIKE '%react%' OR LOWER(title) LIKE '%vue%' OR LOWER(title) LIKE '%angular%' THEN 'frontend_development'
    WHEN LOWER(title) LIKE '%backend%' OR LOWER(title) LIKE '%api%' OR LOWER(title) LIKE '%servidor%' OR LOWER(title) LIKE '%database%' THEN 'backend_development'
    WHEN LOWER(title) LIKE '%mobile%' OR LOWER(title) LIKE '%app%' OR LOWER(title) LIKE '%android%' OR LOWER(title) LIKE '%ios%' THEN 'mobile_development'
    WHEN LOWER(title) LIKE '%desarrollo%' OR LOWER(title) LIKE '%programar%' OR LOWER(title) LIKE '%código%' THEN 'web_development'
    
    -- Diseño
    WHEN LOWER(title) LIKE '%ui%' OR LOWER(title) LIKE '%ux%' OR LOWER(title) LIKE '%interfaz%' OR LOWER(title) LIKE '%prototipo%' THEN 'ui_ux_design'
    WHEN LOWER(title) LIKE '%logo%' OR LOWER(title) LIKE '%marca%' OR LOWER(title) LIKE '%branding%' OR LOWER(title) LIKE '%identidad%' THEN 'graphic_design'
    WHEN LOWER(title) LIKE '%diseño%' OR LOWER(title) LIKE '%design%' THEN 'design'
    
    -- Marketing y contenido
    WHEN LOWER(title) LIKE '%seo%' OR LOWER(title) LIKE '%posicionamiento%' OR LOWER(title) LIKE '%google%' THEN 'seo_sem'
    WHEN LOWER(title) LIKE '%social%' OR LOWER(title) LIKE '%facebook%' OR LOWER(title) LIKE '%instagram%' OR LOWER(title) LIKE '%linkedin%' THEN 'social_media'
    WHEN LOWER(title) LIKE '%contenido%' OR LOWER(title) LIKE '%blog%' OR LOWER(title) LIKE '%artículo%' OR LOWER(title) LIKE '%copywriting%' THEN 'content_creation'
    WHEN LOWER(title) LIKE '%marketing%' OR LOWER(title) LIKE '%publicidad%' THEN 'marketing'
    
    -- Consultoría y análisis
    WHEN LOWER(title) LIKE '%consultoría%' OR LOWER(title) LIKE '%asesoría%' OR LOWER(title) LIKE '%estrategia%' THEN 'consulting'
    WHEN LOWER(title) LIKE '%análisis%' OR LOWER(title) LIKE '%investigación%' OR LOWER(title) LIKE '%estudio%' THEN 'research_analysis'
    
    -- Comunicación con clientes
    WHEN LOWER(title) LIKE '%reunión%' OR LOWER(title) LIKE '%meeting%' OR LOWER(title) LIKE '%llamada%' THEN 'client_meetings'
    WHEN LOWER(title) LIKE '%presentación%' OR LOWER(title) LIKE '%propuesta%' OR LOWER(title) LIKE '%pitch%' THEN 'proposals_presentations'
    WHEN LOWER(title) LIKE '%cliente%' OR LOWER(title) LIKE '%comunicación%' THEN 'client_communication'
    
    -- Administración del negocio
    WHEN LOWER(title) LIKE '%factura%' OR LOWER(title) LIKE '%cobro%' OR LOWER(title) LIKE '%pago%' OR LOWER(title) LIKE '%contabilidad%' THEN 'invoicing_payments'
    WHEN LOWER(title) LIKE '%admin%' OR LOWER(title) LIKE '%gestión%' OR LOWER(title) LIKE '%organización%' THEN 'business_admin'
    WHEN LOWER(title) LIKE '%email%' OR LOWER(title) LIKE '%correo%' OR LOWER(title) LIKE '%correspondencia%' THEN 'email_management'
    
    -- Testing y QA
    WHEN LOWER(title) LIKE '%test%' OR LOWER(title) LIKE '%prueba%' OR LOWER(title) LIKE '%qa%' OR LOWER(title) LIKE '%debugging%' THEN 'testing_qa'
    
    -- Formación y aprendizaje
    WHEN LOWER(title) LIKE '%curso%' OR LOWER(title) LIKE '%formación%' OR LOWER(title) LIKE '%aprender%' OR LOWER(title) LIKE '%estudio%' THEN 'learning_training'
    
    ELSE 'general'
END
WHERE category = 'general' OR category IS NULL OR category IN ('development', 'design', 'meetings', 'administration', 'marketing', 'testing');

-- Comentarios sobre las nuevas categorías para freelancers:
-- 'web_development' - Desarrollo web general
-- 'frontend_development' - Desarrollo frontend (React, Vue, Angular)
-- 'backend_development' - Desarrollo backend (APIs, servidores, bases de datos)
-- 'mobile_development' - Desarrollo de aplicaciones móviles
-- 'ui_ux_design' - Diseño de interfaces y experiencia de usuario
-- 'graphic_design' - Diseño gráfico, logos, branding
-- 'design' - Diseño general
-- 'seo_sem' - SEO, SEM, posicionamiento web
-- 'social_media' - Gestión de redes sociales
-- 'content_creation' - Creación de contenido, copywriting
-- 'marketing' - Marketing general
-- 'consulting' - Consultoría y asesoría estratégica
-- 'research_analysis' - Investigación y análisis
-- 'client_meetings' - Reuniones con clientes
-- 'proposals_presentations' - Propuestas y presentaciones
-- 'client_communication' - Comunicación con clientes
-- 'invoicing_payments' - Facturación y gestión de pagos
-- 'business_admin' - Administración del negocio
-- 'email_management' - Gestión de emails
-- 'testing_qa' - Testing y control de calidad
-- 'learning_training' - Formación y aprendizaje
-- 'general' - Tareas generales
