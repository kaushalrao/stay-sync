import { ITemplateRepository } from './repository.interface';
import { FirebaseTemplateRepository } from './firebase.repository';
import { Template } from '@/app/lib/types';
import { calculateNights, formatDate, formatCurrency, processTemplate } from '@/app/lib/utils';

export class TemplateService {
    private repo: ITemplateRepository;

    constructor(repo: ITemplateRepository = new FirebaseTemplateRepository()) {
        this.repo = repo;
    }

    subscribeToTemplates(userId: string | undefined | null, callback: (templates: Template[]) => void) {
        if (!userId) return () => { };
        return this.repo.subscribeToTemplates(userId, callback);
    }

    async addTemplate(userId: string | undefined | null, template: Omit<Template, 'id'>) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.addTemplate(userId, template);
    }

    async updateTemplate(userId: string | undefined | null, templateId: string, updates: Partial<Template>) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.updateTemplate(userId, templateId, updates);
    }

    async deleteTemplate(userId: string | undefined | null, templateId: string) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.deleteTemplate(userId, templateId);
    }

    generateMessage(templateContent: string, property: any, guestDetails: any): string {
        const nights = calculateNights(guestDetails.checkInDate, guestDetails.checkOutDate);
        const totalBaseCost = property.basePrice * nights;
        const extraGuestsCount = Math.max(0, guestDetails.numberOfGuests - property.baseGuests);
        const totalExtraCost = property.extraGuestPrice * extraGuestsCount * nights;

        const subTotal = totalBaseCost + totalExtraCost;
        const discount = guestDetails.discount || 0;
        const totalAmount = Math.max(0, subTotal - discount);

        const balanceDue = Math.max(0, totalAmount - guestDetails.advancePaid);

        const data: Record<string, string | number> = {
            guestName: guestDetails.guestName.trim() || 'Guest',
            propertyName: property.name,
            hostName: property.hostName,
            coHostName: property.coHostName,
            contactPrimary: property.contactPrimary,
            contactSecondary: property.contactSecondary,
            wifiName: property.wifiName,
            wifiPass: property.wifiPass,
            checkInTime: property.checkInTime,
            checkOutTime: property.checkOutTime,
            locationLink: property.locationLink,
            propertyLink: property.propertyLink || '',
            checkInDate: formatDate(guestDetails.checkInDate),
            checkOutDate: formatDate(guestDetails.checkOutDate),
            nights: nights,
            numberOfGuests: guestDetails.numberOfGuests,
            totalAmount: formatCurrency(totalAmount),
            advancePaid: formatCurrency(guestDetails.advancePaid),
            balanceDue: formatCurrency(balanceDue),
            basePrice: formatCurrency(property.basePrice),
            extraGuestPrice: formatCurrency(property.extraGuestPrice),
            baseGuests: property.baseGuests,
        };
        return processTemplate(templateContent, data);
    }
}

export const templateService = new TemplateService();
