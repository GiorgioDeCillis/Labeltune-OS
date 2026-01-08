const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function main() {
    // Manual .env parser
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            env[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
        }
    });

    const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const projectId = process.argv[2];

    if (!projectId) {
        console.log('No projectId provided. Listing all projects:');
        const { data: projects } = await supabase.from('projects').select('id, name, status');
        console.table(projects);
        return;
    }

    console.log('--- DEBUGGING PROJECT ---', projectId);

    const { data: project, error: pError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (pError) {
        console.error('Project Error:', pError);
        // Try searching by name if ID fails
        const { data: search } = await supabase.from('projects').select('*').ilike('name', `%${projectId}%`);
        console.log('Search by name results:', search?.map(p => ({ id: p.id, name: p.name })));
        return;
    }

    console.log('Project Found:', project.name);
    console.log('Settings:', {
        max_task_time: project.max_task_time,
        extra_time_after_max: project.extra_time_after_max,
        absolute_expiration_duration: project.absolute_expiration_duration
    });

    const { data: tasks, error: tError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', project.id)
        .eq('status', 'in_progress');

    if (tError) {
        console.error('Tasks Error:', tError);
        return;
    }

    console.log('In Progress Tasks:', tasks.length);
    tasks.forEach(t => {
        console.log(`Task ID: ${t.id}`);
        console.log(`- Started At: ${t.annotator_started_at}`);
        console.log(`- Updated At: ${t.updated_at}`);
        console.log(`- Assigned To: ${t.assigned_to}`);

        // Manual cleanup simulation
        const now = new Date();
        const startedAt = new Date(t.annotator_started_at);
        const wallClockDiffSec = (now.getTime() - startedAt.getTime()) / 1000;
        console.log(`- Wall Clock Diff: ${wallClockDiffSec}s`);
    });
}

main();
