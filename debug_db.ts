import { createClient } from './src/utils/supabase/server';

async function main() {
    const supabase = await createClient();
    const projectId = process.argv[2];

    if (!projectId) {
        console.error('Please provide a projectId');
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
        .eq('project_id', projectId)
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
    });
}

main();
