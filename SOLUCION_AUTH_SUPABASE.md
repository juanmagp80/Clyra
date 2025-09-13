# 🔧 GUÍA DE SOLUCIÓN - PROBLEMAS DE AUTENTICACIÓN SUPABASE

## PROBLEMA IDENTIFICADO ✅
- **Emails duplicados:** Supabase está permitiendo registros con emails ya existentes
- **Emails de confirmación:** Pueden no estar llegando

## PASOS PARA SOLUCIONAR:

### 1. CONFIGURACIÓN EN SUPABASE DASHBOARD
1. Ve a: https://app.supabase.com/project/joyhaxtpmrmndmifsihn
2. Haz login con tu cuenta

### 2. VERIFICAR CONFIGURACIÓN DE AUTENTICACIÓN
1. Ve a **Authentication > Settings**
2. **General tab:**
   - ✅ Verifica que "Enable email confirmations" esté **HABILITADO**
   - ✅ Verifica que "Disable new user signups" esté **DESHABILITADO**
   - ✅ Site URL debe ser: `http://localhost:3000` (desarrollo) o tu dominio (producción)
   - ✅ Redirect URLs debe incluir: `http://localhost:3000/auth/callback`

### 3. CONFIGURACIÓN DE EMAIL
1. Ve a **Authentication > Templates**
2. Verifica que tengas configurados los templates de:
   - **Confirm signup**
   - **Reset password**
   - **Magic link**

### 4. LIMPIAR USUARIOS DUPLICADOS
1. Ve a **Authentication > Users**
2. **ELIMINA MANUALMENTE** el usuario duplicado:
   - Usuario creado hoy: `377726a4-4cd3-4794-a045-707715662d9c`
   - Email: `refugestion@gmail.com`
   - Creado: 13/9/2025, 17:24:22

### 5. VERIFICAR TABLA AUTH.USERS
1. Ve a **SQL Editor**
2. Ejecuta esta consulta para verificar constraint UNIQUE:
```sql
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'users' 
AND table_schema = 'auth';
```

### 6. SI NO HAY CONSTRAINT UNIQUE, CREARLO:
```sql
-- SOLO si no existe constraint UNIQUE en email
ALTER TABLE auth.users 
ADD CONSTRAINT unique_email 
UNIQUE (email);
```

### 7. CONFIGURACIÓN SMTP (SI NO LLEGAN EMAILS)
1. Ve a **Authentication > Settings > SMTP Settings**
2. Opciones:
   - **Usar SMTP de Supabase** (por defecto, limitado pero funcional)
   - **Configurar SMTP personalizado** (Gmail, SendGrid, etc.)

### 8. PROBAR DESPUÉS DE LOS CAMBIOS
1. Intenta registrar un nuevo usuario con email único
2. Verifica que llegue el email de confirmación
3. Intenta registrar con email existente (debe fallar)

## COMANDOS ÚTILES:

### Ver usuarios actuales:
```bash
node debug-auth-issue.js
```

### Verificar que los cambios funcionan:
1. Registra usuario nuevo desde la web
2. Verifica que NO permita email duplicado
3. Verifica que llegue email de confirmación

## NOTAS IMPORTANTES:
- Los emails pueden tardar hasta 5 minutos en llegar
- Revisa carpeta de SPAM
- El SMTP gratuito de Supabase tiene límites diarios
- Para producción, usa un SMTP dedicado (SendGrid, Mailgun, etc.)