import {
    Body,
    Button,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Row,
    Section,
    Text,
    Tailwind
} from "@react-email/components";
import * as React from "react";

interface BookingNotificationEmailProps {
    type: 'new' | 'cancelled' | 'updated';
    guestName: string;
    propName: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    nights: number;
    totalAmount?: string; // Optional for cancellations if not needed
    dashboardLink: string;
}

export const BookingNotificationEmail = ({
    type = 'new',
    guestName,
    propName,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    nights,
    totalAmount,
    dashboardLink,
}: BookingNotificationEmailProps) => {
    const isNew = type === 'new';
    const isUpdated = type === 'updated';

    let previewText = '';
    if (isNew) previewText = `New Booking: ${guestName} at ${propName}`;
    else if (isUpdated) previewText = `Booking Updated: ${guestName} at ${propName}`;
    else previewText = `Booking Cancelled: ${guestName} at ${propName}`;

    // Theme colors
    const theme = {
        main: isNew ? '#10B981' : (isUpdated ? '#3B82F6' : '#F43F5E'), // emerald-500 : blue-500 : rose-500
        bg: isNew ? '#ecfdf5' : (isUpdated ? '#eff6ff' : '#fff1f2'),     // emerald-50 : blue-50 : rose-50
        border: isNew ? '#d1fae5' : (isUpdated ? '#dbeafe' : '#ffe4e6'), // emerald-100 : blue-100 : rose-100
        text: isNew ? '#065f46' : (isUpdated ? '#1e3a8a' : '#9f1239'),   // emerald-800 : blue-900 : rose-800
        darkText: isNew ? '#064e3b' : (isUpdated ? '#172554' : '#881337'), // emerald-900 : blue-950 : rose-900
    };

    const getHeaderText = () => {
        if (isNew) return 'New Booking';
        if (isUpdated) return 'Booking Updated';
        return 'Cancelled';
    };

    const getIcon = () => {
        if (isNew) return '🎉';
        if (isUpdated) return '📝';
        return '❌';
    };

    return (
        <Html>
            <Preview>{previewText}</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                gray: {
                                    50: "#f9fafb",
                                    100: "#f3f4f6",
                                    200: "#e5e7eb",
                                    300: "#d1d5db",
                                    400: "#9ca3af",
                                    500: "#6b7280",
                                    800: "#1f2937",
                                    900: "#111827",
                                },
                            },
                        },
                    },
                }}
            >
                <Head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                </Head>
                <Body className="bg-white font-sans my-auto mx-auto px-2">
                    <Container className="mx-auto my-[20px] max-w-[480px] w-full">

                        {/* Header Branding */}
                        <Section className="mb-6">
                            <Text className="text-gray-400 font-bold tracking-widest uppercase text-xs text-center m-0">
                                StaySync Notification
                            </Text>
                        </Section>

                        {/* Main Card */}
                        <Section className="border border-solid border-gray-200 rounded-lg overflow-hidden shrink-0 w-full">

                            {/* Colored Banner */}
                            <Row>
                                <Column className="pt-6 pb-6 text-center" style={{ backgroundColor: theme.main, width: '100%' }}>
                                    <Heading className="text-white text-[20px] font-bold m-0 leading-tight">
                                        {getHeaderText()}
                                    </Heading>
                                    <Text className="text-white text-[14px] m-0 mt-1 opacity-90 font-medium">
                                        {propName}
                                    </Text>
                                </Column>
                            </Row>

                            {/* Guest Info Section */}
                            <Section className="p-8 pb-4 bg-white">
                                <Text className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-3">Guest Details</Text>

                                <Row className="mb-6">
                                    <Column className="w-[48px] align-middle">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 border border-solid border-gray-100 flex items-center justify-center">
                                            <div className="text-lg text-center leading-10">{getIcon()}</div>
                                        </div>
                                    </Column>
                                    <Column className="pl-3 align-middle">
                                        <Text className="text-gray-900 text-[16px] font-bold m-0 leading-snug">
                                            {guestName}
                                        </Text>
                                        <Text className="text-gray-500 text-[13px] m-0 leading-snug">
                                            {numberOfGuests} {numberOfGuests === 1 ? 'Guest' : 'Guests'} • {nights} Nights
                                        </Text>
                                    </Column>
                                </Row>

                                {totalAmount && (
                                    <Section className="mb-6">
                                        <Row>
                                            <Column
                                                className="rounded-lg p-4 border border-solid"
                                                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                                            >
                                                <Text className="text-[10px] font-bold uppercase tracking-wider m-0 mb-1 opacity-70" style={{ color: theme.darkText }}>
                                                    {isNew ? 'Total Payout' : (isUpdated ? 'New Total' : 'Amount')}
                                                </Text>
                                                <Text className="text-[24px] font-bold m-0 tracking-tight" style={{ color: theme.text }}>
                                                    {totalAmount}
                                                </Text>
                                            </Column>
                                        </Row>
                                    </Section>
                                )}
                            </Section>

                            {/* Timeline - Simplified for Email Clients */}
                            <Section className="px-8 pb-8 bg-white">
                                <Row>
                                    {/* Timeline Line Column */}
                                    <Column className="w-[20px] align-top">
                                        <table border={0} cellPadding={0} cellSpacing={0} width="100%">
                                            <tr>
                                                <td align="center" style={{ paddingBottom: '4px' }}>
                                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: theme.main }} />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center">
                                                    <div style={{ width: '2px', height: '40px', backgroundColor: '#e5e7eb' }} />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center" style={{ paddingTop: '4px' }}>
                                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#d1d5db' }} />
                                                </td>
                                            </tr>
                                        </table>
                                    </Column>

                                    {/* Timeline Text Column */}
                                    <Column className="align-top pl-4">
                                        {/* Check-in Group */}
                                        <div style={{ height: '34px' }}>
                                            <Text className="text-gray-400 text-[10px] uppercase font-bold m-0 tracking-wider">Check-in</Text>
                                            <Text className="text-gray-900 text-[14px] font-semibold m-0">{checkInDate}</Text>
                                        </div>

                                        {/* Spacer to match line height */}
                                        <div style={{ height: '24px' }} />

                                        {/* Check-out Group */}
                                        <div>
                                            <Text className="text-gray-400 text-[10px] uppercase font-bold m-0 tracking-wider">Check-out</Text>
                                            <Text className="text-gray-900 text-[14px] font-semibold m-0">{checkOutDate}</Text>
                                        </div>
                                    </Column>
                                </Row>
                            </Section>

                            <Hr className="border-gray-100 my-0" />

                            {/* Action Button */}
                            <Section className="p-6 bg-gray-50 text-center">
                                <Button
                                    className="bg-gray-900 text-white rounded-md text-[14px] font-semibold no-underline text-center px-6 py-3 block shadow-sm w-full sm:w-auto"
                                    href={dashboardLink}
                                >
                                    View Booking Details
                                </Button>
                            </Section>

                        </Section>

                        {/* Footer */}
                        <Section className="mt-6 text-center">
                            <Text className="text-gray-400 text-[12px] m-0">
                                Notification for <span className="font-medium text-gray-500">{propName}</span>
                            </Text>
                        </Section>

                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default BookingNotificationEmail;
