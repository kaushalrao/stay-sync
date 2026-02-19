import { useState, useCallback } from 'react';
import { useApp } from '@components/providers/AppProvider';
import { useMaintenanceStore, useUIStore } from '@store/index';
import { MaintenanceIssue } from '@lib/types';
import { maintenanceService } from '@services/maintenance/maintenance.service';

export function useMaintenance(propertyId: string = 'all') {
    const { user } = useApp();
    const showToast = useUIStore(state => state.showToast);
    const allIssues = useMaintenanceStore(state => state.issues);
    const isLoading = useMaintenanceStore(state => state.isIssuesLoading);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const issues = propertyId === 'all'
        ? allIssues
        : allIssues.filter(i => i.propertyId === propertyId);

    const addIssue = useCallback(async (title: string, priority: 'low' | 'medium' | 'high', propId: string) => {
        try {
            await maintenanceService.addIssue(user?.uid, {
                title,
                priority,
                propertyId: propId
            });
            showToast('Issue reported', 'success');
            return true;
        } catch (error) {
            console.error(error);
            showToast('Failed to report issue', 'error');
            return false;
        }
    }, [user, showToast]);

    const toggleStatus = useCallback(async (issue: MaintenanceIssue) => {
        setProcessingId(issue.id);
        const newStatus = issue.status === 'fixed' ? 'pending' : 'fixed';

        try {
            await maintenanceService.updateIssueStatus(user?.uid, issue.id, newStatus);
            showToast(`Marked as ${newStatus}`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to update status', 'error');
        } finally {
            setProcessingId(null);
        }
    }, [user, showToast]);

    const deleteIssue = useCallback(async (issueId: string) => {
        try {
            await maintenanceService.deleteIssue(user?.uid, issueId);
            showToast('Issue deleted', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to delete issue', 'error');
        }
    }, [user, showToast]);

    return {
        issues,
        isLoading,
        processingId,
        addIssue,
        toggleStatus,
        deleteIssue
    };
}
