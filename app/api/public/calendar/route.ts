import { NextRequest, NextResponse } from 'next/server';
import { db, appId } from '../../../lib/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    const propertyId = searchParams.get('propertyId');

    if (!uid || !propertyId) {
        return NextResponse.json({ error: 'User ID and Property ID are required' }, { status: 400 });
    }

    try {
        // 1. Verify Property Ownership/Access via property_users mapping
        // Mapping doc ID is {uid}_{propertyId}
        const mappingRef = doc(db, `artifacts/${appId}/property_users`, `${uid}_${propertyId}`);
        const mappingSnap = await getDoc(mappingRef);

        if (!mappingSnap.exists()) {
            return NextResponse.json({ error: 'Access denied or property not found' }, { status: 403 });
        }

        // 2. Fetch Property Details to get the canonical name
        const propertyRef = doc(db, `artifacts/${appId}/properties`, propertyId);
        const propertySnap = await getDoc(propertyRef);

        if (!propertySnap.exists()) {
            return NextResponse.json({ error: 'Property details not found' }, { status: 404 });
        }

        const propertyData = propertySnap.data() as any;
        const propName = propertyData.name || 'Property';

        // 3. Fetch Guests matching this propertyId
        const guestsRef = collection(db, `artifacts/${appId}/guests`);
        const qGuests = query(
            guestsRef,
            where('propertyId', '==', propertyId),
            where('status', '==', 'booked')
        );

        const snapshot = await getDocs(qGuests);
        const guests = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as any));

        let icalContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//StaySync//GuestGreeter//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            `X-WR-CALNAME:${propName} Stays`,
            'X-WR-TIMEZONE:UTC'
        ];

        guests.forEach(guest => {
            // Only include stays with valid dates
            if (!guest.checkInDate || !guest.checkOutDate) return;

            const checkIn = guest.checkInDate.replace(/-/g, '');
            const checkOut = guest.checkOutDate.replace(/-/g, '');
            const summary = `${guest.guestName || 'Guest'} - ${propName}`;
            const description = `Guest: ${guest.guestName}\\nProperty: ${propName}\\nGuests: ${guest.numberOfGuests || 1}\\nStatus: ${guest.status}`;

            icalContent.push('BEGIN:VEVENT');
            icalContent.push(`UID:${guest.id}@staysync.pro`);
            icalContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
            icalContent.push(`DTSTART;VALUE=DATE:${checkIn}`);
            icalContent.push(`DTEND;VALUE=DATE:${checkOut}`);
            icalContent.push(`SUMMARY:${summary}`);
            icalContent.push(`DESCRIPTION:${description}`);
            icalContent.push('STATUS:CONFIRMED');
            icalContent.push('END:VEVENT');
        });

        icalContent.push('END:VCALENDAR');

        return new Response(icalContent.join('\r\n'), {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="calendar-${propertyId}.ics"`,
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
            }
        });
    } catch (error) {
        console.error('iCal Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate calendar' }, { status: 500 });
    }
}
