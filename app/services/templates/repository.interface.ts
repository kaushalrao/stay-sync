import { Template } from '@/app/lib/types';

export interface ITemplateRepository {
    subscribeToTemplates(callback: (templates: Template[]) => void): () => void;
    addTemplate(template: Omit<Template, 'id'>): Promise<string>;
    updateTemplate(templateId: string, updates: Partial<Template>): Promise<void>;
    deleteTemplate(templateId: string): Promise<void>;
}
