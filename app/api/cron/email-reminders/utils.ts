import { Property } from '@/app/lib/types';

// Extract this helper locally or keep in file if short
export function getPropertyRecipients(property: Property, ownerEmail?: string): string[] {
    const recipients = new Set<string>();
    if (property.hostEmail?.trim()) recipients.add(property.hostEmail.trim());
    if (property.coHostEmail?.trim()) recipients.add(property.coHostEmail.trim());

    if (recipients.size === 0 && ownerEmail) {
        recipients.add(ownerEmail);
    }
    return Array.from(recipients);
}
