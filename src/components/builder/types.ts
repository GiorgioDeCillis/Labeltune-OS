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
    | 'Header';

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
    // Configuration
    options?: { label: string; value: string }[]; // For Choices
    labels?: { value: string; background?: string }[]; // For Labels
    granularity?: string; // For Audio/Video (not yet implemented)
    // UI props
    required?: boolean;
    description?: string;
    placeholder?: string;
}

export interface TaskTemplate {
    components: TaskComponent[];
}
