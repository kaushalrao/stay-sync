import { Template } from '@/app/lib/types';

export interface ITemplateRepository {
    subscribeToTemplates(userId: string, callback: (templates: Template[]) => void): () => void;
    addTemplate(userId: string, template: Omit<Template, 'id'>): Promise<string>;
    updateTemplate(userId: string, templateId: string, updates: Partial<Template>): Promise<void>;
    deleteTemplate(userId: string, templateId: string): Promise<void>;
}
