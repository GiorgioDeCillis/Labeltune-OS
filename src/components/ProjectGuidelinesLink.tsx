'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { GuidelinesViewer } from '@/components/GuidelinesViewer';
import { InstructionSection } from '@/app/dashboard/projects/new/steps/InstructionsStep';

interface ProjectGuidelinesLinkProps {
    guidelines: InstructionSection[] | string;
    label?: string;
}

export function ProjectGuidelinesLink({ guidelines, label = "View Project Guidelines" }: ProjectGuidelinesLinkProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-primary hover:text-primary/80 text-sm font-bold flex items-center gap-1 transition-colors"
            >
                {label} <ChevronRight className="w-4 h-4" />
            </button>
            <GuidelinesViewer
                guidelines={guidelines}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
