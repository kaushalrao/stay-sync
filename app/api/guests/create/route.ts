import { NextRequest, NextResponse } from 'next/server';
import { db, appId } from '@/app/lib/firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { calculateNights } from '@/app/lib/utils';
import { Property } from '@/app/lib/types';

export async function POST(req: NextRequest) {
    try {
        const { userId, guestData } = await req.json();

        if (!userId || !guestData) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }

        const {
            propertyId,
            checkInDate,
            checkOutDate,
            numberOfGuests,
            discount = 0,
            advancePaid = 0
        } = guestData;

        // 1. Fetch Property details securely from DB
        const propertyPath = `artifacts/${appId}/users/${userId}/properties/${propertyId}`;
        const propertySnap = await getDoc(doc(db, propertyPath));

        if (!propertySnap.exists()) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        const property = { id: propertySnap.id, ...propertySnap.data() } as Property;

        // 2. Recalculate Totals Server-side
        const nights = calculateNights(checkInDate, checkOutDate);
        if (nights <= 0) {
            return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });
        }

        const totalBaseCost = property.basePrice * nights;
        const extraGuestsCount = Math.max(0, numberOfGuests - property.baseGuests);
        const totalExtraCost = property.extraGuestPrice * extraGuestsCount * nights;

        const subTotal = totalBaseCost + totalExtraCost;
        const totalAmount = Math.max(0, subTotal - discount);
        const balanceAmount = Math.max(0, totalAmount - advancePaid);

        // 3. Prepare Final Data
        const finalGuestData = {
            ...guestData,
            totalAmount,
            balanceAmount,
            propName: property.name,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: 'PENDING',
        };

        // 4. Save to Firestore
        const guestsPath = `artifacts/${appId}/users/${userId}/guests`;
        const docRef = await addDoc(collection(db, guestsPath), finalGuestData);

        return NextResponse.json({
            success: true,
            id: docRef.id,
            guest: { ...finalGuestData, id: docRef.id }
        });

    } catch (error) {
        console.error('Error in secure guest creation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
