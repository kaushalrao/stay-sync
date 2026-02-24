import {
    collection, addDoc, updateDoc, deleteDoc, doc,
    query, onSnapshot, where
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { IMaintenanceRepository } from './repository.interface';
import { MaintenanceIssue } from '@/app/lib/types';
import { getAllowedPropertyIds } from '@/app/store/propertyStore';

export class FirebaseMaintenanceRepository implements IMaintenanceRepository {
    private getCollectionRef() {
        return collection(db, `artifacts/${appId}/maintenance-issues`);
    }

    subscribeToIssues(callback: (issues: MaintenanceIssue[]) => void): () => void {
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
            const issues = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as MaintenanceIssue[];
            callback(issues);
        });
    }

    async addIssue(issue: Omit<MaintenanceIssue, 'id' | 'createdAt' | 'status'>): Promise<string> {
        let targetPropertyId = issue.propertyId;
        if (!targetPropertyId) {
            const allowed = getAllowedPropertyIds();
            targetPropertyId = allowed.length > 0 ? allowed[0] : 'unknown';
        }

        const docRef = await addDoc(this.getCollectionRef(), {
            ...issue,
            propertyId: targetPropertyId,
            status: 'pending',
            createdAt: Date.now()
        });
        return docRef.id;
    }

    async updateIssueStatus(issueId: string, status: 'pending' | 'in-progress' | 'fixed'): Promise<void> {
        const ref = doc(this.getCollectionRef(), issueId);
        await updateDoc(ref, { status });
    }

    async deleteIssue(issueId: string): Promise<void> {
        const ref = doc(this.getCollectionRef(), issueId);
        await deleteDoc(ref);
    }
}
