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

interface GuestCheckoutEmailProps {
    guestName: string;
    propName: string;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: number;
    advancePaid: number;
    dashboardLink: string;
}

export const GuestCheckoutEmail = ({
    guestName,
    propName,
    checkInDate,
    checkOutDate,
    totalAmount = 0,
    advancePaid = 0,
    dashboardLink,
}: GuestCheckoutEmailProps) => {
    const balanceDue = totalAmount - advancePaid;
    // Format amounts in INR
    const formatINR = (amount: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    const balanceStr = formatINR(balanceDue);
    const totalStr = formatINR(totalAmount);
    const advanceStr = formatINR(advancePaid);

    const previewText = balanceDue > 0
        ? `Action Required: ${guestName} checks out today. Balance: ${balanceStr}`
        : `${guestName} checks out today. All payments settled.`;

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

                        {/* Branding */}
                        <Section className="mb-6 px-2">
                            <Text className="text-gray-400 font-bold tracking-widest uppercase text-xs text-center m-0">
                                StaySync Notification
                            </Text>
                        </Section>

                        {/* Main Card */}
                        <Section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                            {/* Alert Banner - Amber for "Action Required" / Money */}
                            <Section className="bg-amber-600 p-6 text-center">
                                <Heading className="text-white text-[20px] font-bold m-0 leading-tight">
                                    Checkout Today
                                </Heading>
                                <Text className="text-amber-100 text-[14px] m-0 mt-1 font-medium">
                                    {checkOutDate}
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
                                    </Column>
                                </Row>

                                <Section className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-2 mb-4 w-full">
                                    <Row>
                                        <Column className="w-1/2 align-top pr-2">
                                            <Text className="text-gray-500 text-[10px] uppercase tracking-wider font-bold m-0 mb-1">Check-in</Text>
                                            <Text className="text-gray-900 text-[14px] font-semibold m-0">{checkInDate}</Text>
                                        </Column>
                                        <Column className="w-1/2 align-top pl-2">
                                            <Text className="text-gray-500 text-[10px] uppercase tracking-wider font-bold m-0 mb-1">Check-out</Text>
                                            <Text className="text-gray-900 text-[14px] font-semibold m-0">{checkOutDate}</Text>
                                        </Column>
                                    </Row>
                                </Section>
                            </Section>

                            <Hr className="border-gray-100 my-1 w-[90%] mx-auto" />

                            {/* Payment Summary */}
                            <Section className="p-8 pt-4">
                                <Text className="text-gray-400 text-[11px] uppercase tracking-wider font-bold mb-4">Payment Summary</Text>

                                <Row className="mb-3">
                                    <Column>
                                        <Text className="text-gray-500 text-[14px] m-0">Total Amount</Text>
                                    </Column>
                                    <Column align="right">
                                        <Text className="text-gray-900 text-[14px] font-medium m-0">{totalStr}</Text>
                                    </Column>
                                </Row>

                                <Row className="mb-3">
                                    <Column>
                                        <Text className="text-gray-500 text-[14px] m-0">Advance Paid</Text>
                                    </Column>
                                    <Column align="right">
                                        <Text className="text-green-600 text-[14px] font-medium m-0">-{advanceStr}</Text>
                                    </Column>
                                </Row>

                                <Hr className="border-gray-200 my-3 border-dashed" />

                                {balanceDue > 0 ? (
                                    <Row>
                                        <Column>
                                            <Text className="text-gray-900 text-[15px] font-bold m-0">Balance Due</Text>
                                        </Column>
                                        <Column align="right">
                                            <Text className="text-red-600 text-[18px] font-bold m-0">
                                                {balanceStr}
                                            </Text>
                                        </Column>
                                    </Row>
                                ) : (
                                    <Row>
                                        <Column align="center">
                                            <Text className="text-green-600 text-[16px] font-bold m-0">
                                                ✅ All Settled!
                                            </Text>
                                            <Text className="text-gray-400 text-[12px] m-0 mt-1">
                                                No payments pending.
                                            </Text>
                                        </Column>
                                    </Row>
                                )}
                            </Section>

                            {/* Action Area */}
                            <Section className="px-8 pb-8 text-center">
                                <Button
                                    className="bg-gray-900 text-white rounded-lg text-[14px] font-semibold no-underline text-center px-8 py-3 mx-auto block max-w-max shadow-sm hover:bg-gray-800 transition-colors"
                                    href={dashboardLink}
                                >
                                    {balanceDue > 0 ? "Collect Payment & Complete" : "View Stay Details"}
                                </Button>
                            </Section>

                        </Section>

                        {/* Footer Info */}
                        <Section className="mt-6 text-center">
                            <Text className="text-gray-400 text-[12px] m-0">
                                Please ensure all payments are collected before guest departure.
                            </Text>
                        </Section>

                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default GuestCheckoutEmail;
