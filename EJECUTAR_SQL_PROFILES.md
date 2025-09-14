# 📋 EJECUTAR SQL ADICIONAL EN SUPABASE

## 🎯 OBJETIVO:
Agregar la columna `email_confirmed_at` a la tabla `profiles` para rastrear usuarios confirmados.

## 📝 PASOS:

### **1. Ir a Supabase SQL Editor:**
- URL: https://supabase.com/dashboard/project/joyhaxtpmrmndmifsihn/sql

### **2. Crear nueva consulta:**
- Hacer clic en "New query" o "+"

### **3. Copiar y pegar el SQL:**
Copiar todo el contenido del archivo `update-profiles-email-confirmation.sql` y pegarlo en el editor.

### **4. Ejecutar:**
- Hacer clic en "Run" o Ctrl+Enter
- Verificar que no hay errores

## ✅ RESULTADO ESPERADO:
```
ALTER TABLE
CREATE INDEX
COMMENT
CREATE FUNCTION
CREATE VIEW
COMMENT
```

## 🔍 VERIFICAR:
- Ve a "Table Editor" en Supabase
- Selecciona la tabla `profiles`
- Deberías ver una nueva columna `email_confirmed_at` de tipo `timestamptz`

## 🚀 SIGUIENTE PASO:
Una vez ejecutado el SQL, continuaremos creando la página de confirmación.