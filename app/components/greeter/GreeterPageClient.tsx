"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import {
    Check, Copy, MessageCircle, Eye, UserSearch,
    Calendar, Phone, Users, MapPin, BadgeCheck, Clock, UserCheck, Image as ImageIcon, Share2, X, Edit3
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
import { useGuestStore, usePropertyStore, useTemplateStore, useUIStore, useGuestFormStore } from '@store/index';
import { calculateNights } from '@lib/utils';
import { ShareReceiptModal } from '@components/shared/ShareReceiptModal';

function GreeterContent() {
    const properties = usePropertyStore(state => state.properties);
    const templates = useTemplateStore(state => state.templates);
    const showToast = useUIStore(state => state.showToast);
    const guestsFromStore = useGuestStore(state => state.guests);
    const loadGuestForEdit = useGuestFormStore(state => state.loadGuestForEdit);

    const { user, loading } = useApp();
    const router = useRouter();
    const searchParams = useSearchParams();
    const guestIdParam = searchParams.get('guestId');

    const [guestDetails, setGuestDetails] = useState<GuestDetails>(DEFAULT_GUEST_DETAILS);
    const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
    const [selectedTempId, setSelectedTempId] = useState('');
    const [editedMessage, setEditedMessage] = useState('');
    const [copied, setCopied] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isGuestListOpen, setIsGuestListOpen] = useState(false);

    const handleSelectGuest = React.useCallback((guest: Guest) => {
        const details: GuestDetails = {
            guestName: guest.guestName,
            numberOfGuests: guest.numberOfGuests,
            advancePaid: guest.advancePaid || 0,
            discount: guest.discount || 0,
            checkInDate: guest.checkInDate,
            checkOutDate: guest.checkOutDate,
            phoneNumber: guest.phoneNumber || '',
            totalAmount: guest.totalAmount,
            basePrice: guest.basePrice
        };
        setGuestDetails(details);
        setCurrentGuestId(guest.id);
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

    // Sync edited message with generated one when dependencies change
    useEffect(() => {
        setEditedMessage(generatedMessage);
    }, [generatedMessage]);

    const handleCopy = () => {
        if (!currentGuestId) return;
        navigator.clipboard.writeText(editedMessage);
        setCopied(true);
        showToast('Message copied', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        if (!currentGuestId) return showToast("Select a guest first", "error");
        openWhatsApp(editedMessage, guestDetails.phoneNumber);
    };

    // Calculate financials for receipt
    const nights = guestDetails.checkInDate && guestDetails.checkOutDate ? calculateNights(guestDetails.checkInDate, guestDetails.checkOutDate) : 0;
    const baseRate = guestDetails.basePrice || selectedProperty?.basePrice || 0;
    const baseTotal = baseRate * nights;

    const extraGuestsCount = Math.max(0, (guestDetails.numberOfGuests || 0) - (selectedProperty?.baseGuests || 0));
    const extraGuestRate = selectedProperty?.extraGuestPrice || 0;
    const extraTotal = extraGuestRate * extraGuestsCount * nights;

    const subTotal = baseTotal + extraTotal;
    const discount = guestDetails.discount || 0;
    const advancePaid = guestDetails.advancePaid || 0;

    const totalAmount = guestDetails.totalAmount || Math.max(0, subTotal - discount);
    const balanceDue = Math.max(0, totalAmount - advancePaid);

    if (loading) {
        return <Loader className="flex h-screen items-center justify-center" />;
    }

    return (
        <div className="px-4 md:px-8 pb-4 lg:pb-8 pt-0 flex flex-col md:gap-10 min-h-screen relative border-box">
            {/* Mobile Sticky Top Header */}
            {currentGuestId && (
                <div className="lg:hidden sticky top-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between mx-[-1rem]">
                    <div
                        onClick={() => setIsGuestListOpen(true)}
                        className="flex items-center gap-2 max-w-[70%] cursor-pointer active:opacity-70 transition-opacity"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <UserSearch size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                Messaging {guestDetails.guestName}
                            </h2>
                            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                Tap to change guest <Clock size={10} className="inline" />
                            </p>
                        </div>
                        <Calendar size={14} className="text-slate-400" />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1 animate-fade-in p-0 lg:pb-8 pt-4 lg:pt-8">
                {/* Left Section: Context & Templates */}
                <div className="lg:col-span-6 flex flex-col space-y-4 md:space-y-6">

                    {/* Context Card */}
                    <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative group shrink-0">
                        {/* Decorative background accent */}
                        <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-indigo-500/5 rounded-full -translate-y-12 md:-translate-y-16 translate-x-12 md:translate-x-16 blur-3xl pointer-events-none" />

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
                                            <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/5 pb-3 md:pb-4 relative">
                                                <div className="space-y-1 md:space-y-1.5 pr-10">
                                                    <h3 className="font-bold text-lg md:text-2xl text-slate-900 dark:text-white tracking-tight">
                                                        {guestDetails.guestName}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                                        <div className={`px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${statusConfig.className}`}>
                                                            <StatusIcon size={9} strokeWidth={3} className="md:w-[10px] md:h-[10px]" />
                                                            {statusConfig.label}
                                                        </div>
                                                        <div className="flex items-center gap-1 md:gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-semibold">
                                                            <MapPin size={10} className="text-indigo-500 md:w-3 md:h-3" strokeWidth={2.5} />
                                                            <span className="truncate max-w-[100px] md:max-w-none">{guest?.propName || selectedProperty?.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute top-0 right-0 flex items-center gap-2">
                                                    {(guest?.status === 'pending' || guest?.status === 'booked') && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (guest) {
                                                                    loadGuestForEdit(guest);
                                                                    router.push('/add-guest');
                                                                }
                                                            }}
                                                            className="p-2 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-all"
                                                            title="Edit Guest"
                                                        >
                                                            <Edit3 size={18} strokeWidth={2.5} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setIsReceiptModalOpen(true)}
                                                        className="p-2 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-all"
                                                        title="Share Receipt"
                                                    >
                                                        <Share2 size={18} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-2 gap-y-3 gap-x-4 md:gap-y-4 md:gap-x-6">
                                                <div className="space-y-1 md:space-y-1.5 col-span-2 md:col-span-1">
                                                    <div className="flex items-center gap-1.5 md:gap-2 text-slate-400 dark:text-slate-500">
                                                        <Calendar size={12} strokeWidth={2.5} className="md:w-3.5 md:h-3.5" />
                                                        <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest leading-none mt-0.5">Stay Period</span>
                                                    </div>
                                                    <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">
                                                        {guestDetails.checkInDate && format(new Date(guestDetails.checkInDate), 'MMM d')} - {guestDetails.checkOutDate && format(new Date(guestDetails.checkOutDate), 'MMM d')}
                                                        <span className="text-indigo-500 font-medium ml-1 md:ml-1.5">({nights} N)</span>
                                                    </p>
                                                </div>

                                                <div className="space-y-1 md:space-y-1.5">
                                                    <div className="flex items-center gap-1.5 md:gap-2 text-slate-400 dark:text-slate-500">
                                                        <Users size={12} strokeWidth={2.5} className="md:w-3.5 md:h-3.5" />
                                                        <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest leading-none mt-0.5">Guests</span>
                                                    </div>
                                                    <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">
                                                        {guestDetails.numberOfGuests}
                                                    </p>
                                                </div>

                                                <div className="space-y-1 md:space-y-1.5">
                                                    <div className="flex items-center gap-1.5 md:gap-2 text-slate-400 dark:text-slate-500">
                                                        <Phone size={12} strokeWidth={2.5} className="md:w-3.5 md:h-3.5" />
                                                        <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest leading-none mt-0.5">Contact</span>
                                                    </div>
                                                    <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
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
                <div className="lg:col-span-6 lg:sticky lg:top-24">
                    <PreviewPhone
                        message={editedMessage}
                        onChange={setEditedMessage}
                        onSend={handleWhatsApp}
                        onCopy={handleCopy}
                        copied={copied}
                    />
                </div>
            </div>

            <ShareReceiptModal
                isOpen={isReceiptModalOpen && !!currentGuestId}
                onClose={() => setIsReceiptModalOpen(false)}
                guestName={guestDetails.guestName || ''}
                phoneNumber={guestDetails.phoneNumber || ''}
                property={selectedProperty}
                checkInDate={guestDetails.checkInDate}
                checkOutDate={guestDetails.checkOutDate}
                nights={nights || 1}
                numberOfGuests={guestDetails.numberOfGuests || 1}
                baseRate={baseRate}
                baseTotal={baseTotal}
                extraGuestRate={extraGuestRate}
                extraGuestsCount={extraGuestsCount}
                extraTotal={extraTotal}
                discount={discount}
                totalAmount={totalAmount}
                advancePaid={advancePaid}
                balanceDue={balanceDue}
            />

            {/* Mobile Sticky CTA */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 p-3 z-30 safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                <div className="flex gap-2 h-14 w-full">
                    <button
                        onClick={handleCopy}
                        className="flex-shrink-0 w-14 h-14 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all outline-none"
                        aria-label="Copy message"
                    >
                        {copied ? <Check size={22} className="text-green-500" /> : <Copy size={22} />}
                    </button>

                    <button
                        onClick={handleWhatsApp}
                        disabled={!editedMessage || !currentGuestId}
                        className="flex-1 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0f7a6a] disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 flex items-center justify-center gap-2 rounded-xl text-white font-bold text-base active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:shadow-none disabled:opacity-50 outline-none"
                    >
                        <MessageCircle size={22} fill="white" className="text-white" />
                        <span>Send on WhatsApp</span>
                    </button>
                </div>
            </div>

            {/* Bottom Spacer for Mobile Scroll - Just enough to clear the sticky CTA */}
            <div className="lg:hidden h-28 w-full shrink-0" aria-hidden="true" />

            {/* Mobile Guest Selector Overlay */}
            {isGuestListOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsGuestListOpen(false)} />
                    <div className="absolute bottom-0 left-0 w-full h-[70vh] bg-white dark:bg-slate-900 rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Switch Guest</h3>
                            <button onClick={() => setIsGuestListOpen(false)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {guestsFromStore
                                .filter(g => g.status !== 'deleted')
                                .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                                .map(guest => (
                                    <button
                                        key={guest.id}
                                        onClick={() => {
                                            handleSelectGuest(guest);
                                            setIsGuestListOpen(false);
                                        }}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${currentGuestId === guest.id
                                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30'
                                            : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-white/5'
                                            }`}
                                    >
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{guest.guestName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{guest.propName} • {guest.status.replace('_', ' ')}</p>
                                        </div>
                                        {currentGuestId === guest.id && <Check size={18} className="text-indigo-600 dark:text-indigo-400" />}
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
            )}
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
