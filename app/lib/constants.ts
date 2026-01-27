import { GuestDetails } from './types';
import {
    CalendarCheck, MapPin, Coffee, Wifi,
    Utensils, MessageCircle, LogOut, Home, FileText
} from 'lucide-react';
import React from 'react';

export const AVAILABLE_ICONS: Record<string, React.ElementType> = {
    CalendarCheck, MapPin, Coffee, Wifi, Utensils, LogOut, MessageCircle, Home, FileText
};

export const VARIABLE_CATEGORIES = {
    "Property Details": ['propertyName', 'wifiName', 'wifiPass', 'locationLink', 'propertyLink', 'checkInTime', 'checkOutTime', 'baseGuests'],
    "Guest & Booking": ['guestName', 'numberOfGuests', 'nights', 'checkInDate', 'checkOutDate'],
    "Host & Contact": ['hostName', 'coHostName', 'contactPrimary', 'contactSecondary'],
    "Financials": ['totalAmount', 'advancePaid', 'balanceDue', 'basePrice', 'extraGuestPrice']
};

export const DEFAULT_GUEST_DETAILS: GuestDetails = {
    guestName: '',
    numberOfGuests: 2,
    advancePaid: 0,
    discount: 0,
    checkInDate: '',
    checkOutDate: ''
};

export const DEFAULT_PROPERTY_TIMES = {
    checkIn: '13:00',
    checkOut: '11:00'
};

export const DEFAULT_PROPERTY_VALUES = {
    baseGuests: 2,
    basePrice: 0,
    extraGuestPrice: 0
};
