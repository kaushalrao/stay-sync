import { ITemplateRepository } from './repository.interface';
import { FirebaseTemplateRepository } from './firebase.repository';
import { Template } from '@/app/lib/types';

export class TemplateService {
    private repo: ITemplateRepository;

    constructor(repo: ITemplateRepository = new FirebaseTemplateRepository()) {
        this.repo = repo;
    }

    subscribeToTemplates(userId: string | undefined | null, callback: (templates: Template[]) => void) {
        if (!userId) return () => { };
        return this.repo.subscribeToTemplates(userId, callback);
    }

    async addTemplate(userId: string | undefined | null, template: Omit<Template, 'id'>) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.addTemplate(userId, template);
    }

    async updateTemplate(userId: string | undefined | null, templateId: string, updates: Partial<Template>) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.updateTemplate(userId, templateId, updates);
    }

    async deleteTemplate(userId: string | undefined | null, templateId: string) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.deleteTemplate(userId, templateId);
    }
}

export const templateService = new TemplateService();
