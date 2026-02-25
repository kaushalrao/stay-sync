"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { GuestDirectory } from '@components/guests/GuestDirectory';

export function GuestsPageClient() {
    const router = useRouter();

    return (
        <GuestDirectory
            mode="page"
            onSelect={(guest) => router.push(`/greeter?guestId=${guest.id}`)}
        />
    );
}
