
import {
    Database,
    MessageSquare,
    Cloud,
    Code,
    FileText,
    ShoppingCart,
    BarChart3,
    Lock,
    Image,
    Server,
    Briefcase,
    Brain,
    Zap,
    Globe,
    Headphones,
    Smartphone,
    Mail,
    HardDrive
} from 'lucide-react';

export interface Category {
    id: string;
    label: string;
    icon?: any;
    subcategories: { id: string; label: string }[];
}

export const CATEGORIES: Category[] = [
    {
        id: 'ai-ml',
        label: 'AI & Machine Learning',
        icon: Brain,
        subcategories: [
            { id: 'llm', label: 'Large Language Models' },
            { id: 'embeddings', label: 'Embeddings & Vector' },
            { id: 'image-gen', label: 'Image Generation' },
            { id: 'audio', label: 'Speech & Audio' },
            { id: 'vision', label: 'Computer Vision' },
            { id: 'nlp', label: 'NLP & Text' },
        ],
    },
    {
        id: 'databases',
        label: 'Databases',
        icon: Database,
        subcategories: [
            { id: 'sql', label: 'SQL Databases' },
            { id: 'nosql', label: 'NoSQL' },
            { id: 'vector-db', label: 'Vector Databases' },
            { id: 'graph', label: 'Graph Databases' },
            { id: 'timeseries', label: 'Time Series' },
            { id: 'cache', label: 'Caching' },
        ],
    },
    {
        id: 'messaging',
        label: 'Messaging & Communication',
        icon: MessageSquare,
        subcategories: [
            { id: 'chat', label: 'Chat Platforms' },
            { id: 'email', label: 'Email Services' },
            { id: 'sms', label: 'SMS & Phone' },
            { id: 'push', label: 'Push Notifications' },
            { id: 'video-call', label: 'Video Conferencing' },
            { id: 'social', label: 'Social Media' },
        ],
    },
    {
        id: 'storage',
        label: 'Cloud Storage',
        icon: Cloud,
        subcategories: [
            { id: 'object', label: 'Object Storage' },
            { id: 'file-sync', label: 'File Sync' },
            { id: 'cdn', label: 'CDN' },
            { id: 'backup', label: 'Backup & Archive' },
        ],
    },
    {
        id: 'developer',
        label: 'Developer Tools',
        icon: Code,
        subcategories: [
            { id: 'vcs', label: 'Version Control' },
            { id: 'cicd', label: 'CI/CD' },
            { id: 'monitoring', label: 'Monitoring & Logging' },
            { id: 'testing', label: 'Testing' },
            { id: 'docs', label: 'Documentation' },
            { id: 'ide', label: 'IDE & Editors' },
            { id: 'api-tools', label: 'API Tools' },
        ],
    },
    {
        id: 'productivity',
        label: 'Productivity',
        icon: FileText,
        subcategories: [
            { id: 'project-mgmt', label: 'Project Management' },
            { id: 'docs-collab', label: 'Docs & Collaboration' },
            { id: 'calendar', label: 'Calendar & Scheduling' },
            { id: 'notes', label: 'Notes & Knowledge' },
            { id: 'automation', label: 'Automation' },
        ],
    },
    {
        id: 'commerce',
        label: 'Commerce & Payments',
        icon: ShoppingCart,
        subcategories: [
            { id: 'payments', label: 'Payment Processing' },
            { id: 'ecommerce', label: 'E-commerce Platforms' },
            { id: 'invoicing', label: 'Invoicing & Billing' },
            { id: 'accounting', label: 'Accounting' },
        ],
    },
    {
        id: 'data',
        label: 'Data & Analytics',
        icon: BarChart3,
        subcategories: [
            { id: 'analytics', label: 'Analytics Platforms' },
            { id: 'bi', label: 'Business Intelligence' },
            { id: 'etl', label: 'ETL & Pipelines' },
            { id: 'visualization', label: 'Data Visualization' },
            { id: 'scraping', label: 'Web Scraping' },
        ],
    },
    {
        id: 'security',
        label: 'Security & Identity',
        icon: Lock,
        subcategories: [
            { id: 'auth', label: 'Authentication' },
            { id: 'secrets', label: 'Secrets Management' },
            { id: 'compliance', label: 'Compliance' },
            { id: 'scanning', label: 'Security Scanning' },
        ],
    },
    {
        id: 'media',
        label: 'Media & Content',
        icon: Image,
        subcategories: [
            { id: 'image-proc', label: 'Image Processing' },
            { id: 'video-proc', label: 'Video Processing' },
            { id: 'audio-proc', label: 'Audio Processing' },
            { id: 'cms', label: 'CMS & Headless' },
        ],
    },
    {
        id: 'infrastructure',
        label: 'Infrastructure',
        icon: Server,
        subcategories: [
            { id: 'serverless', label: 'Serverless' },
            { id: 'containers', label: 'Containers & K8s' },
            { id: 'dns', label: 'DNS & Domains' },
            { id: 'networking', label: 'Networking' },
        ],
    },
    {
        id: 'crm',
        label: 'CRM & Sales',
        icon: Briefcase,
        subcategories: [
            { id: 'crm-platforms', label: 'CRM Platforms' },
            { id: 'sales-tools', label: 'Sales Tools' },
            { id: 'marketing', label: 'Marketing Automation' },
        ],
    },
];
