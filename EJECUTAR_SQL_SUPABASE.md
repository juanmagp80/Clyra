# 📋 EJECUTAR SQL EN SUPABASE

## 🎯 OBJETIVO:
Crear la tabla `email_confirmations` para almacenar tokens de confirmación de email.

## 📝 PASOS:

### **1. Ir a Supabase SQL Editor:**
- URL: https://supabase.com/dashboard/project/joyhaxtpmrmndmifsihn/sql

### **2. Crear nueva consulta:**
- Hacer clic en "New query" o "+"

### **3. Copiar y pegar el SQL:**
Copiar todo el contenido del archivo `create-email-confirmations-table.sql` y pegarlo en el editor.

### **4. Ejecutar:**
- Hacer clic en "Run" o Ctrl+Enter
- Verificar que no hay errores

## ✅ RESULTADO ESPERADO:
```
Tabla email_confirmations verificada/creada correctamente
```

## 🔍 VERIFICAR:
- Ve a "Table Editor" en Supabase
- Deberías ver la nueva tabla `email_confirmations`
- Con columnas: id, user_id, token, email, expires_at, confirmed_at, created_at, updated_at

## 🚀 SIGUIENTE PASO:
Una vez creada la tabla, continuaremos con la API de verificación de confirmación.