'use server';

import { createClient } from '@/utils/supabase/server';

export async function getWorkerStats(userId: string) {
    const supabase = await createClient();

    // Fetch tasks for earnings and stats
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('assigned_to, reviewed_by, annotator_earnings, reviewer_earnings, annotator_time_spent, reviewer_time_spent, created_at, status')
        .or(`assigned_to.eq.${userId},reviewed_by.eq.${userId}`);

    if (tasksError) {
        console.error('Error fetching worker tasks for stats:', tasksError);
        return {
            totalEarnings: 0,
            totalTasks: 0,
            hoursWorked: 0,
            avgRate: 0,
            monthlyEarnings: []
        };
    }

    let totalEarnings = 0;
    let totalTimeSpent = 0; // in seconds
    let totalTasks = 0;

    const monthlyMap: Record<string, { amount: number, projects: Record<string, number> }> = {};

    // Get current date and 6 months ago
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    // Initialize 6 months
    for (let i = 0; i < 6; i++) {
        const d = new Date(sixMonthsAgo);
        d.setMonth(sixMonthsAgo.getMonth() + i);
        const monthKey = d.toLocaleString('en-US', { month: 'short' });
        monthlyMap[monthKey] = { amount: 0, projects: {} };
    }

    (tasks || []).forEach(task => {
        let earned = 0;
        let time = 0;

        // Annotator stats
        const isAnnotator = task.assigned_to === userId;
        const isReviewer = task.reviewed_by === userId;

        if (isAnnotator) {
            earned += (task.annotator_earnings || 0);
            time += (task.annotator_time_spent || 0);

            // Match HistoryClient.tsx logic for "Total Completed"
            if (['submitted', 'completed', 'approved', 'rejected_requeued'].includes(task.status)) {
                totalTasks++;
            }
        }

        // Reviewer stats (if the user reviewed their own task or is multi-role)
        if (isReviewer) {
            earned += (task.reviewer_earnings || 0);
            time += (task.reviewer_time_spent || 0);

            // If they are only the reviewer, we might count it as a task too
            if (!isAnnotator && ['submitted', 'completed', 'approved', 'rejected_requeued'].includes(task.status)) {
                totalTasks++;
            }
        }

        totalEarnings += earned;
        totalTimeSpent += time;

        const taskDate = new Date(task.created_at);
        if (taskDate >= sixMonthsAgo) {
            const monthKey = taskDate.toLocaleString('en-US', { month: 'short' });
            if (monthlyMap[monthKey]) {
                monthlyMap[monthKey].amount += earned;
            }
        }
    });

    const hoursWorked = Math.round((totalTimeSpent / 3600) * 10) / 10;
    const avgRate = hoursWorked > 0 ? totalEarnings / hoursWorked : 0;

    // Convert map to array for chart
    const monthlyEarnings = Object.entries(monthlyMap).map(([m, data]) => ({
        m,
        amount: Math.round(data.amount),
        v: 0 // Will calculate percentage relative to max later in component if needed
    }));

    return {
        totalEarnings: Math.round(totalEarnings),
        totalTasks,
        hoursWorked,
        avgRate,
        monthlyEarnings
    };
}

export async function getPMStats() {
    const supabase = await createClient();

    // Get projects count
    const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

    // Get task counts
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status, created_at');

    if (tasksError) {
        console.error('Error fetching PM tasks for stats:', tasksError);
        return {
            totalProjects: 0,
            activeTasks: 0,
            completionRate: 0,
            teamVelocity: 0
        };
    }

    const activeTasks = (tasks || []).filter(t => ['pending', 'in_progress', 'submitted'].includes(t.status)).length;
    const completedTasks = (tasks || []).filter(t => ['completed', 'approved'].includes(t.status)).length;
    const totalTasks = tasks?.length || 0;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Team Velocity: tasks completed in last 24h
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    const recentTasks = (tasks || []).filter(t =>
        ['completed', 'approved'].includes(t.status) &&
        new Date(t.created_at) >= yesterday
    ).length;

    return {
        totalProjects: totalProjects || 0,
        activeTasks,
        completionRate,
        teamVelocity: recentTasks
    };
}
