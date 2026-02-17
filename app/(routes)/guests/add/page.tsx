"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@store/useStore';
import { useApp } from '@components/providers/AppProvider';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { DatePicker } from '@components/calendar/DatePicker';
import {
    ChevronRight,
    ChevronLeft,
    User,
    Phone,
    Mail,
    Home,
    Users,
    Tag,
    Wallet,
    CheckCircle2,
    Calendar,
    IndianRupee,
    Send,
    Loader2
} from 'lucide-react';
import { GuestDetails, Guest } from '@lib/types';
import { calculateNights, formatCurrency, openWhatsApp, processTemplate } from '@lib/utils';

type Step = 1 | 2 | 3;

export default function AddGuestPage() {
    const router = useRouter();
    const { user, properties, templates, showToast } = useApp();

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<GuestDetails>({
        guestName: '',
        phoneNumber: '',
        email: '',
        checkInDate: '',
        checkOutDate: '',
        numberOfGuests: 2,
        propertyId: '',
        discount: 0,
        advancePaid: 0,
        totalAmount: 0,
        balanceAmount: 0,
    });

    const selectedProperty = useMemo(() =>
        properties.find(p => p.id === formData.propertyId),
        [properties, formData.propertyId]
    );

    // Auto-calculate totals whenever relevant fields change
    useEffect(() => {
        if (!selectedProperty) return;

        const nights = calculateNights(formData.checkInDate, formData.checkOutDate);
        const totalBaseCost = selectedProperty.basePrice * nights;
        const extraGuestsCount = Math.max(0, formData.numberOfGuests - selectedProperty.baseGuests);
        const totalExtraCost = selectedProperty.extraGuestPrice * extraGuestsCount * nights;

        const subTotal = totalBaseCost + totalExtraCost;
        const discount = formData.discount || 0;
        const totalAmount = Math.max(0, subTotal - discount);
        const balanceAmount = Math.max(0, totalAmount - (formData.advancePaid || 0));

        setFormData(prev => ({
            ...prev,
            totalAmount,
            balanceAmount
        }));
    }, [
        formData.checkInDate,
        formData.checkOutDate,
        formData.numberOfGuests,
        formData.discount,
        formData.advancePaid,
        selectedProperty
    ]);

    const updateField = (field: keyof GuestDetails, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep = (step: Step): boolean => {
        switch (step) {
            case 1:
                const nameValid = !!formData.guestName.trim();
                // Allow '+' at the beginning, then only digits. Remove spaces and other non-numeric chars for validation.
                const phoneClean = formData.phoneNumber.replace(/[^0-9+]/g, '').replace(/\s/g, '');
                const phoneValid = phoneClean.length >= 10 && (phoneClean.startsWith('+') ? phoneClean.length > 10 : true);
                return nameValid && phoneValid;
            case 2:
                return !!(formData.propertyId && formData.checkInDate && formData.checkOutDate && formData.numberOfGuests > 0);
            case 3:
                return true;
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => (prev + 1) as Step);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => (prev - 1) as Step);
        window.scrollTo(0, 0);
    };

    const handleSaveAndSend = async () => {
        if (!user) {
            showToast("Please sign in to save", "error");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('/api/guests/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    guestData: formData
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save guest through API');
            }

            const result = await response.json();
            const savedGuest = result.guest;

            showToast("Guest saved successfully!", "success");

            // WhatsApp Logic
            const template = templates.find(t => t.label.toLowerCase().includes('welcome')) || templates[0];
            if (template && selectedProperty) {
                const messageData = {
                    guestName: savedGuest.guestName,
                    propertyName: selectedProperty.name,
                    guestCount: savedGuest.numberOfGuests,
                    totalAmount: formatCurrency(savedGuest.totalAmount),
                    advance: formatCurrency(savedGuest.advancePaid || 0),
                    balance: formatCurrency(savedGuest.balanceAmount),
                    checkInDate: savedGuest.checkInDate,
                    checkOutDate: savedGuest.checkOutDate,
                    nights: calculateNights(savedGuest.checkInDate, savedGuest.checkOutDate),
                    hostName: selectedProperty.hostName,
                };

                const message = processTemplate(template.content, messageData);
                openWhatsApp(message, savedGuest.phoneNumber);
            }

            // Reset and redirect
            setTimeout(() => {
                router.push('/guests');
            }, 1500);

        } catch (error) {
            console.error("Error saving guest:", error);
            showToast("Failed to save guest", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const StepIndicator = () => (
        <div className="mb-8 md:mb-12">
            <div className="flex items-center justify-between mb-2">
                {[1, 2, 3].map((step) => (
                    <div key={step} className="flex flex-col items-center flex-1 relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${currentStep === step
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20'
                            : currentStep > step
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                            {currentStep > step ? <CheckCircle2 size={20} /> : step}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${currentStep === step ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                            }`}>
                            {step === 1 ? 'Guest' : step === 2 ? 'Booking' : 'Confirm'}
                        </span>
                        {step < 3 && (
                            <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-0 ${currentStep > step ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
                                }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Add New Guest</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Follow the steps to register a new booking.</p>
            </div>

            <StepIndicator />

            <Card className="p-6 md:p-8 shadow-xl border-slate-200/60 dark:border-white/5">
                {currentStep === 1 && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <User size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Guest Information</h2>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                value={formData.guestName}
                                onChange={(e) => updateField('guestName', e.target.value)}
                                placeholder="e.g. Rahul Sharma"
                                icon={<User size={16} />}
                                required
                            />
                            <Input
                                label="Phone Number"
                                value={formData.phoneNumber}
                                onChange={(e) => updateField('phoneNumber', e.target.value.replace(/[^0-9+]/g, ''))}
                                placeholder="e.g. +919876543210"
                                icon={<Phone size={16} />}
                                required
                            />
                            <Input
                                label="Email Address (Optional)"
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                placeholder="e.g. rahul@example.com"
                                icon={<Mail size={16} />}
                                type="email"
                            />
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Home size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Booking Details</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 ml-1">
                                    <Home size={12} />
                                    <span>Select Property</span>
                                </label>
                                <select
                                    value={formData.propertyId}
                                    onChange={(e) => updateField('propertyId', e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all appearance-none"
                                >
                                    <option value="">Select a property</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <DatePicker
                                    label="Check-in Date"
                                    date={formData.checkInDate}
                                    onChange={(date) => updateField('checkInDate', date)}
                                    variant="check-in"
                                />
                                <DatePicker
                                    label="Check-out Date"
                                    date={formData.checkOutDate}
                                    onChange={(date) => updateField('checkOutDate', date)}
                                    variant="check-out"
                                    otherDate={formData.checkInDate}
                                    align="right"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Guests"
                                    type="number"
                                    min={1}
                                    value={formData.numberOfGuests}
                                    onChange={(e) => updateField('numberOfGuests', parseInt(e.target.value) || 0)}
                                    icon={<Users size={16} />}
                                />
                                <Input
                                    label="Discount"
                                    type="number"
                                    min={0}
                                    value={formData.discount}
                                    onChange={(e) => updateField('discount', parseFloat(e.target.value) || 0)}
                                    icon={<Tag size={16} />}
                                    placeholder="₹0"
                                />
                                <Input
                                    label="Advance"
                                    type="number"
                                    min={0}
                                    value={formData.advancePaid}
                                    onChange={(e) => updateField('advancePaid', parseFloat(e.target.value) || 0)}
                                    icon={<Wallet size={16} />}
                                    placeholder="₹0"
                                />
                            </div>

                            {selectedProperty && (
                                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Base Price (per night)</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">₹{formatCurrency(selectedProperty.basePrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Nights</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{calculateNights(formData.checkInDate, formData.checkOutDate)}</span>
                                    </div>
                                    <div className="h-[1px] bg-slate-200 dark:bg-white/5 my-2" />
                                    <div className="flex justify-between text-base font-bold">
                                        <span className="text-slate-900 dark:text-white">Total Amount</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">₹{formatCurrency(formData.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold">
                                        <span className="text-slate-500">Balance Due</span>
                                        <span className="text-rose-600 dark:text-rose-400">₹{formatCurrency(formData.balanceAmount)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Review & Confirm</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Guest Info</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <User size={14} className="text-slate-400" />
                                            <span className="font-semibold">{formData.guestName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <Phone size={14} className="text-slate-400" />
                                            <span>{formData.phoneNumber}</span>
                                        </div>
                                        {formData.email && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                <Mail size={14} className="text-slate-400" />
                                                <span>{formData.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stay Info</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <Home size={14} className="text-slate-400" />
                                            <span className="font-semibold">{selectedProperty?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span>{formData.checkInDate} to {formData.checkOutDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <Users size={14} className="text-slate-400" />
                                            <span>{formData.numberOfGuests} Guests</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center opacity-80">
                                        <span className="text-sm">Total Booking Amount</span>
                                        <span className="font-semibold">₹{formatCurrency(formData.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center opacity-80">
                                        <span className="text-sm">Advance Paid</span>
                                        <span className="font-semibold">₹{formatCurrency(formData.advancePaid || 0)}</span>
                                    </div>
                                    {(formData.discount || 0) > 0 && (
                                        <div className="flex justify-between items-center opacity-80">
                                            <span className="text-sm">Discount Applied</span>
                                            <span className="font-semibold">-₹{formatCurrency(formData.discount || 0)}</span>
                                        </div>
                                    )}
                                    <div className="h-[1px] bg-white/20 my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-bold">Balance to Collect</span>
                                        <span className="text-2xl font-black">₹{formatCurrency(formData.balanceAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-10 flex flex-col md:flex-row gap-3">
                    {currentStep > 1 && (
                        <Button
                            variant="secondary"
                            onClick={prevStep}
                            className="flex-1 h-14 rounded-2xl"
                            disabled={isSaving}
                        >
                            <ChevronLeft size={20} className="mr-2" /> Back
                        </Button>
                    )}

                    {currentStep < 3 ? (
                        <Button
                            variant="primary"
                            onClick={nextStep}
                            disabled={!validateStep(currentStep)}
                            className="flex-[2] h-14 rounded-2xl shadow-indigo-200 dark:shadow-none"
                        >
                            Next <ChevronRight size={20} className="ml-2" />
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleSaveAndSend}
                            disabled={isSaving}
                            className="flex-[2] h-14 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={20} className="mr-2 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    Save & Send Details <Send size={18} className="ml-2" />
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </Card>

            <div className="mt-8 text-center">
                <button
                    onClick={() => router.push('/guests')}
                    className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    Cancel and return to list
                </button>
            </div>
        </div>
    );
}
