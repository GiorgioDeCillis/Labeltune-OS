'use client';

import React, { useEffect, useState } from 'react';
import { TeamManagementClient } from '@/components/dashboard/TeamManagementClient';
import { getTeamDataForProject } from '../../actions';
import { Loader2 } from 'lucide-react';

interface WorkersStepProps {
    projectId: string | null;
}

export function WorkersStep({ projectId }: WorkersStepProps) {
    const [teamData, setTeamData] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadTeamData() {
            if (!projectId) {
                setIsLoading(false);
                return;
            }
            try {
                const data = await getTeamDataForProject(projectId);
                setTeamData(data);
            } catch (err) {
                console.error('Error fetching team data:', err);
            } finally {
                setIsLoading(false);
            }
        }
        loadTeamData();
    }, [projectId]);

    if (!projectId) {
        return (
            <div className="glass-panel p-8 rounded-2xl text-center space-y-4">
                <h3 className="text-xl font-bold">Draft not saved yet</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Please make sure the project draft is saved before managing team members.
                    The draft is automatically saved as you progress through the wizard.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading eligible workers...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TeamManagementClient
                projectId={projectId}
                initialMembers={teamData || []}
            />
        </div>
    );
}
