import type { MouseEvent, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
    href: string;
    title: React.ReactNode;
    description: string;
    label: string;
    icon: LucideIcon;
    color: 'indigo' | 'rose' | 'orange' | 'cyan' | 'purple';
    iconRotation?: string;
    iconHoverRotation?: string;
}

export interface IcalFeed {
    id: string;
    name: string;
    url: string;
    color: string;
}

export interface CalendarEvent {
    start: string;
    end: string;
    summary?: string;
    source?: string; // 'airbnb' | 'manual' | 'booking.com' etc
    color?: string;
}

export interface Property {
    id: string;
    name: string;
    hostName: string;
    coHostName: string;
    contactPrimary: string;
    contactSecondary: string;
    checkInTime: string;
    checkOutTime: string;
    wifiName: string;
    wifiPass: string;
    locationLink: string;
    propertyLink: string;
    hostEmail?: string;
    coHostEmail?: string;
    icalFeeds: IcalFeed[];
    airbnbIcalUrl?: string; // Deprecated, kept for migration
    basePrice: number;
    extraGuestPrice: number;
    baseGuests: number;
    telegramChatId?: string;
}

export interface Template {
    id: string;
    label: string;
    icon: string;
    content: string;
    order?: number;
}

export type ViewState = 'home' | 'greeter' | 'settings';

export interface ToastState {
    message: string;
    type: 'success' | 'error';
    visible: boolean;
}

export interface GuestDetails {
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    advancePaid: number;
    discount?: number;
    phoneNumber?: string;
}

export interface Guest extends GuestDetails {
    id: string;
    createdAt: number;
    firstName: string;
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
    propName?: string;
    phoneNumber?: string;
    email?: string;
    totalAmount?: number;
}

export interface MaintenanceIssue {
    id: string;
    propertyId: string;
    title: string;
    status: 'pending' | 'in-progress' | 'fixed';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    createdAt: number;
}

export interface VariableEditorRef {
    insert: (text: string) => void;
}

export interface TabControlProps {
    options: { id: string; label: string; icon?: ReactNode }[];
    activeId: string;
    onChange: (id: any) => void;
    className?: string;
}

export interface GuestDirectoryProps {
    onSelect?: (guest: Guest) => void;
    mode?: 'page' | 'picker';
    className?: string;
}

export interface GuestCardProps {
    guest: Guest;
    mode: 'page' | 'picker';
    onSelect?: (guest: Guest) => void;
    onDelete?: (e: MouseEvent, id: string) => void;
}

export interface GuestFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    selectedMonth: string;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    toggleAllMonths: () => void;
    statusFilter: 'upcoming' | 'past' | 'all';
    setStatusFilter: (filter: 'upcoming' | 'past' | 'all') => void;
    mode: 'page' | 'picker';
}

export interface GuestFormProps {
    details: GuestDetails;
    onChange: (details: GuestDetails) => void;
    templateContent?: string;
    blockedDates?: CalendarEvent[];
    onSaveGuest?: () => void;
    onOpenDirectory?: () => void;
    icalFeeds?: IcalFeed[];
    isDirty?: boolean;
    isReadOnly?: boolean;
}

// Analytics Interfaces
export interface DashboardStats {
    totalRevenue: number;
    totalBookings: number;
    occupancyRate: number;
    avgNightlyRate: number;
    activeStays: number;
}

export interface RevenueData {
    month: string;
    revenue: number;
}

export interface DashboardFiltersProps {
    properties: Property[];
    selectedProperty: string;
    onPropertyChange: (id: string) => void;
    selectedYear: number;
    onYearChange: (year: number) => void;
}

export interface DashboardHeaderProps extends DashboardFiltersProps {
    userName?: string;
}

export interface StatsGridProps {
    stats: DashboardStats;
    loading?: boolean;
}

export interface RevenueChartProps {
    data: RevenueData[];
    year: number;
    loading?: boolean;
}

export interface RecentActivityProps {
    upcomingGuests: Guest[];
    loading?: boolean;
}

export interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
    bg?: string;
    border?: string;
    gradient?: string;
    iconBg?: string;
    iconColor?: string;
}

export interface ActivityItemProps {
    guest: Guest;
    onClick: () => void;
}

export interface QuickAction {
    label: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    href: string;
}

export interface UpcomingBookingsWidgetProps {
    bookings: Guest[];
    loading?: boolean;
}

export interface HeroBannerProps {
    userName: string;
    bookingsToday?: number;
    upcomingCount?: number;
}

export interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

export interface SidebarLayoutProps {
    children: React.ReactNode;
}

export interface CleaningTask {
    id: string;
    propertyId: string;
    title: string;
    room: string;
    isCompleted: boolean;
    createdAt: number;
}

export interface RoomSettings {
    roomOrder?: string[];
    roomTypes?: Record<string, string>; // Key: Room Name, Value: Category (e.g. 'Kitchen')
}

// Inventory Interfaces
export interface InventoryNeed {
    id: string;
    item: string;
    quantity: number;
    room: string;
    status: 'pending';
    createdAt: number;
    propertyId: string;
}

export interface InventoryLog {
    id: string;
    item: string;
    quantity: number;
    room: string;
    type: 'consumed' | 'restock';
    createdAt: number;
    propertyId: string;
}

export interface InventoryMasterItem {
    id: string;
    category: string;
    item: string;
    createdAt: number;
}

export interface InventoryState {
    needs: InventoryNeed[];
    logs: InventoryLog[];
    masterItems: InventoryMasterItem[];
    isInventoryLoading: boolean;
    setNeeds: (needs: InventoryNeed[]) => void;
    setLogs: (logs: InventoryLog[]) => void;
    setMasterItems: (items: InventoryMasterItem[]) => void;
    setIsInventoryLoading: (loading: boolean) => void;
}

export interface CleaningState {
    tasks: CleaningTask[];
    isCleaningLoading: boolean;
    setTasks: (tasks: CleaningTask[]) => void;
    setIsCleaningLoading: (loading: boolean) => void;
}

export interface PropertyState {
    properties: Property[];
    isPropertiesLoading: boolean;
    setProperties: (properties: Property[]) => void;
    setIsPropertiesLoading: (loading: boolean) => void;
}

export interface TemplateState {
    templates: Template[];
    isTemplatesLoading: boolean;
    setTemplates: (templates: Template[]) => void;
    setIsTemplatesLoading: (loading: boolean) => void;
}

export interface MaintenanceState {
    issues: MaintenanceIssue[];
    isIssuesLoading: boolean;
    setIssues: (issues: MaintenanceIssue[]) => void;
    setIsIssuesLoading: (loading: boolean) => void;
}

export interface UIState {
    selectedPropertyId: string;
    setSelectedPropertyId: (id: string) => void;
}

export interface GuestState {
    guests: Guest[];
    isGuestsLoading: boolean;
    setGuests: (guests: Guest[]) => void;
    setIsGuestsLoading: (loading: boolean) => void;
}

export interface ToastStore {
    toast: ToastState;
    showToast: (message: string, type?: 'success' | 'error') => void;
    hideToast: () => void;
}

export interface AppState extends InventoryState, CleaningState, UIState, PropertyState, TemplateState, MaintenanceState, GuestState, ToastStore { }