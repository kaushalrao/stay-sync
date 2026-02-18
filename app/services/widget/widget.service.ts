import { Guest } from '@/app/lib/types';
import { updateWidgetData } from '@/app/lib/widget';

export class WidgetService {
    async updateWidgetData(guest: Guest | null, property?: any) {
        return updateWidgetData(guest, property);
    }
}

export const widgetService = new WidgetService();
