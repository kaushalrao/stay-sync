"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import {
    Check, Copy, MessageCircle, Eye, UserSearch,
    Calendar, Phone, Users, MapPin, BadgeCheck, Clock, UserCheck
} from 'lucide-react';
import { GuestDetails, Guest } from '@lib/types';
import { DEFAULT_GUEST_DETAILS } from '@lib/constants';
import { openWhatsApp } from '@lib/utils';
import { Loader } from '@components/ui/Loader';
import { TemplateSelector } from '@components/greeter/TemplateSelector';
import { PreviewPhone } from '@components/greeter/PreviewPhone';
import { useApp } from '@components/providers/AppProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { guestService, templateService } from '@services/index';
import { format } from 'date-fns';
import { useGuestStore, usePropertyStore, useTemplateStore, useUIStore } from '@store/index';

function GreeterContent() {
    const properties = usePropertyStore(state => state.properties);
    const templates = useTemplateStore(state => state.templates);
    const showToast = useUIStore(state => state.showToast);
    const guestsFromStore = useGuestStore(state => state.guests);

    const { user, loading } = useApp();
    const router = useRouter();
    const searchParams = useSearchParams();
    const guestIdParam = searchParams.get('guestId');

    const [mobileTab, setMobileTab] = useState<'context' | 'preview'>('context');
    const [guestDetails, setGuestDetails] = useState<GuestDetails>(DEFAULT_GUEST_DETAILS);
    const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
    const [selectedTempId, setSelectedTempId] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSelectGuest = React.useCallback((guest: Guest) => {
        const details = {
            guestName: guest.guestName,
            numberOfGuests: guest.numberOfGuests,
            advancePaid: guest.advancePaid || 0,
            discount: guest.discount || 0,
            checkInDate: guest.checkInDate,
            checkOutDate: guest.checkOutDate,
            phoneNumber: guest.phoneNumber || ''
        };
        setGuestDetails(details);
        setCurrentGuestId(guest.id);
        setMobileTab('context');
        showToast("Guest selected", "success");
    }, [showToast]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const loadGuestFromUrl = async () => {
            if (!user || !guestIdParam) return;
            try {
                const guest = await guestService.getGuest(guestIdParam);
                if (guest) handleSelectGuest(guest);
            } catch (err) {
                console.error("Error loading guest:", err);
            }
        };

        if (user && guestIdParam && currentGuestId !== guestIdParam) {
            loadGuestFromUrl();
        }
    }, [user, guestIdParam, currentGuestId, handleSelectGuest]);

    useEffect(() => {
        if (!selectedTempId && templates.length > 0) {
            setSelectedTempId(templates[0].id);
        }
    }, [templates, selectedTempId]);

    // Derived property from guest or defaults
    const selectedProperty = useMemo(() => {
        const currentGuest = guestsFromStore.find(g => g.id === currentGuestId);
        if (currentGuest?.propName) {
            return properties.find(p => p.name === currentGuest.propName) || properties[0];
        }
        return properties[0];
    }, [currentGuestId, guestsFromStore, properties]);

    const selectedTemplate = templates.find(t => t.id === selectedTempId) || templates[0];

    // Enhance template data with balance
    const enrichedDetails = useMemo(() => {
        const baseData = { ...guestDetails };
        // Add dynamic balance mapping if missing
        return baseData;
    }, [guestDetails]);

    const generatedMessage = useMemo(() => {
        if (!selectedProperty || !selectedTemplate || !currentGuestId) return 'Select a guest to preview message...';
        return templateService.generateMessage(selectedTemplate.content, selectedProperty, enrichedDetails);
    }, [enrichedDetails, selectedProperty, selectedTemplate, currentGuestId]);

    const handleCopy = () => {
        if (!currentGuestId) return;
        navigator.clipboard.writeText(generatedMessage);
        setCopied(true);
        showToast('Message copied', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        if (!currentGuestId) return showToast("Select a guest first", "error");
        openWhatsApp(generatedMessage, guestDetails.phoneNumber);
    };

    if (loading) {
        return <Loader className="flex h-screen items-center justify-center" />;
    }

    return (
        <div className="px-4 md:px-8 pb-24 md:pb-0 pt-4 lg:pt-8 flex flex-col md:gap-10 h-full relative border-box">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1 animate-fade-in p-0 lg:pb-8">
                {/* Left Section: Context & Templates (Formerly Middle) */}
                <div className={`lg:col-span-6 flex flex-col space-y-4 md:space-y-6 ${mobileTab === 'context' ? 'block' : 'hidden'} lg:flex`}>

                    {/* Context Card */}
                    <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative group shrink-0">
                        {/* Decorative background accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-16 translate-x-16 blur-3xl pointer-events-none" />

                        {currentGuestId ? (
                            <div className="space-y-5">
                                {(() => {
                                    const guest = guestsFromStore.find(g => g.id === currentGuestId);
                                    const nights = guestDetails.checkInDate && guestDetails.checkOutDate ? Math.ceil((new Date(guestDetails.checkOutDate).getTime() - new Date(guestDetails.checkInDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

                                    const getStatusConfig = (status?: string) => {
                                        switch (status) {
                                            case 'booked':
                                            case 'pending':
                                                return { icon: Calendar, label: 'Upcoming', className: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20' };
                                            case 'checked_in':
                                                return { icon: UserCheck, label: 'Checked In', className: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' };
                                            case 'checked_out':
                                                return { icon: BadgeCheck, label: 'Completed', className: 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5' };
                                            case 'deleted':
                                                return { icon: Clock, label: 'Deleted', className: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' };
                                            default:
                                                return { icon: Clock, label: status || 'Pending', className: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20' };
                                        }
                                    };

                                    const statusConfig = getStatusConfig(guest?.status);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <>
                                            <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/5 pb-4">
                                                <div className="space-y-1.5">
                                                    <h3 className="font-bold text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight">
                                                        {guestDetails.guestName}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${statusConfig.className}`}>
                                                            <StatusIcon size={10} strokeWidth={3} />
                                                            {statusConfig.label}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                                                            <MapPin size={12} className="text-indigo-500" strokeWidth={2.5} />
                                                            <span>{guest?.propName || selectedProperty?.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                                        <Calendar size={14} strokeWidth={2.5} />
                                                        <span className="text-[10px] uppercase font-bold tracking-widest leading-none mt-0.5">Stay Period</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                        {guestDetails.checkInDate && format(new Date(guestDetails.checkInDate), 'MMM d')} - {guestDetails.checkOutDate && format(new Date(guestDetails.checkOutDate), 'MMM d')}
                                                        <span className="text-indigo-500 font-medium ml-1.5">({nights} Nights)</span>
                                                    </p>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                                        <Users size={14} strokeWidth={2.5} />
                                                        <span className="text-[10px] uppercase font-bold tracking-widest leading-none mt-0.5">Occupancy</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                        {guestDetails.numberOfGuests} Guests
                                                    </p>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                                        <Phone size={14} strokeWidth={2.5} />
                                                        <span className="text-[10px] uppercase font-bold tracking-widest leading-none mt-0.5">Contact</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                        {guestDetails.phoneNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="h-28 md:h-36 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl">
                                <UserSearch size={32} className="opacity-20" />
                                <p className="text-sm font-medium">Please select a guest from the inbox</p>
                            </div>
                        )}
                    </div>

                    <div className="sticky top-24 z-10">
                        {templates.length > 0 && (
                            <TemplateSelector templates={templates} selectedId={selectedTempId} onSelect={setSelectedTempId} />
                        )}
                    </div>
                </div>

                {/* Right Section: Preview Phone */}
                <div className={`lg:col-span-6 lg:sticky lg:top-24 ${mobileTab === 'preview' ? 'block' : 'hidden'} lg:block`}>
                    <PreviewPhone message={generatedMessage} onSend={handleWhatsApp} onCopy={handleCopy} copied={copied} />
                </div>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 p-2 z-30 safe-area-bottom">
                <div className="grid grid-cols-4 gap-2 h-14">
                    <button
                        onClick={() => setMobileTab('context')}
                        className={`col-span-1 flex flex-col items-center justify-center rounded-xl transition-all ${mobileTab === 'context' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <UserSearch size={20} />
                        <span className="text-[10px] font-medium mt-1">Details</span>
                    </button>

                    <button
                        onClick={() => setMobileTab('preview')}
                        className={`col-span-1 flex flex-col items-center justify-center rounded-xl transition-all ${mobileTab === 'preview' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <Eye size={20} />
                        <span className="text-[10px] font-medium mt-1">Preview</span>
                    </button>

                    <button
                        onClick={handleCopy}
                        className="col-span-1 flex flex-col items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all"
                    >
                        {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                        <span className="text-[10px] font-medium mt-1">Copy</span>
                    </button>

                    <button
                        onClick={handleWhatsApp}
                        className="col-span-1 flex flex-col items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 active:scale-95 transition-all"
                    >
                        <MessageCircle size={20} />
                        <span className="text-[10px] font-medium mt-1">Send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export function GreeterPageClient() {
    return (
        <Suspense fallback={<Loader className="flex items-center justify-center p-10" iconClassName="text-indigo-400" />}>
            <GreeterContent />
        </Suspense>
    );
}
