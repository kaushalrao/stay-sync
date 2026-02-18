import {
    collection, addDoc, updateDoc, deleteDoc, doc,
    query, onSnapshot
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { ITemplateRepository } from './repository.interface';
import { Template } from '@/app/lib/types';

export class FirebaseTemplateRepository implements ITemplateRepository {
    private getCollectionRef(userId: string) {
        return collection(db, `artifacts/${appId}/users/${userId}/templates`);
    }

    subscribeToTemplates(userId: string, callback: (templates: Template[]) => void): () => void {
        const q = query(this.getCollectionRef(userId));
        return onSnapshot(q, (snapshot) => {
            const templates = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Template[];
            // Sort by order if available
            templates.sort((a, b) => (a.order || 0) - (b.order || 0));
            callback(templates);
        });
    }

    async addTemplate(userId: string, template: Omit<Template, 'id'>): Promise<string> {
        const docRef = await addDoc(this.getCollectionRef(userId), template);
        return docRef.id;
    }

    async updateTemplate(userId: string, templateId: string, updates: Partial<Template>): Promise<void> {
        console.log(`[TemplateRepo] Updating template: ${templateId}`);
        const ref = doc(this.getCollectionRef(userId), templateId);
        await updateDoc(ref, updates);
    }

    async deleteTemplate(userId: string, templateId: string): Promise<void> {
        console.log(`[TemplateRepo] Deleting template: ${templateId}`);
        const ref = doc(this.getCollectionRef(userId), templateId);
        await deleteDoc(ref);
    }
}
