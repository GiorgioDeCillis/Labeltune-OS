import { TaskComponent, TaskTemplate } from '@/components/builder/types';
import { nanoid } from 'nanoid';

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    type: string;
    icon: string;
    schema: TaskComponent[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
    {
        id: 'sentiment-analysis',
        name: 'Sentiment Analysis',
        description: 'Classify the sentiment of a given text.',
        type: 'sentiment_analysis',
        icon: 'MessageSquare',
        schema: [
            {
                id: nanoid(),
                type: 'Header',
                name: 'header_1',
                text: 'Text to Analyze',
                title: 'Header'
            },
            {
                id: nanoid(),
                type: 'Text',
                name: 'text_1',
                value: '$text',
                title: 'Text Content'
            },
            {
                id: nanoid(),
                type: 'Choices',
                name: 'sentiment',
                title: 'What is the sentiment?',
                required: true,
                options: [
                    { label: 'Positive', value: 'positive' },
                    { label: 'Neutral', value: 'neutral' },
                    { label: 'Negative', value: 'negative' }
                ]
            }
        ]
    },
    {
        id: 'image-classification',
        name: 'Image Classification',
        description: 'Assign a category to an image.',
        type: 'image_classification',
        icon: 'Image',
        schema: [
            {
                id: nanoid(),
                type: 'Image',
                name: 'image_1',
                value: '$image',
                title: 'Image'
            },
            {
                id: nanoid(),
                type: 'Choices',
                name: 'category',
                title: 'Select category',
                required: true,
                options: [
                    { label: 'Category A', value: 'a' },
                    { label: 'Category B', value: 'b' }
                ]
            }
        ]
    },
    {
        id: 'object-detection',
        name: 'Object Detection',
        description: 'Draw boxes around objects in images.',
        type: 'image_bounding_box',
        icon: 'Box',
        schema: [
            {
                id: nanoid(),
                type: 'Image',
                name: 'image_1',
                value: '$image',
                title: 'Image'
            },
            {
                id: nanoid(),
                type: 'RectangleLabels',
                name: 'objects',
                title: 'Draw boxes',
                toName: ['image_1'],
                labels: [
                    { value: 'Person', background: '#FF5733' },
                    { value: 'Car', background: '#33FF57' },
                    { value: 'Building', background: '#3357FF' }
                ]
            }
        ]
    },
    {
        id: 'audio-transcription',
        name: 'Audio Transcription',
        description: 'Transcribe audio recordings into text.',
        type: 'audio_transcription',
        icon: 'Mic',
        schema: [
            {
                id: nanoid(),
                type: 'Audio',
                name: 'audio_1',
                value: '$audio',
                title: 'Audio clip'
            },
            {
                id: nanoid(),
                type: 'TextArea',
                name: 'transcription',
                title: 'Transcription',
                placeholder: 'Type what you hear...',
                required: true
            }
        ]
    },
    {
        id: 'chatbot-evaluation',
        name: 'Chatbot Evaluation',
        description: 'Evaluate the quality of chatbot responses (RLHF).',
        type: 'generation',
        icon: 'Bot',
        schema: [
            {
                id: nanoid(),
                type: 'Header',
                name: 'header_1',
                text: 'User Prompt',
                title: 'Header'
            },
            {
                id: nanoid(),
                type: 'Text',
                name: 'prompt',
                value: '$prompt',
                title: 'Prompt'
            },
            {
                id: nanoid(),
                type: 'Header',
                name: 'header_2',
                text: 'Response',
                title: 'Header'
            },
            {
                id: nanoid(),
                type: 'Text',
                name: 'response',
                value: '$response',
                title: 'Response'
            },
            {
                id: nanoid(),
                type: 'Rating',
                name: 'quality',
                title: 'Rate response quality',
                required: true
            },
            {
                id: nanoid(),
                type: 'TextArea',
                name: 'feedback',
                title: 'Feedback (Optional)',
                placeholder: 'Any further comments?'
            }
        ]
    },
    {
        id: 'video-object-tracking',
        name: 'Video Object Tracking',
        description: 'Track and label objects across video frames.',
        type: 'video_tracking',
        icon: 'Video',
        schema: [
            {
                id: nanoid(),
                type: 'Video',
                name: 'video_1',
                value: '$video',
                title: 'Video source'
            },
            {
                id: nanoid(),
                type: 'Labels',
                name: 'objects',
                title: 'Tracked Objects',
                toName: ['video_1'],
                labels: [
                    { value: 'Car', background: '#33FF57' },
                    { value: 'Pedestrian', background: '#FF5733' },
                    { value: 'Cyclist', background: '#3357FF' }
                ]
            }
        ]
    },
    {
        id: 'time-series-anomaly',
        name: 'Time Series Anomaly',
        description: 'Identify and label anomalies in sensor data.',
        type: 'time_series',
        icon: 'Mic',
        schema: [
            {
                id: nanoid(),
                type: 'TimeSeries',
                name: 'sensor_data',
                value: '$data',
                title: 'Sensor Data Stream'
            },
            {
                id: nanoid(),
                type: 'Choices',
                name: 'anomaly_type',
                title: 'Anomaly Type',
                required: true,
                options: [
                    { label: 'Spike', value: 'spike' },
                    { label: 'Drop', value: 'drop' },
                    { label: 'Noise', value: 'noise' },
                    { label: 'Pattern Change', value: 'pattern' }
                ]
            }
        ]
    },
    {
        id: 'pdf-data-extraction',
        name: 'PDF Data Extraction',
        description: 'Extract structured information from PDF documents.',
        type: 'pdf_extraction',
        icon: 'Box',
        schema: [
            {
                id: nanoid(),
                type: 'PDF',
                name: 'document',
                value: '$pdf_url',
                title: 'Financial Report'
            },
            {
                id: nanoid(),
                type: 'TextArea',
                name: 'summary',
                title: 'Executive Summary',
                placeholder: 'Summarize the key findings...',
                required: true
            },
            {
                id: nanoid(),
                type: 'Choices',
                name: 'document_type',
                title: 'Form Type',
                options: [
                    { label: 'Invoice', value: 'invoice' },
                    { label: 'Receipt', value: 'receipt' },
                    { label: 'Contract', value: 'contract' }
                ]
            }
        ]
    },
    {
        id: 'pogo-rubrics-rlhf',
        name: 'Safe & Helpful RLHF',
        description: 'Advanced RLHF workflow with dynamic rubrics and response ranking.',
        type: 'rlhf_pogo',
        icon: 'Bot',
        schema: [
            {
                id: nanoid(),
                type: 'InstructionBlock',
                name: 'welcome_instructions',
                title: 'Welcome to Pogo Rubrics!',
                content: 'We are training the next generation of LLMs!\nYou will be creating rubrics for this locale: it_CH\n\nThe task will work like this:\n1. Write a prompt that you would use in everyday life.\n2. Review 3 responses and confirm failing issues.\n3. See the auto-generated rubric.\n4. Rate each response on the criteria.\n5. Confirm the auto-ranking.',
                children: [
                    { id: nanoid(), type: 'View', name: 'n1', text: 'Follow the task category and use indicated, and attach reference text.' },
                    { id: nanoid(), type: 'View', name: 'n2', text: 'You will see a major critical errors table embedded at that step.' }
                ]
            },
            {
                id: nanoid(),
                type: 'RequirementPanel',
                name: 'task_requirements',
                title: 'Task Requirements',
                content: '<b>Language:</b> it_CH\n<b>Category:</b> Summarization\n<b>Use Case:</b> Generic User Journey'
            },
            {
                id: nanoid(),
                type: 'Header',
                name: 'prompt_header',
                text: 'Step 1: Write a Prompt',
                title: 'Header'
            },
            {
                id: nanoid(),
                type: 'TextArea',
                name: 'user_prompt',
                title: 'User Prompt',
                placeholder: 'Fai un riassunto in punti elenco del testo...',
                required: true
            },
            {
                id: nanoid(),
                type: 'Header',
                name: 'comparison_header',
                text: 'Step 2: Compare Responses',
                title: 'Header'
            },
            {
                id: nanoid(),
                type: 'SideBySide',
                name: 'responses_comparison',
                children: [
                    { id: nanoid(), type: 'View', name: 'ra', title: 'Response A', content: 'Il Trenino Rosso del Bernina collega Tirano a St. Moritz...' },
                    { id: nanoid(), type: 'View', name: 'rb', title: 'Response B', content: 'Ecco un riassunto del testo fornito: Il Trenino Rosso...' },
                    { id: nanoid(), type: 'View', name: 'rc', title: 'Response C', content: 'Trenino del Bernina: Collega Tirano in Lombardia...' }
                ]
            },
            {
                id: nanoid(),
                type: 'Choices',
                name: 'critical_failures',
                title: 'Does at least one of these responses have a critical failure?',
                options: [
                    { label: 'Language Fluency', value: 'lang' },
                    { label: 'Truthfulness', value: 'truth' },
                    { label: 'Instruction Following', value: 'instr' },
                    { label: 'No Critical Failure', value: 'none' }
                ]
            },
            {
                id: nanoid(),
                type: 'RubricScorer',
                name: 'rubric_scoring',
                title: 'Step 3: Rate Responses based on Rubric',
                rubricCriteria: [
                    { id: 'c1', title: 'Response must be shorter than provided text', points: 5, category: 'Instruction Following' },
                    { id: 'c2', title: 'Response must use clear formatting', points: 5, category: 'Instruction Following' },
                    { id: 'c3', title: 'Response must use third person singular', points: 5, category: 'Instruction Following' },
                    { id: 'c4', title: 'Response must mention Bernina route details', points: 5, category: 'Truthfulness' }
                ]
            },
            {
                id: nanoid(),
                type: 'Ranking',
                name: 'final_ranking',
                title: 'Step 4: Rank the model responses',
                options: [
                    { label: 'Response A', value: 'a' },
                    { label: 'Response B', value: 'b' },
                    { label: 'Response C', value: 'c' }
                ]
            },
            {
                id: nanoid(),
                type: 'Feedback',
                name: 'justification',
                title: 'Step 5: Write a Justification',
                description: 'Write a 50+ word justification that explains your model ranking.',
                required: true,
                placeholder: 'Response A was top choice because...'
            }
        ]
    }
];
