export type TaskComponentType =
    // Objects (Data to be labeled)
    | 'Image'
    | 'Text'
    | 'Audio'
    | 'HyperText'
    // Controls (How to label)
    | 'Choices'
    | 'TextArea'
    | 'Rating'
    | 'Number'
    | 'Labels'
    | 'RectangleLabels'
    | 'PolygonLabels'
    // Layout
    | 'View'
    | 'Header'
    // Advanced
    | 'Video'
    | 'TimeSeries'
    | 'PDF'
    | 'MultiMessage'
    // Advanced Pogo Workflow Types
    | 'InstructionBlock'
    | 'RubricTable'
    | 'SideBySide'
    | 'RubricScorer'
    | 'Ranking'
    | 'Feedback'
    | 'RequirementPanel'
    | 'AudioRecorder';

export interface TaskComponent {
    id: string;
    type: TaskComponentType;
    // Common props
    name: string;
    title?: string; // For Header or UI display
    // Links
    toName?: string[]; // Which component this controls (e.g. Labels -> Image)
    // Data binding
    value?: string; // e.g. "$image" for Objects
    // Content
    text?: string; // For Text/Header
    content?: string; // For InstructionBlock
    // Configuration
    options?: { label: string; value: string; hint?: string }[]; // For Choices
    labels?: { value: string; background?: string }[]; // For Labels
    granularity?: string; // For Audio/Video (not yet implemented)
    // UI props
    required?: boolean;
    description?: string;
    placeholder?: string;
    // Layout
    children?: TaskComponent[]; // For SideBySide or View
    // Complex Configs
    rubricCriteria?: {
        id: string;
        title: string;
        points?: number;
        category?: string;
        description?: string;
    }[]; // For RubricScorer
}

export interface TaskTemplate {
    components: TaskComponent[];
}
