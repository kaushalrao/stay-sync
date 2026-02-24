import { MaintenanceIssue } from '@/app/lib/types';

export interface IMaintenanceRepository {
    subscribeToIssues(callback: (issues: MaintenanceIssue[]) => void): () => void;
    addIssue(issue: Omit<MaintenanceIssue, 'id' | 'createdAt' | 'status'>): Promise<string>;
    updateIssueStatus(issueId: string, status: 'pending' | 'in-progress' | 'fixed'): Promise<void>;
    deleteIssue(issueId: string): Promise<void>;
}
