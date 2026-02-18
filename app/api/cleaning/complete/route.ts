import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { emailService } from '@/app/services/EmailService';
import { Property } from '@/app/lib/types';
import { format } from 'date-fns';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            propertyId,
            staffName,
            remarks,
            totalTasks,
            completedTasks,
            roomSummary,
            userId,
            appId
        } = body;

        if (!propertyId || !userId || !appId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch Property Details
        const propRef = doc(db, `artifacts/${appId}/users/${userId}/properties/${propertyId}`);
        const propSnap = await getDoc(propRef);

        if (!propSnap.exists()) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        const property = propSnap.data() as Property;

        // 2. Resolve Recipients
        const recipients = new Set<string>();
        if (property.hostEmail?.trim()) recipients.add(property.hostEmail.trim());
        if (property.coHostEmail?.trim()) recipients.add(property.coHostEmail.trim());

        // fallback to user email if no host email
        if (recipients.size === 0) {
            const userRef = doc(db, `artifacts/${appId}/users/${userId}`);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && userSnap.data().email) {
                recipients.add(userSnap.data().email);
            }
        }

        if (recipients.size === 0) {
            console.warn(`No recipients found for property ${propertyId}`);
        }

        // 3. Log to cleaning-logs
        const logRef = await addDoc(collection(db, `artifacts/${appId}/users/${userId}/cleaning-logs`), {
            propertyId,
            propertyName: property.name,
            completedAt: Date.now(),
            completedBy: staffName,
            remarks: remarks || '',
            summary: {
                total: totalTasks,
                completed: completedTasks
            },
            roomSummary: roomSummary || {},
            emailRecipients: Array.from(recipients),
            status: 'completed',
            createdAt: serverTimestamp()
        });

        // 4. Send Email if recipients exist
        let emailStatus: 'sent' | 'failed' | 'skipped' = 'skipped';
        let emailError = null;

        if (recipients.size > 0) {
            try {
                const appUrl = process.env.APP_URL || 'https://staysync.app';
                const dashboardLink = `${appUrl}/cleaning-checklist?propId=${propertyId}`;
                const completedAtStr = format(new Date(), 'PPP p'); // e.g., Feb 17th, 2026 at 3:15 PM

                await emailService.sendCleaningCompletionNotification(
                    Array.from(recipients),
                    property.name,
                    propertyId,
                    completedAtStr,
                    staffName,
                    { total: totalTasks, completed: completedTasks },
                    roomSummary || {},
                    remarks || '',
                    dashboardLink
                );
                emailStatus = 'sent';
            } catch (err) {
                console.error('Failed to send cleaning completion email:', err);
                emailStatus = 'failed';
                emailError = String(err);
            }
        }

        // 5. Update log with email status
        // (Optional: updateDoc on logRef if needed, but for now we just return it)

        return NextResponse.json({
            success: true,
            logId: logRef.id,
            emailStatus,
            emailError
        });

    } catch (error) {
        console.error('Cleaning Completion API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
