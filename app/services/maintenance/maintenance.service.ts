import { IMaintenanceRepository } from './repository.interface';
import { FirebaseMaintenanceRepository } from './firebase.repository';
import { MaintenanceIssue } from '@/app/lib/types';

export class MaintenanceService {
    private repo: IMaintenanceRepository;

    constructor(repo: IMaintenanceRepository = new FirebaseMaintenanceRepository()) {
        this.repo = repo;
    }

    subscribeToIssues(userId: string | undefined | null, callback: (issues: MaintenanceIssue[]) => void) {
        if (!userId) return () => { };
        return this.repo.subscribeToIssues(userId, callback);
    }

    async addIssue(userId: string | undefined | null, issue: Omit<MaintenanceIssue, 'id' | 'createdAt' | 'status'>) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.addIssue(userId, issue);
    }

    async updateIssueStatus(userId: string | undefined | null, issueId: string, status: 'pending' | 'in-progress' | 'fixed') {
        if (!userId) throw new Error("User ID is required");
        return this.repo.updateIssueStatus(userId, issueId, status);
    }

    async deleteIssue(userId: string | undefined | null, issueId: string) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.deleteIssue(userId, issueId);
    }
}

export const maintenanceService = new MaintenanceService();
