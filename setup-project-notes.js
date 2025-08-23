const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (necesitas ajustar estas URLs según tu configuración)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERROR: Missing Supabase environment variables');
    console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createProjectNotesTable() {
    console.log('🔧 Creating project_notes table...');
    
    try {
        // SQL para crear la tabla project_notes
        const createTableSQL = `
            -- Crear tabla project_notes para notas de proyectos
            CREATE TABLE IF NOT EXISTS project_notes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Índices para mejorar rendimiento
            CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
            CREATE INDEX IF NOT EXISTS idx_project_notes_created_at ON project_notes(created_at);
        `;

        // Ejecutar la creación de la tabla
        const { data, error } = await supabase.rpc('exec_sql', { 
            sql: createTableSQL 
        });

        if (error) {
            console.error('❌ Error creating table:', error);
            console.log('📝 Note: This error might occur if the exec_sql function is not available.');
            console.log('🔧 Please run the SQL manually in your Supabase dashboard:');
            console.log('\n' + createTableSQL + '\n');
            return false;
        }

        console.log('✅ Table project_notes created successfully!');
        return true;

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('📝 Please run the following SQL manually in your Supabase dashboard:');
        console.log(`
-- Crear tabla project_notes para notas de proyectos
CREATE TABLE IF NOT EXISTS project_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_created_at ON project_notes(created_at);

-- RLS (Row Level Security) para project_notes
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver/editar notas de sus propios proyectos
CREATE POLICY project_notes_policy ON project_notes
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );
        `);
        return false;
    }
}

// Verificar si la tabla existe
async function checkTableExists() {
    try {
        console.log('🔍 Checking if project_notes table exists...');
        
        const { data, error } = await supabase
            .from('project_notes')
            .select('id')
            .limit(1);

        if (error && error.code === 'PGRST116') {
            console.log('📋 Table project_notes does not exist');
            return false;
        } else if (error) {
            console.error('❌ Error checking table:', error);
            return false;
        } else {
            console.log('✅ Table project_notes already exists');
            return true;
        }
    } catch (error) {
        console.error('❌ Error checking table:', error);
        return false;
    }
}

async function main() {
    console.log('🚀 Project Notes Table Setup\n');
    
    const tableExists = await checkTableExists();
    
    if (!tableExists) {
        await createProjectNotesTable();
    }
    
    console.log('\n✨ Setup complete!');
}

main().catch(console.error);
