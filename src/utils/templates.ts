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
    }
];
