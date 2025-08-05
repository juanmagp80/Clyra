# 🔑 CONFIGURACIÓN DE OAUTH EN SUPABASE

## � **¿Qué es necesario?**

**SÍ, Supabase soporta completamente OAuth con GitHub y Google**. Solo necesitas:

1. **Tu proyecto Supabase** (✅ ya lo tienes)
2. **Configurar los providers OAuth** en 2 lugares:
   - En GitHub/Google (crear aplicación OAuth)
   - En Supabase (activar y configurar)

**¡Es GRATIS y funciona perfectamente!**

---

## 📋 **PASO A PASO - CONFIGURACIÓN COMPLETA:**

### **PASO 1: Configurar GitHub OAuth** 🐙

#### **1.1 Crear OAuth App en GitHub:**
1. Ve a: https://github.com/settings/applications/new
2. Llena el formulario:
   ```
   Application name: Taskelia App
   Homepage URL: http://localhost:3000
   Authorization callback URL: https://joyhaxtpmrmndmifsihn.supabase.co/auth/v1/callback
   ```
3. Haz clic en **"Register application"**
4. **Copia el Client ID y Client Secret** (los necesitarás en el paso 1.2)

#### **1.2 Configurar GitHub en Supabase:**
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: `joyhaxtpmrmndmifsihn`
3. Ve a: **Authentication** > **Providers**
4. Busca **GitHub** y haz clic en el toggle para activarlo
5. Pega:
   - **Client ID** (del paso 1.1)
   - **Client Secret** (del paso 1.1)
6. Haz clic en **"Save"**

### **PASO 2: Configurar Google OAuth** 🔍

#### **2.1 Crear OAuth App en Google:**
1. Ve a: https://console.cloud.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a: **APIs & Services** > **Credentials**
4. Haz clic en **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
5. Si es tu primera vez, configura la "OAuth consent screen":
   - **User Type**: External
   - **App name**: Taskelia
   - **User support email**: tu email
   - **Developer contact**: tu email
6. Vuelve a **Credentials** y crea el OAuth 2.0 Client ID:
   ```
   Application type: Web application
   Name: Taskelia App
   Authorized redirect URIs: https://joyhaxtpmrmndmifsihn.supabase.co/auth/v1/callback
   ```
7. **Copia el Client ID y Client Secret**

#### **2.2 Configurar Google en Supabase:**
1. En tu proyecto Supabase: **Authentication** > **Providers**
2. Busca **Google** y actívalo
3. Pega:
   - **Client ID** (del paso 2.1)
   - **Client Secret** (del paso 2.1)
4. Haz clic en **"Save"**

### **PASO 3: Configurar URLs en Supabase** 🔗
4. Guarda los cambios

### **3. Configurar Google OAuth:**

#### **3.1 En Google Cloud Console:**
1. Ve a: https://console.cloud.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth 2.0 Client IDs**
5. Configura:
   - **Application type**: Web application
   - **Name**: `Taskelia App`
   - **Authorized redirect URIs**: `https://joyhaxtpmrmndmifsihn.supabase.co/auth/v1/callback`
6. Copia el **Client ID** y **Client Secret**

#### **3.2 En Supabase:**
1. Ve a: **Authentication** > **Providers**
2. Habilita **Google**
3. Pega el **Client ID** y **Client Secret** de Google
4. Guarda los cambios

### **4. URLs de Callback importantes:**

**Para desarrollo:**
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

**Para producción (cuando deploys):**
- Site URL: `https://tudominio.com`
- Redirect URLs: `https://tudominio.com/auth/callback`

### **5. Configurar Site URL en Supabase:**
1. Ve a: **Authentication** > **URL Configuration**
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs**: `http://localhost:3000/auth/callback`

---

## ✅ **Una vez configurado, todos los botones funcionarán:**
- ✅ **GitHub**: Redirección a GitHub OAuth
- ✅ **Google**: Redirección a Google OAuth  
- ✅ **Iniciar Sesión**: Login con email/contraseña
- ✅ **Crear Cuenta**: Registro con email/contraseña
- ✅ **Reenviar confirmación**: Reenvío de email

## 🧪 **Probar la configuración:**
1. Configura los providers OAuth siguiendo los pasos de arriba
2. Ve a: http://localhost:3000/login
3. Haz clic en cualquier botón para probar
