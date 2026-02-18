import { IPropertyRepository } from './repository.interface';
import { FirebasePropertyRepository } from './firebase.repository';
import { Property } from '@/app/lib/types';

export class PropertyService {
    private repo: IPropertyRepository;

    constructor(repo: IPropertyRepository = new FirebasePropertyRepository()) {
        this.repo = repo;
    }

    subscribeToProperties(userId: string | undefined | null, callback: (properties: Property[]) => void) {
        if (!userId) return () => { };
        return this.repo.subscribeToProperties(userId, callback);
    }

    async addProperty(userId: string | undefined | null, property: Omit<Property, 'id'>) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.addProperty(userId, property);
    }

    async updateProperty(userId: string | undefined | null, propertyId: string, updates: Partial<Property>) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.updateProperty(userId, propertyId, updates);
    }

    async deleteProperty(userId: string | undefined | null, propertyId: string) {
        if (!userId) throw new Error("User ID is required");
        return this.repo.deleteProperty(userId, propertyId);
    }
}

export const propertyService = new PropertyService();
