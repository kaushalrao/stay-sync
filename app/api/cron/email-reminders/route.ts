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

            // 2. Query Guests checking in tomorrow
            // We use simple query on checkInDate.
            try {
                const q = query(
                    collection(db, `artifacts/${appId}/users/${userId}/guests`),
                    where('checkInDate', '==', dateStr)
                );

                const querySnap = await getDocs(q);

                emailPromises.push((async () => {
                    for (const doc of querySnap.docs) {
                        const guest = doc.data() as Guest;

                        if (guest.status !== 'upcoming') continue;

                        // Find property details
                        const property = properties.find(p => p.name === guest.propName);
                        if (!property) continue;

                        // Determine Recipients
                        // Priority: Host Email, Co-Host Email. 
                        // If NEITHER are set, use Owner Email.
                        const recipients = new Set<string>();

                        if (property.hostEmail?.trim()) recipients.add(property.hostEmail.trim());
                        if (property.coHostEmail?.trim()) recipients.add(property.coHostEmail.trim());

                        // Fallback to owner if no specific emails, or if owner wants copy?
                        // "Add input to collect host..." implies overriding or delegating.
                        // Logic: If list is empty, add owner.
                        if (recipients.size === 0 && ownerEmail) {
                            recipients.add(ownerEmail);
                        }

                        if (recipients.size === 0) {
                            console.log(`No valid email recipients for guest ${guest.guestName} at ${property.name}`);
                            continue;
                        }

                        // Send Emails
                        const dashboardLink = `https://staysync.app/greeter?guestId=${doc.id}`;

                        for (const recipient of Array.from(recipients)) {
                            console.log(`Sending email to ${recipient} for guest ${guest.guestName}`);

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
                                console.error(`Email send failed to ${recipient}`, err);
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
