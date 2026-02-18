import { MaintenanceIssue } from '@/app/lib/types';

export interface IMaintenanceRepository {
    subscribeToIssues(userId: string, callback: (issues: MaintenanceIssue[]) => void): () => void;
    addIssue(userId: string, issue: Omit<MaintenanceIssue, 'id' | 'createdAt' | 'status'>): Promise<string>;
    updateIssueStatus(userId: string, issueId: string, status: 'pending' | 'in-progress' | 'fixed'): Promise<void>;
    deleteIssue(userId: string, issueId: string): Promise<void>;
}
