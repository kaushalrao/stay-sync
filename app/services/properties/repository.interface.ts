import { Property } from '@/app/lib/types';

export interface IPropertyRepository {
    subscribeToProperties(userId: string, callback: (properties: Property[]) => void): () => void;
    addProperty(userId: string, property: Omit<Property, 'id'>): Promise<string>;
    updateProperty(userId: string, propertyId: string, updates: Partial<Property>): Promise<void>;
    deleteProperty(userId: string, propertyId: string): Promise<void>;
}
