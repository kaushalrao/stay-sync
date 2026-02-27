import { toPng } from 'html-to-image';

export const shareReceiptImage = async (
    receiptElement: HTMLElement | null,
    guestName: string,
    propertyName: string,
    options?: {
        shareText?: string;
        onSuccess?: () => void;
        onError?: (err: Error) => void;
        onSettleDelayMs?: number;
    }
) => {
    if (!receiptElement) return;

    try {
        // Render delay config
        await new Promise(r => setTimeout(r, options?.onSettleDelayMs || 100));

        const dataUrl = await toPng(receiptElement, {
            quality: 0.95,
            style: { borderRadius: '0' }
        });

        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `receipt-${guestName || 'guest'}.png`, { type: 'image/png' });

        const defaultShareText = `Here is the receipt for your stay at ${propertyName}.`;

        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: `Receipt for ${guestName}`,
                text: options?.shareText || defaultShareText
            });
            options?.onSuccess?.();
            return { method: 'system' };
        } else {
            const link = document.createElement('a');
            link.download = `receipt-${guestName}.png`;
            link.href = dataUrl;
            link.click();
            options?.onSuccess?.();
            return { method: 'download' };
        }
    } catch (err) {
        console.error('Sharing failed:', err);
        options?.onError?.(err instanceof Error ? err : new Error('Unknown error during share'));
        throw err;
    }
};
