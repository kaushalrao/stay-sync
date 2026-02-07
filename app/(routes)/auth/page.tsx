"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@components/providers/AppProvider';
import { AuthForm } from '@components/auth/AuthForm';
import { Loader } from '@components/ui/Loader';

export default function AuthPage() {
    const { user, loading } = useApp();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return <Loader className="min-h-screen flex items-center justify-center text-white" iconClassName="text-orange-500" size={48} />;
    }

    return (
        <div className="w-full min-h-[85vh] flex items-center justify-center animate-fade-in">
            <AuthForm onAuthSuccess={() => router.push('/')} />
        </div>
    );
}
