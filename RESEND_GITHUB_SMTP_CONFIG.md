# 🔧 CONFIGURACIÓN SMTP CORRECTA PARA RESEND CON GITHUB

## 📧 CONFIGURACIÓN SMTP PARA RESEND (LOGIN GITHUB):

Cuando usas Resend con login de GitHub, la configuración SMTP es diferente:

### **DATOS SMTP CORRECTOS:**
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: tu_api_key_de_resend
SMTP Pass: tu_api_key_de_resend
Sender Email: noreply@taskelio.app
Sender Name: Taskelio
Enable STARTTLS: ✅ ACTIVADO
```

### **IMPORTANTE:**
- ❌ NO uses "resend" como usuario
- ✅ USA tu API key tanto en "User" como en "Pass"
- ✅ API Key actual: `re_UkgfUy6o_N3xmtw5pRCk3ydKGGdYJWdV7`

## 🛠️ CONFIGURACIÓN EN SUPABASE:

### **Ve a:** https://supabase.com/dashboard/project/joyhaxtpmrmndmifsihn/settings/auth

### **En SMTP Settings configura:**
```
✅ Enable custom SMTP: ACTIVADO

📧 SMTP Host: smtp.resend.com
📧 SMTP Port: 587
📧 SMTP User: re_UkgfUy6o_N3xmtw5pRCk3ydKGGdYJWdV7
📧 SMTP Pass: re_UkgfUy6o_N3xmtw5pRCk3ydKGGdYJWdV7
📧 Sender Email: noreply@taskelio.app
📧 Sender Name: Taskelio
🔐 Enable STARTTLS: ACTIVADO
```

## 🔍 DIFERENCIAS IMPORTANTES:

### **❌ CONFIGURACIÓN INCORRECTA (genérica):**
```
SMTP User: resend
SMTP Pass: [api_key]
```

### **✅ CONFIGURACIÓN CORRECTA (GitHub login):**
```
SMTP User: re_UkgfUy6o_N3xmtw5pRCk3ydKGGdYJWdV7
SMTP Pass: re_UkgfUy6o_N3xmtw5pRCk3ydKGGdYJWdV7
```

## 🧪 DESPUÉS DE CONFIGURAR:

1. **Guarda** la configuración en Supabase
2. **Espera 1-2 minutos** para que se aplique
3. **Prueba** registrando un usuario nuevo
4. **Verifica** que llegue el email de confirmación

## 📋 CHECKLIST FINAL:
- ☐ SMTP Host: smtp.resend.com
- ☐ SMTP Port: 587
- ☐ SMTP User: tu_api_key (no "resend")
- ☐ SMTP Pass: tu_api_key (igual que User)
- ☐ Sender Email: noreply@taskelio.app
- ☐ Sender Name: Taskelio
- ☐ Enable custom SMTP: ACTIVADO
- ☐ Enable email confirmations: ACTIVADO
- ☐ Site URL: http://localhost:3000
- ☐ Redirect URLs configuradas