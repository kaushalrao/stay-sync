"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Check, Copy, MessageCircle, PenTool, Eye, X } from 'lucide-react';
import { GuestDetails, Guest, CalendarEvent } from '@lib/types';
import { DEFAULT_GUEST_DETAILS } from '@lib/constants';
import { calculateNights, openWhatsApp } from '@lib/utils';
import { PropertyDock } from '@components/greeter/PropertyDock';
import { Portal } from '@components/ui/Portal';
import { Loader } from '@components/ui/Loader';
import { GuestForm } from '@components/guests/GuestForm';
import { TemplateSelector } from '@components/greeter/TemplateSelector';
import { PreviewPhone } from '@components/greeter/PreviewPhone';
import { GuestDirectory } from '@components/guests/GuestDirectory';
import { useApp } from '@components/providers/AppProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { calendarService, guestService, templateService } from '@services/index';
import { Suspense } from 'react';
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

    const [selectedPropId, setSelectedPropId] = useState('');
    const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
    const [guestDetails, setGuestDetails] = useState<GuestDetails>(DEFAULT_GUEST_DETAILS);
    const [initialGuestDetails, setInitialGuestDetails] = useState<GuestDetails | null>(null);
    const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
    const [currentGuestStatus, setCurrentGuestStatus] = useState<Guest['status'] | null>(null);
    const [selectedTempId, setSelectedTempId] = useState('');
    const [copied, setCopied] = useState(false);
    const [blockedDates, setBlockedDates] = useState<CalendarEvent[]>([]);

    // Guest Directory State
    const [isGuestbookOpen, setIsGuestbookOpen] = useState(false);

    const isGuestLoadingRef = React.useRef(false);

    const handleSelectGuest = React.useCallback((guest: Guest) => {
        if (guest?.propName) {
            const prop = properties.find(p => p.name === guest.propName);
            if (prop && prop.id !== selectedPropId) {
                isGuestLoadingRef.current = true;
                setSelectedPropId(prop.id);
            }
        }

        const details = {
            guestName: guest.guestName,
            numberOfGuests: guest.numberOfGuests,
            advancePaid: guest.advancePaid,
            discount: guest.discount || 0,
            checkInDate: guest.checkInDate,
            checkOutDate: guest.checkOutDate,
            phoneNumber: guest.phoneNumber || ''
        };
        setGuestDetails(details);
        setInitialGuestDetails(details);
        setCurrentGuestId(guest.id);
        setCurrentGuestStatus(guest.status);
        setIsGuestbookOpen(false);
        showToast("Guest details loaded", "success");
    }, [properties, selectedPropId, showToast]);

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    // Fetch Guest from URL if present
    useEffect(() => {
        const loadGuestFromUrl = async () => {
            if (!user || !guestIdParam) return;

            try {
                const guest = await guestService.getGuest(guestIdParam);

                if (guest) {
                    handleSelectGuest(guest);
                } else {
                    showToast("Guest not found", "error");
                }
            } catch (err) {
                console.error("Error loading guest:", err);
            }
        };

        if (user && guestIdParam && currentGuestId !== guestIdParam) {
            loadGuestFromUrl();
        }
    }, [user, guestIdParam, currentGuestId, handleSelectGuest, showToast]);

    useEffect(() => {
        if (!selectedPropId && properties.length > 0) {
            setSelectedPropId(properties[0].id);
        }
    }, [properties, selectedPropId]);

    useEffect(() => {
        if (!selectedTempId && templates.length > 0) {
            setSelectedTempId(templates[0].id);
        }
    }, [templates, selectedTempId]);

    const selectedProperty = properties.find(p => p.id === selectedPropId) || properties[0];

    // Reset dates & guest ID when property changes
    useEffect(() => {
        // If there is a guestId in URL, NEVER reset based on property change. URL is source of truth.
        if (guestIdParam) return;

        // Only reset if we are NOT currently loading a guest from URL or explicitly selecting one
        if (!isGuestLoadingRef.current) {
            setGuestDetails(prev => ({
                ...prev,
                checkInDate: '',
                checkOutDate: '',
                numberOfGuests: selectedProperty?.baseGuests || DEFAULT_GUEST_DETAILS.numberOfGuests
            }));
            setCurrentGuestId(null);
        }

        // Reset the ref after the effect logic runs
        if (isGuestLoadingRef.current) {
            isGuestLoadingRef.current = false;
        }
    }, [selectedPropId, guestIdParam, selectedProperty]);

    // Fetch Calendar Data (Internal + External)
    useEffect(() => {
        const fetchCalendarData = async () => {
            if (!user?.uid || !selectedProperty) return;
            const events = await calendarService.aggregateEvents(guestsFromStore, selectedProperty);
            setBlockedDates(events);
        };

        fetchCalendarData();
    }, [selectedProperty, user?.uid, guestsFromStore]);

    const isDirty = useMemo(() => {
        if (!currentGuestId || !initialGuestDetails) return true;

        // Deep compare (simple for GuestDetails)
        return (
            guestDetails.guestName !== initialGuestDetails.guestName ||
            guestDetails.numberOfGuests !== initialGuestDetails.numberOfGuests ||
            guestDetails.advancePaid !== initialGuestDetails.advancePaid ||
            guestDetails.discount !== initialGuestDetails.discount ||
            guestDetails.checkInDate !== initialGuestDetails.checkInDate ||
            guestDetails.checkOutDate !== initialGuestDetails.checkOutDate ||
            guestDetails.phoneNumber !== initialGuestDetails.phoneNumber
        );
    }, [guestDetails, initialGuestDetails, currentGuestId]);

    const isReadOnly = useMemo(() => {
        if (currentGuestStatus === 'cancelled') return true;
        if (!guestDetails.checkOutDate) return false;

        const today = new Date().toISOString().split('T')[0];
        return guestDetails.checkOutDate < today;
    }, [currentGuestStatus, guestDetails.checkOutDate]);

    const selectedTemplate = templates.find(t => t.id === selectedTempId) || templates[0];

    const generatedMessage = useMemo(() => {
        if (!selectedProperty || !selectedTemplate) return '';
        return templateService.generateMessage(selectedTemplate.content, selectedProperty, guestDetails);
    }, [guestDetails, selectedProperty, selectedTemplate]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedMessage);
        setCopied(true);
        showToast('Message copied to clipboard', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        openWhatsApp(generatedMessage, guestDetails.phoneNumber);
    };

    const handleSaveGuest = async () => {
        if (!guestDetails.guestName) {
            showToast("Please enter a guest name", "error");
            return;
        }

        if (!user) {
            showToast("Please sign in to save", "error");
            return;
        }

        if (!selectedProperty) {
            showToast("No property selected", "error");
            return;
        }

        try {
            // Calculate Total Amount for saving
            const nights = calculateNights(guestDetails.checkInDate, guestDetails.checkOutDate);
            const totalBaseCost = selectedProperty.basePrice * nights;
            const extraGuestsCount = Math.max(0, guestDetails.numberOfGuests - selectedProperty.baseGuests);
            const totalExtraCost = selectedProperty.extraGuestPrice * extraGuestsCount * nights;
            const subTotal = totalBaseCost + totalExtraCost;
            const discount = guestDetails.discount || 0;
            const totalAmount = Math.max(0, subTotal - discount);

            const guestData: Partial<Guest> = {
                ...guestDetails,
                createdAt: Date.now(),
                status: 'booked',
                firstName: guestDetails.guestName.split(' ')[0],
                propName: selectedProperty.name,
                totalAmount: totalAmount
            };



            if (currentGuestId) {
                // Update existing
                await guestService.updateGuest(currentGuestId, guestData);
                showToast("Guest updated!", "success");

                // Trigger Email Notification (Async) - Updated Type
                guestService.sendNotification({
                    guest: { ...guestDetails, id: currentGuestId },
                    property: selectedProperty,
                    type: 'updated',
                    totalAmount: totalAmount,
                    origin: window.location.origin
                });
            } else {
                // Create new
                // Cast to any to bypass Partial check here, assuming form validation handles required fields
                const id = await guestService.addGuest(guestData as any);
                setCurrentGuestId(id);
                showToast("Guest saved to directory!", "success");

                // Trigger Email Notification (Async) - New Type
                guestService.sendNotification({
                    guest: { ...guestDetails, id },
                    property: selectedProperty,
                    type: 'new',
                    totalAmount: totalAmount,
                    origin: window.location.origin
                });

                // Reset dirty state
                setInitialGuestDetails({ ...guestDetails });
            }
        } catch (error) {
            console.error("Error saving guest:", error);
            showToast("Failed to save guest", "error");
        }
    };

    if (loading) {
        return <Loader className="flex h-screen items-center justify-center" />;
    }

    return (
        <div className="px-4 md:px-8 pb-24 md:pb-0 flex flex-col md:gap-10 h-full relative">
            <div className="hidden lg:block mt-8 animate-fade-in">
                <PropertyDock properties={properties} selectedId={selectedPropId} onSelect={setSelectedPropId} disabled={!!currentGuestId} />
            </div>

            {/* Mobile Header Controls */}
            <div className="lg:hidden w-[calc(100%+2rem)] -mx-4 sticky top-16 z-30 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl py-2 px-4 border-b border-slate-200 dark:border-white/5 animate-fade-in mb-4">
                <PropertyDock properties={properties} selectedId={selectedPropId} onSelect={setSelectedPropId} disabled={!!currentGuestId} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1 animate-fade-in">
                {/* Left Section: Form and Templates */}
                <div className={`lg:col-span-8 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
                        <div className="space-y-6 md:space-y-8 relative z-20">
                            <GuestForm
                                details={guestDetails}
                                onChange={setGuestDetails}
                                templateContent={selectedTemplate?.content}
                                blockedDates={blockedDates}
                                onSaveGuest={handleSaveGuest}
                                onOpenDirectory={() => setIsGuestbookOpen(true)}
                                icalFeeds={selectedProperty?.icalFeeds}
                                isDirty={isDirty}
                                isReadOnly={isReadOnly}
                            />
                        </div>

                        <div className="sticky top-24">
                            {templates.length > 0 && (
                                <TemplateSelector templates={templates} selectedId={selectedTempId} onSelect={setSelectedTempId} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Section: Preview Phone */}
                <div className={`lg:col-span-4 lg:sticky lg:top-24 ${mobileTab === 'edit' ? 'hidden lg:block' : 'block'}`}>
                    <PreviewPhone message={generatedMessage} onSend={handleWhatsApp} onCopy={handleCopy} copied={copied} />
                </div>

                {/* Guest Directory Drawer */}
                {isGuestbookOpen && (
                    <Portal>
                        <div className="fixed inset-0 z-[100] flex justify-end">
                            <div className="absolute inset-0 bg-black/60 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsGuestbookOpen(false)} />

                            <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 shadow-2xl p-6 flex flex-col animate-slide-left">
                                <div className="flex justify-between items-center mb-6 shrink-0">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">Guest Directory</h3>
                                    <button onClick={() => setIsGuestbookOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <GuestDirectory mode="picker" onSelect={handleSelectGuest} className="h-full" />
                                </div>
                            </div>
                        </div>
                    </Portal>
                )}
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 p-2 z-30 safe-area-bottom">
                <div className="grid grid-cols-4 gap-2 h-14">
                    {/* Editor Tab */}
                    <button
                        onClick={() => setMobileTab('edit')}
                        className={`flex flex-col items-center justify-center rounded-xl transition-all ${mobileTab === 'edit' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <PenTool size={20} />
                        <span className="text-[10px] font-medium mt-1">Editor</span>
                    </button>

                    {/* Preview Tab */}
                    <button
                        onClick={() => setMobileTab('preview')}
                        className={`flex flex-col items-center justify-center rounded-xl transition-all ${mobileTab === 'preview' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <Eye size={20} />
                        <span className="text-[10px] font-medium mt-1">Preview</span>
                    </button>

                    {/* Copy Action */}
                    <button
                        onClick={handleCopy}
                        className="flex flex-col items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all"
                    >
                        {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                        <span className="text-[10px] font-medium mt-1">Copy</span>
                    </button>

                    {/* WhatsApp Action */}
                    <button
                        onClick={handleWhatsApp}
                        className="flex flex-col items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 active:scale-95 transition-all"
                    >
                        <MessageCircle size={20} />
                        <span className="text-[10px] font-medium mt-1">Send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function GreeterPage() {
    return (
        <Suspense fallback={<Loader className="flex items-center justify-center p-10" iconClassName="text-orange-400" />}>
            <GreeterContent />
        </Suspense>
    );
}
