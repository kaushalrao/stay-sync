import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { collectionGroup, query, getDocs, collection, doc, getDoc, where } from 'firebase/firestore';
import { addDays, format } from 'date-fns';
import { emailService } from '@/app/services/EmailService';
import { Guest, Property } from '@/app/lib/types';

const CRON_SECRET = process.env.CRON_SECRET;

// Helper to get user email from the user document
async function getUserEmail(appId: string, userId: string): Promise<string | undefined> {
    try {
        const userDocRef = doc(db, `artifacts/${appId}/users/${userId}`);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
            return userSnap.data().email;
        }
    } catch (e) {
        console.error(`Failed to fetch user email for ${userId}`, e);
    }
    return undefined;
}

function getPropertyRecipients(property: Property, ownerEmail?: string): string[] {
    const recipients = new Set<string>();
    if (property.hostEmail?.trim()) recipients.add(property.hostEmail.trim());
    if (property.coHostEmail?.trim()) recipients.add(property.coHostEmail.trim());

    if (recipients.size === 0 && ownerEmail) {
        recipients.add(ownerEmail);
    }
    return Array.from(recipients);
}


interface EmailResult {
    guest: string;
    recipient: string;
    status: 'sent' | 'failed';
    property?: string;
    error?: string;
}

export async function GET(req: NextRequest) {
    // 1. Security Check
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tomorrow = addDays(new Date(), 1);
        const dateStr = format(tomorrow, 'yyyy-MM-dd');

        console.log(`Running Email Reminders for Check-in: ${dateStr}`);

        // Iterating properties allows us to resolve the User/Owner for each property
        const propsQuery = query(collectionGroup(db, 'properties'));
        const propsSnap = await getDocs(propsQuery);

        const results: EmailResult[] = [];
        const userEmailCache: Record<string, string> = {};
        const userPropertiesMap: Record<string, { userId: string, appId: string, properties: Property[] }> = {};

        // Group Properties by User
        for (const propDoc of propsSnap.docs) {
            const property = propDoc.data() as Property;
            const pathSegments = propDoc.ref.path.split('/');
            const appId = pathSegments[1];
            const userId = pathSegments[3];

            if (!userPropertiesMap[userId]) {
                userPropertiesMap[userId] = { userId, appId, properties: [] };
            }
            userPropertiesMap[userId].properties.push(property);
        }

        const emailPromises = [];

        for (const userId of Object.keys(userPropertiesMap)) {
            const { appId, properties } = userPropertiesMap[userId];

            // 1. Get Owner/User Email (Fallback)
            let ownerEmail = userEmailCache[userId];
            if (!ownerEmail) {
                ownerEmail = await getUserEmail(appId, userId) || '';
                if (ownerEmail) userEmailCache[userId] = ownerEmail;
            }

            // 2. Query Guests: (A) Checking in Tomorrow, (B) Checking out Today
            try {
                const guestsRef = collection(db, `artifacts/${appId}/users/${userId}/guests`);

                // (A) Check-ins Tomorrow
                const qCheckIn = query(guestsRef, where('checkInDate', '==', dateStr));
                const checkInSnap = await getDocs(qCheckIn);

                // (B) Check-outs Today
                const todayStr = format(new Date(), 'yyyy-MM-dd');
                const qCheckOut = query(guestsRef, where('checkOutDate', '==', todayStr));
                const checkOutSnap = await getDocs(qCheckOut);

                const appUrl = process.env.APP_URL || 'https://staysync.app';

                // Process Check-ins
                emailPromises.push((async () => {
                    for (const doc of checkInSnap.docs) {
                        const guest = doc.data() as Guest;
                        if (guest.status !== 'booked') continue;

                        const property = properties.find(p => p.name === guest.propName);
                        if (!property) continue;

                        const recipients = getPropertyRecipients(property, ownerEmail);
                        const dashboardLink = `${appUrl}/greeter?guestId=${doc.id}`;

                        for (const recipient of recipients) {
                            try {
                                await emailService.sendGuestArrivalNotification(
                                    recipient,
                                    guest.guestName,
                                    property.name,
                                    guest.checkInDate,
                                    guest.checkOutDate,
                                    guest.numberOfGuests,
                                    dashboardLink
                                );
                                results.push({ guest: guest.guestName, recipient, status: 'sent', property: property.name });
                            } catch (err) {
                                console.error(`Check-in Email failed: ${err}`);
                                results.push({ guest: guest.guestName, recipient, status: 'failed', error: String(err) });
                            }
                        }
                    }
                })());

                // Process Check-outs
                emailPromises.push((async () => {
                    for (const doc of checkOutSnap.docs) {
                        const guest = doc.data() as Guest;
                        // Status might be 'active' or even 'upcoming' if not manually moved? 
                        // But strictly checkOutDate == Today implies they are leaving.
                        // We filter out 'cancelled'.
                        if (guest.status === 'cancelled') continue;

                        const property = properties.find(p => p.name === guest.propName);
                        if (!property) continue;

                        const recipients = getPropertyRecipients(property, ownerEmail);
                        const dashboardLink = `${appUrl}/greeter?guestId=${doc.id}`;

                        for (const recipient of recipients) {
                            try {
                                await emailService.sendGuestCheckoutNotification(
                                    recipient,
                                    guest.guestName,
                                    property.name,
                                    guest.checkInDate,
                                    guest.checkOutDate,
                                    guest.totalAmount || 0,
                                    guest.advancePaid || 0,
                                    dashboardLink
                                );
                                results.push({ guest: guest.guestName, recipient, status: 'sent', property: property.name, type: 'checkout' } as any);
                            } catch (err) {
                                console.error(`Checkout Email failed: ${err}`);
                                results.push({ guest: guest.guestName, recipient, status: 'failed', error: String(err) });
                            }
                        }
                    }
                })());

            } catch (err) {
                console.error(`Error processing user ${userId}`, err);
            }
        }

        await Promise.all(emailPromises);

        return NextResponse.json({ success: true, processed: results.length, details: results });

    } catch (error) {
        console.error('Email Reminder Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
