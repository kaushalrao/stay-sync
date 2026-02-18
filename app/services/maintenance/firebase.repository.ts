import {
    collection, addDoc, updateDoc, deleteDoc, doc,
    query, onSnapshot
} from 'firebase/firestore';
import { db, appId } from '@lib/firebase';
import { IMaintenanceRepository } from './repository.interface';
import { MaintenanceIssue } from '@/app/lib/types';

export class FirebaseMaintenanceRepository implements IMaintenanceRepository {
    private getCollectionRef(userId: string) {
        return collection(db, `artifacts/${appId}/users/${userId}/maintenance`);
    }

    subscribeToIssues(userId: string, callback: (issues: MaintenanceIssue[]) => void): () => void {
        const q = query(this.getCollectionRef(userId));
        return onSnapshot(q, (snapshot) => {
            const issues = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as MaintenanceIssue[];
            callback(issues);
        });
    }

    async addIssue(userId: string, issue: Omit<MaintenanceIssue, 'id' | 'createdAt' | 'status'>): Promise<string> {
        const docRef = await addDoc(this.getCollectionRef(userId), {
            ...issue,
            status: 'pending',
            createdAt: Date.now()
        });
        return docRef.id;
    }

    async updateIssueStatus(userId: string, issueId: string, status: 'pending' | 'in-progress' | 'fixed'): Promise<void> {
        const ref = doc(db, `artifacts/${appId}/users/${userId}/maintenance/${issueId}`);
        await updateDoc(ref, { status });
    }

    async deleteIssue(userId: string, issueId: string): Promise<void> {
        const ref = doc(db, `artifacts/${appId}/users/${userId}/maintenance/${issueId}`);
        await deleteDoc(ref);
    }
}
