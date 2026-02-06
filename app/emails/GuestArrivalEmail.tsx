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

interface GuestArrivalEmailProps {
    guestName: string;
    propName: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    dashboardLink: string;
}

export const GuestArrivalEmail = ({
    guestName,
    propName,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    dashboardLink,
}: GuestArrivalEmailProps) => {
    const previewText = `Reminder: ${guestName} checks in at ${propName} tomorrow.`;

    return (
        <Html>
            <Preview>{previewText}</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                brand: "#111827",
                                brandAccent: "#4F46E5",
                                gray: {
                                    50: "#f9fafb",
                                    100: "#f3f4f6",
                                    200: "#e5e7eb",
                                    300: "#d1d5db",
                                    400: "#9ca3af",
                                    500: "#6b7280",
                                    700: "#374151",
                                    800: "#1f2937",
                                    900: "#111827",
                                },
                            },
                        },
                    },
                }}
            >
                <Head />
                <Body className="bg-gray-100 font-sans my-auto mx-auto px-2">
                    <Container className="mx-auto my-[40px] max-w-[480px]">

                        {/* Branding / Header */}
                        <Section className="mb-6 px-2">
                            <Text className="text-gray-400 font-bold tracking-widest uppercase text-xs text-center m-0">
                                StaySync Notification
                            </Text>
                        </Section>

                        {/* Main Card */}
                        <Section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                            {/* Alert Banner */}
                            <Section className="bg-indigo-600 p-6 text-center">
                                <Heading className="text-white text-[20px] font-bold m-0 leading-tight">
                                    Check-in Tomorrow
                                </Heading>
                                <Text className="text-indigo-100 text-[14px] m-0 mt-1 font-medium">
                                    {checkInDate}
                                </Text>
                            </Section>

                            {/* Property & Guest Info */}
                            <Section className="p-8 pb-4">
                                <Text className="text-gray-400 text-[11px] uppercase tracking-wider font-bold mb-2">Property</Text>
                                <Heading className="text-gray-900 text-[18px] font-bold m-0 mb-6 leading-tight">
                                    {propName}
                                </Heading>

                                <Row className="mb-2">
                                    <Column className="w-[10%] align-top pt-1">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg">👤</div>
                                    </Column>
                                    <Column className="w-[90%] pl-3">
                                        <Text className="text-gray-900 text-[16px] font-semibold m-0">
                                            {guestName}
                                        </Text>
                                        <Text className="text-gray-500 text-[14px] m-0">
                                            {numberOfGuests} {numberOfGuests === 1 ? 'Guest' : 'Guests'}
                                        </Text>
                                    </Column>
                                </Row>
                            </Section>

                            {/* Timeline Visual - Strict Center Alignment */}
                            <Section className="px-8 pb-4">
                                <Row>
                                    <Column className="w-[24px] align-top pt-1">
                                        {/* Container for the graphics: Fixed width 12px centered in 24px column */}
                                        <div className="w-[12px] mx-auto flex flex-col items-center">
                                            {/* Top Dot */}
                                            <div className="w-3 h-3 rounded-full bg-indigo-600 border-2 border-white ring-1 ring-indigo-100 z-10" />
                                            {/* Connecting Line */}
                                            <div className="w-[2px] bg-indigo-100 h-[64px]" />
                                        </div>
                                    </Column>
                                    <Column className="align-top pb-8 pl-4">
                                        <Text className="text-gray-400 text-[11px] uppercase font-bold m-0 mb-1 tracking-wider">Check-in</Text>
                                        <Text className="text-gray-900 text-[16px] font-semibold m-0 leading-tight">{checkInDate}</Text>
                                    </Column>
                                </Row>

                                <Row>
                                    <Column className="w-[24px] align-top">
                                        <div className="w-[12px] mx-auto flex flex-col items-center">
                                            {/* Bottom Dot - Negative margin to pull it up over the line end if needed, or just flow naturally */}
                                            <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white z-10" />
                                        </div>
                                    </Column>
                                    <Column className="align-top pl-4">
                                        <Text className="text-gray-400 text-[11px] uppercase font-bold m-0 mb-1 tracking-wider">Check-out</Text>
                                        <Text className="text-gray-900 text-[16px] font-semibold m-0 leading-tight">{checkOutDate}</Text>
                                    </Column>
                                </Row>
                            </Section>

                            <Hr className="border-gray-100 my-6 mx-8" />

                            {/* Action Area */}
                            <Section className="px-8 pb-8 text-center">
                                <Button
                                    className="bg-gray-900 text-white rounded-lg text-[14px] font-semibold no-underline text-center px-8 py-3 mx-auto block max-w-max shadow-sm hover:bg-gray-800 transition-colors"
                                    href={dashboardLink}
                                >
                                    Open Booking Dashboard
                                </Button>
                            </Section>

                        </Section>

                        {/* Footer Info */}
                        <Section className="mt-6 text-center">
                            <Text className="text-gray-400 text-[12px] m-0">
                                Sent to property host for <span className="font-medium text-gray-500">{propName}</span>.
                            </Text>
                        </Section>

                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default GuestArrivalEmail;
