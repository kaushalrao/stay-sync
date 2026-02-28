"use client";

import React, { useState, useRef } from 'react';
import { useGuestFormStore, usePropertyStore, useUIStore, useGuestStore } from '@store/index';
import { calculateNights, formatCurrency, openWhatsApp } from '@lib/utils';
import { guestService } from '@services/index';
import { useRouter } from 'next/navigation';
import { CheckCircle2, MessageCircle, Save, Share2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toPng } from 'html-to-image';
import { ReceiptCard } from '../shared/ReceiptCard';

export function Stage3Review() {
    const { guestData, isEditing, isViewOnly, resetForm, setStage } = useGuestFormStore();
    const properties = usePropertyStore(state => state.properties);
    const updateGuestInStore = useGuestStore(state => state.updateGuestInStore);
    const showToast = useUIStore(state => state.showToast);
    const theme = useUIStore(state => state.theme);
    const router = useRouter();
    const receiptRef = useRef<HTMLDivElement>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    const selectedProperty = properties.find(p => p.id === guestData.propertyId) || properties[0];

    // ... (calculations remain same)
    const nights = calculateNights(guestData.checkInDate || '', guestData.checkOutDate || '');
    const baseRate = selectedProperty?.basePrice || 0;
    const baseTotal = baseRate * nights;

    const extraGuestsCount = Math.max(0, (guestData.numberOfGuests || 0) - (selectedProperty?.baseGuests || 0));
    const extraGuestRate = selectedProperty?.extraGuestPrice || 0;
    const extraTotal = extraGuestRate * extraGuestsCount * nights;

    const subTotal = baseTotal + extraTotal;
    const discount = guestData.discount || 0;
    const advancePaid = guestData.advancePaid || 0;

    const totalAmount = Math.max(0, subTotal - discount);
    const balanceDue = Math.max(0, totalAmount - advancePaid);

    const handleBack = () => setStage(2);

    const generateQuoteMessage = () => {
        return `Hello ${guestData.guestName},\n\nHere is the ${isEditing ? 'updated ' : ''}quote for your stay at ${selectedProperty?.name}:\n\nDates: ${format(new Date(guestData.checkInDate || ''), 'dd MMM')} to ${format(new Date(guestData.checkOutDate || ''), 'dd MMM')} (${nights} Nights)\nGuests: ${guestData.numberOfGuests}\nTotal Amount: ₹${formatCurrency(totalAmount)}\n\nPlease let us know to confirm your booking!`;
    };

    const handleShareImage = async () => {
        if (!receiptRef.current) return;

        setIsCapturing(true);
        try {
            // Give a tiny bit of time for any hydration/transitions
            const dataUrl = await toPng(receiptRef.current, {
                quality: 0.95,
                backgroundColor: theme === 'dark' ? '#131823' : '#ffffff',
                style: {
                    borderRadius: '0' // Remove rounded corners for a cleaner image share if desired
                }
            });

            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `receipt-${guestData.guestName || 'guest'}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Receipt for ${guestData.guestName}`,
                    text: `Sharing receipt with: ${guestData.phoneNumber}\n\n${generateQuoteMessage()}`
                });
                showToast(`Opening share sheet for ${guestData.phoneNumber}`, "success");
            } else {
                // Fallback: Download image
                const link = document.createElement('a');
                link.download = `receipt-${guestData.guestName}.png`;
                link.href = dataUrl;
                link.click();
                showToast("System sharing not supported. Image downloaded.", "success");
            }
        } catch (err) {
            console.error('Sharing failed:', err);
            showToast("Failed to generate receipt image", "error");
        } finally {
            setIsCapturing(false);
        }
    };

    const handleSave = async (shareType: 'none' | 'whatsapp' | 'image') => {
        setIsSaving(true);
        try {
            const finalData = {
                ...guestData,
                updatedAt: Date.now(),
                firstName: (guestData.guestName || '').split(' ')[0],
                totalAmount,
                basePrice: baseRate,
                balanceDue,
                propertyId: guestData.propertyId || 'unknown',
                propName: selectedProperty?.name || 'Unknown Property',
                guestName: guestData.guestName || 'Unknown Guest',
                checkInDate: guestData.checkInDate || '',
                checkOutDate: guestData.checkOutDate || '',
                numberOfGuests: guestData.numberOfGuests || 1,
                advancePaid: advancePaid,
            };

            if (isEditing && guestData.id) {
                await guestService.updateGuest(guestData.id, finalData as any);
                updateGuestInStore(guestData.id, finalData as any);
                showToast("Guest updated successfully!", "success");
            } else {
                finalData.createdAt = Date.now();
                finalData.status = 'pending';
                await guestService.addGuest(finalData as any);
                showToast("Guest saved successfully!", "success");
            }

            if (shareType === 'whatsapp') {
                const msg = generateQuoteMessage();
                openWhatsApp(msg, guestData.phoneNumber);
            } else if (shareType === 'image') {
                await handleShareImage();
            }

            resetForm();
            router.push(isEditing ? '/guests' : '/greeter');
        } catch (error) {
            console.error(error);
            showToast(`Failed to ${isEditing ? 'update' : 'save'} guest`, "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col lg:h-full animate-fade-in lg:overflow-hidden scrollbar-hide">
            <div className="flex-1 overflow-y-auto lg:overflow-visible px-1 pb-64 md:pb-48 lg:pb-2 scrollbar-hide">
                <div className="flex flex-col justify-center lg:min-h-full max-w-lg mx-auto w-full space-y-3 lg:space-y-0.5">
                    <div className="text-center space-y-1 lg:space-y-0.5 shrink-0 pt-2 lg:pt-1 mb-2 lg:mb-1">
                        <div className="flex items-center justify-center gap-2">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Review & Confirm</h2>
                            {isViewOnly && (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 rounded-full border border-slate-200 dark:border-white/5 uppercase tracking-wider">Read Only</span>
                            )}
                        </div>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
                            {isViewOnly ? "Viewing receipt for a past guest." : "Everything look correct?"}
                        </p>
                    </div>

                    <div ref={receiptRef} className={theme === 'dark' ? 'dark bg-[#131823]' : 'bg-white'}>
                        <ReceiptCard
                            guestName={guestData.guestName || ''}
                            phoneNumber={guestData.phoneNumber || ''}
                            property={selectedProperty}
                            checkInDate={guestData.checkInDate}
                            checkOutDate={guestData.checkOutDate}
                            nights={nights}
                            numberOfGuests={guestData.numberOfGuests || 0}
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
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 z-50 lg:static lg:bg-transparent lg:border-t lg:border-slate-100 lg:dark:border-slate-800/50 lg:p-0 flex flex-col items-center gap-1.5 shrink-0 transition-all">
                {!isViewOnly ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                            <button
                                onClick={() => handleSave('none')}
                                disabled={isSaving || isCapturing}
                                className="px-5 py-3 md:py-4 bg-slate-100 dark:bg-[#212638] hover:bg-slate-200 dark:hover:bg-[#2A3046] text-slate-900 dark:text-white rounded-xl md:rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 border border-slate-200 dark:border-[#2D334B] text-sm md:text-base"
                            >
                                <Save size={18} /> {isEditing ? 'Update Only' : 'Save Only'}
                            </button>
                            <button
                                onClick={() => handleSave('whatsapp')}
                                disabled={isSaving || isCapturing}
                                className="px-5 py-3 md:py-4 bg-slate-100 dark:bg-[#212638] hover:bg-slate-200 dark:hover:bg-[#2A3046] text-slate-900 dark:text-white rounded-xl md:rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 border border-slate-200 dark:border-[#2D334B] text-sm md:text-base"
                            >
                                <MessageCircle size={18} /> {isEditing ? 'Update & Text Quote' : 'Text Quote'}
                            </button>
                        </div>
                        <button
                            onClick={() => handleSave('image')}
                            disabled={isSaving || isCapturing}
                            className="w-full px-6 py-4 lg:py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl md:rounded-2xl font-bold transition-all shadow-[0_4px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_4px_25px_rgba(20,184,166,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 text-base md:text-lg lg:text-base"
                        >
                            {isCapturing ? <span className="animate-spin">⏳</span> : <ImageIcon size={20} />} {isEditing ? 'Update & Share Receipt' : 'Save & Share Image Receipt'}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => {
                            resetForm();
                            router.push('/guests');
                        }}
                        className="w-full px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
                    >
                        <CheckCircle2 size={20} /> Close View
                    </button>
                )}
                <button
                    onClick={handleBack}
                    disabled={isSaving || isCapturing}
                    className="hidden lg:block px-4 py-1 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs transition-colors"
                >
                    Back to Details
                </button>
            </div>
        </div>
    );
}
