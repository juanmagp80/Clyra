#!/bin/bash

# Script para aplicar el esquema de Google Calendar a Supabase
echo "🗄️  Aplicando esquema de Google Calendar a Supabase"
echo "================================================="

# Cargar variables de entorno
if [ -f ".env.local" ]; then
    source .env.local
fi

# Verificar que tenemos la URL y la clave de servicio
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL no está configurado"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurado"
    exit 1
fi

echo "📡 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"

# Aplicar esquema usando curl
echo "📤 Ejecutando esquema SQL..."

# Función para ejecutar SQL
execute_sql() {
    local sql_content="$1"
    
    curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/query" \
         -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
         -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
         -H "Content-Type: application/json" \
         -d "{\"query\": \"$sql_content\"}" \
         --silent \
         --fail
}

# Leer y ejecutar el esquema
if [ -f "schema-google-calendar.sql" ]; then
    echo "📋 Aplicando schema-google-calendar.sql..."
    
    # Usar psql si está disponible (método preferido)
    if command -v psql >/dev/null 2>&1; then
        # Extraer componentes de la URL de Supabase
        DB_URL="$NEXT_PUBLIC_SUPABASE_URL"
        DB_HOST=$(echo $DB_URL | sed 's|https://||' | sed 's|\.supabase\.co.*|.supabase.co|')
        PROJECT_REF=$(echo $DB_URL | sed 's|https://||' | sed 's|\.supabase\.co.*||')
        
        echo "🔗 Conectando a Supabase usando psql..."
        echo "   Host: $DB_HOST"
        echo "   Project: $PROJECT_REF"
        
        # Usar la clave de servicio como password
        PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql \
            -h "db.$PROJECT_REF.supabase.co" \
            -p 5432 \
            -d postgres \
            -U postgres \
            -f schema-google-calendar.sql \
            --quiet
        
        if [ $? -eq 0 ]; then
            echo "✅ Esquema aplicado exitosamente usando psql"
        else
            echo "⚠️  Error con psql, intentando método alternativo..."
            echo ""
            echo "📋 INSTRUCCIONES MANUALES:"
            echo "========================="
            echo ""
            echo "1. Abre tu dashboard de Supabase: https://supabase.com/dashboard/projects"
            echo "2. Selecciona tu proyecto"
            echo "3. Ve a SQL Editor"
            echo "4. Crea una nueva consulta"
            echo "5. Copia y pega el contenido de schema-google-calendar.sql"
            echo "6. Ejecuta la consulta"
            echo ""
            echo "El archivo schema-google-calendar.sql está listo en este directorio."
        fi
    else
        echo "⚠️  psql no está disponible"
        echo ""
        echo "📋 INSTRUCCIONES MANUALES:"
        echo "========================="
        echo ""
        echo "1. Abre tu dashboard de Supabase: https://supabase.com/dashboard/projects"
        echo "2. Selecciona tu proyecto"
        echo "3. Ve a SQL Editor"
        echo "4. Crea una nueva consulta"
        echo "5. Copia y pega el contenido de schema-google-calendar.sql"
        echo "6. Ejecuta la consulta"
        echo ""
        echo "El archivo schema-google-calendar.sql está listo en este directorio."
    fi
else
    echo "❌ Error: No se encontró schema-google-calendar.sql"
    exit 1
fi

echo ""
echo "🎉 ¡Configuración de esquema completada!"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "=================="
echo ""
echo "1. Verifica que las tablas se crearon correctamente en Supabase"
echo "2. Inicia el servidor MCP: cd mcp-google-calendar && npm run dev"
echo "3. Accede al dashboard: http://localhost:3001/dashboard/google-calendar"
echo "4. Conecta tu cuenta de Google Calendar"
echo ""
