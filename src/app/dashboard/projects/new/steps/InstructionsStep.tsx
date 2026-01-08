'use client';

import React from 'react';
import { ProjectInstructionsEditor } from '@/components/dashboard/ProjectInstructionsEditor';
import { InstructionSection } from '@/types/manual-types';

interface InstructionsStepProps {
    sections: InstructionSection[];
    onChange: (sections: InstructionSection[]) => void;
}

export function InstructionsStep({ sections, onChange }: InstructionsStepProps) {
    return (
        <ProjectInstructionsEditor
            sections={sections}
            onChange={onChange}
        />
    );
}
