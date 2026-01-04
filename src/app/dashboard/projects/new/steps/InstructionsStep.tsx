'use client';

import React from 'react';
import { ProjectInstructionsEditor, InstructionSection } from '@/components/dashboard/ProjectInstructionsEditor';

export type { InstructionSection };

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
