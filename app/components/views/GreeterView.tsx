import * as React from 'react';
import { useState, useMemo } from 'react';
import { Check, Copy, MessageCircle } from 'lucide-react';
import { Property, Template } from '../../lib/types';
import { calculateNights, formatDate, formatCurrency, processTemplate } from '../../lib/utils';
import { PropertyDock } from '../PropertyDock';
import { GuestForm } from '../GuestForm';
import { TemplateSelector } from '../TemplateSelector';
import { PreviewPhone } from '../PreviewPhone';

export const GreeterView: React.FC<{
    properties: Property[];
    templates: Template[];
    showToast: (msg: string, type?: 'success' | 'error') => void;
    selectedPropId: string;
    setSelectedPropId: (id: string) => void;
    mobileTab: 'edit' | 'preview';
    setMobileTab: (t: 'edit' | 'preview') => void
}> = ({ properties, templates, showToast, selectedPropId, setSelectedPropId, mobileTab, setMobileTab }) => {
    const [guestName, setGuestName] = useState('');
    const [numberOfGuests, setNumberOfGuests] = useState<number>(2);
    const [advancePaid, setAdvancePaid] = useState<number>(0);
    const [selectedTempId, setSelectedTempId] = useState(templates[0]?.id || '');
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [copied, setCopied] = useState(false);

    const selectedProperty = properties.find(p => p.id === selectedPropId) || properties[0];
    const selectedTemplate = templates.find(t => t.id === selectedTempId) || templates[0];

    const generatedMessage = useMemo(() => {
        if (!selectedProperty || !selectedTemplate) return '';
        const nights = calculateNights(checkInDate, checkOutDate);
        const totalBaseCost = selectedProperty.basePrice * nights;
        const extraGuestsCount = Math.max(0, numberOfGuests - selectedProperty.baseGuests);
        const totalExtraCost = selectedProperty.extraGuestPrice * extraGuestsCount * nights;
        const totalAmount = totalBaseCost + totalExtraCost;
        const balanceDue = Math.max(0, totalAmount - advancePaid);

        const data: Record<string, string | number> = {
            guestName: guestName.trim() || 'Guest',
            propertyName: selectedProperty.name,
            hostName: selectedProperty.hostName,
            coHostName: selectedProperty.coHostName,
            contactPrimary: selectedProperty.contactPrimary,
            contactSecondary: selectedProperty.contactSecondary,
            wifiName: selectedProperty.wifiName,
            wifiPass: selectedProperty.wifiPass,
            checkInTime: selectedProperty.checkInTime,
            checkOutTime: selectedProperty.checkOutTime,
            locationLink: selectedProperty.locationLink,
            propertyLink: selectedProperty.propertyLink || '',
            checkInDate: formatDate(checkInDate),
            checkOutDate: formatDate(checkOutDate),
            nights: nights,
            numberOfGuests: numberOfGuests,
            totalAmount: formatCurrency(totalAmount),
            advancePaid: formatCurrency(advancePaid),
            balanceDue: formatCurrency(balanceDue),
            basePrice: formatCurrency(selectedProperty.basePrice),
            extraGuestPrice: formatCurrency(selectedProperty.extraGuestPrice),
            baseGuests: selectedProperty.baseGuests,
        };
        return processTemplate(selectedTemplate.content, data);
    }, [guestName, numberOfGuests, advancePaid, selectedProperty, selectedTemplate, checkInDate, checkOutDate]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedMessage);
        setCopied(true);
        showToast('Message copied to clipboard', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(generatedMessage)}`, '_blank');
    };

    return (
        <div className="animate-fade-in pb-10 flex flex-col gap-6 md:gap-10 h-full relative">
            <div className="hidden lg:block">
                <PropertyDock properties={properties} selectedId={selectedPropId} onSelect={setSelectedPropId} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className={`lg:col-span-7 space-y-6 md:space-y-8 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
                    <GuestForm
                        guestName={guestName} setGuestName={setGuestName}
                        checkInDate={checkInDate} setCheckInDate={setCheckInDate}
                        checkOutDate={checkOutDate} setCheckOutDate={setCheckOutDate}
                        numberOfGuests={numberOfGuests} setNumberOfGuests={setNumberOfGuests}
                        advancePaid={advancePaid} setAdvancePaid={setAdvancePaid}
                        templateContent={selectedTemplate?.content}
                    />
                    {templates.length > 0 && (
                        <TemplateSelector templates={templates} selectedId={selectedTempId} onSelect={setSelectedTempId} />
                    )}
                </div>

                <div className={`lg:col-span-5 lg:sticky lg:top-24 ${mobileTab === 'edit' ? 'hidden lg:block' : 'block'}`}>
                    <PreviewPhone message={generatedMessage} onSend={handleWhatsApp} onCopy={handleCopy} copied={copied} />
                </div>
            </div>

            <div className="lg:hidden fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                <button onClick={handleCopy} className="w-12 h-12 bg-slate-700/90 backdrop-blur-md text-white rounded-full shadow-lg border border-white/10 flex items-center justify-center active:scale-90 transition-all">
                    {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                </button>
                <button onClick={handleWhatsApp} className="w-14 h-14 bg-[#25D366] text-white rounded-full shadow-xl shadow-green-500/30 flex items-center justify-center active:scale-90 transition-all hover:scale-105">
                    <MessageCircle size={28} fill="white" />
                </button>
            </div>
        </div>
    );
};
