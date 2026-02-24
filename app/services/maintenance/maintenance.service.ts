import { IMaintenanceRepository } from './repository.interface';
import { FirebaseMaintenanceRepository } from './firebase.repository';
import { MaintenanceIssue } from '@/app/lib/types';

export class MaintenanceService {
    private repo: IMaintenanceRepository;

    constructor(repo: IMaintenanceRepository = new FirebaseMaintenanceRepository()) {
        this.repo = repo;
    }

    subscribeToIssues(callback: (issues: MaintenanceIssue[]) => void) {
        return this.repo.subscribeToIssues(callback);
    }

    async addIssue(issue: Omit<MaintenanceIssue, 'id' | 'createdAt' | 'status'>) {
        return this.repo.addIssue(issue);
    }

    async updateIssueStatus(issueId: string, status: 'pending' | 'in-progress' | 'fixed') {
        return this.repo.updateIssueStatus(issueId, status);
    }

    async deleteIssue(issueId: string) {
        return this.repo.deleteIssue(issueId);
    }
}

export const maintenanceService = new MaintenanceService();
