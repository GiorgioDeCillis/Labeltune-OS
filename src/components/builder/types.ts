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
    | 'AudioRecorder'
    | 'Checklist'
    | 'AccordionChoices'
    | 'AIResponseGenerator'
    | 'BrushLabels'
    | 'KeypointLabels'
    | 'EllipseLabels'
    | 'RelationLabels'
    | 'VideoTimeline'
    | 'AudioSpectrogram'
    | 'Lidar'
    | 'Mesh'
    | 'ThreeDBoxLabels'
    | 'Map'
    | 'GeoJSONLabels'
    | 'DICOM'
    | 'SignalPlotter'
    | 'SideBySideRanking'
    | 'HallucinationHighlighter'
    | 'OCRFormExtractor'
    | 'RedactionLabeler'
    | 'LegalRedlineViewer'
    | 'ClauseLinker'
    | 'WSIViewer'
    | 'MolecularViewer'
    | 'SatelliteCompare'
    | 'ChatEditor'
    | 'GenomeSequence';

export interface AIGeneratorConfig {
    id: string;
    name: string;
    provider: 'platform' | 'openai' | 'anthropic';
    model?: string;
    apiKey?: string;
    systemPrompt?: string;
}

export interface TaskComponent {
    id: string;
    type: TaskComponentType;
    // Common props
    name: string;
    title?: string; // For Header or UI display
    // Links
    toName?: string[]; // Which component this controls (e.g. Labels -> Image)
    // Data binding
    value?: string | any; // e.g. "$image" for Objects or complex initial state
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
    multiple?: boolean;
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
    // AI Config
    aiConfig?: {
        referenceTextLimit?: number;
        generators?: AIGeneratorConfig[];
    };
    // Vision Config
    imageConfig?: {
        canZoom?: boolean;
        canBrightnessContrast?: boolean;
        canRotate?: boolean;
        labels?: { value: string; background?: string; hotkey?: string }[];
    };
    // Genomics & API Config
    genomicsConfig?: {
        endpoint?: string;
        apiKey?: string;
        modelType?: 'alphagenome-1.0' | 'custom';
        useLiveInference?: boolean;
    };
}

export interface Region {
    id: string;
    label: string;
    type: 'box' | 'polygon' | 'brush' | 'keypoint' | 'ellipse' | 'relation';
    points: number[]; // [x, y, w, h] for box, [x1, y1, x2, y2...] for poly, [x, y] for keypoint
    color: string;
    mask?: string; // Base64 or URL for brush mask
    fromId?: string; // For relation
    toId?: string; // For relation
}

export interface TaskTemplate {
    components: TaskComponent[];
}
