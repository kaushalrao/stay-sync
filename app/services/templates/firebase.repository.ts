import {
    collection, addDoc, updateDoc, deleteDoc, doc,
    query, onSnapshot, where
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { ITemplateRepository } from './repository.interface';
import { Template } from '@/app/lib/types';
import { getAllowedPropertyIds } from '@/app/store/propertyStore';

export class FirebaseTemplateRepository implements ITemplateRepository {
    private getCollectionRef() {
        return collection(db, `artifacts/${appId}/templates`);
    }

    subscribeToTemplates(callback: (templates: Template[]) => void): () => void {
        const allowedPropIds = getAllowedPropertyIds();
        if (allowedPropIds.length === 0) {
            callback([]);
            return () => { };
        }

        const q = query(
            this.getCollectionRef(),
            where('propertyId', 'in', allowedPropIds.slice(0, 10))
        );
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

    async addTemplate(template: Omit<Template, 'id'>): Promise<string> {
        let targetPropertyId = template.propertyId;
        if (!targetPropertyId) {
            const allowed = getAllowedPropertyIds();
            targetPropertyId = allowed.length > 0 ? allowed[0] : 'unknown';
        }

        const docRef = await addDoc(this.getCollectionRef(), {
            ...template,
            propertyId: targetPropertyId
        });
        return docRef.id;
    }

    async updateTemplate(templateId: string, updates: Partial<Template>): Promise<void> {
        console.log(`[TemplateRepo] Updating template: ${templateId}`);
        const ref = doc(this.getCollectionRef(), templateId);
        await updateDoc(ref, updates);
    }

    async deleteTemplate(templateId: string): Promise<void> {
        console.log(`[TemplateRepo] Deleting template: ${templateId}`);
        const ref = doc(this.getCollectionRef(), templateId);
        await deleteDoc(ref);
    }
}
