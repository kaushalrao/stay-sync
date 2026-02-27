import React, { useRef, useState } from 'react';
import { Portal } from '../ui/Portal';
import { X, Image as ImageIcon } from 'lucide-react';
import { ReceiptCard } from './ReceiptCard';
import { shareReceiptImage } from '@lib/shareReceipt';
import { Property } from '@lib/types';
import { useUIStore } from '@store/index';

interface ShareReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Data passing
    guestName: string;
    phoneNumber: string;
    property?: Property;
    checkInDate?: string;
    checkOutDate?: string;
    nights: number;
    numberOfGuests: number;
    baseRate: number;
    baseTotal: number;
    extraGuestRate: number;
    extraGuestsCount: number;
    extraTotal: number;
    discount: number;
    totalAmount: number;
    advancePaid: number;
    balanceDue: number;
    // Optional custom share text
    shareText?: string;
}

export const ShareReceiptModal: React.FC<ShareReceiptModalProps> = ({
    isOpen,
    onClose,
    guestName,
    phoneNumber,
    property,
    checkInDate,
    checkOutDate,
    nights,
    numberOfGuests,
    baseRate,
    baseTotal,
    extraGuestRate,
    extraGuestsCount,
    extraTotal,
    discount,
    totalAmount,
    advancePaid,
    balanceDue,
    shareText
}) => {
    const [isCapturing, setIsCapturing] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);
    const showToast = useUIStore(state => state.showToast);

    if (!isOpen) return null;

    const handleShare = async () => {
        setIsCapturing(true);
        try {
            const result = await shareReceiptImage(
                receiptRef.current,
                guestName,
                property?.name || 'our property',
                {
                    shareText,
                    onSuccess: () => {
                        // Toast handled inside callback based on result
                    }
                }
            );

            if (result?.method === 'system') {
                showToast('Opening share sheet...', 'success');
            } else if (result?.method === 'download') {
                showToast('Downloaded receipt image', 'success');
            }
        } catch (err) {
            showToast('Failed to generate receipt image', 'error');
        } finally {
            setIsCapturing(false);
            onClose();
        }
    };

    return (
        <Portal>
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 cursor-default"
                onClick={(e) => {
                    e.stopPropagation(); // Stop bubbling to GuestCard clicks
                }}
            >
                <div
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => !isCapturing && onClose()}
                />
                <div className="relative w-full max-w-md animate-slide-up flex flex-col justify-center items-center z-10 max-h-[90vh]">
                    <button
                        onClick={() => !isCapturing && onClose()}
                        className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-slate-800/50 rounded-full hover:bg-slate-800 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="w-full overflow-y-auto rounded-3xl hide-scrollbar pointer-events-none">
                        <ReceiptCard
                            ref={receiptRef}
                            guestName={guestName || ''}
                            phoneNumber={phoneNumber || ''}
                            property={property}
                            checkInDate={checkInDate}
                            checkOutDate={checkOutDate}
                            nights={nights}
                            numberOfGuests={numberOfGuests}
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

                    <div className="w-full mt-4">
                        <button
                            onClick={handleShare}
                            disabled={isCapturing}
                            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-lg shadow-teal-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
                        >
                            {isCapturing ? <span className="animate-spin text-xl leading-none">⏳</span> : <ImageIcon size={20} />}
                            Share Balance Receipt
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};
