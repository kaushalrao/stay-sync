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

interface CleaningCompletedEmailProps {
    propName: string;
    propId: string;
    completedAt: string;
    cleanedBy: string;
    summary: {
        total: number;
        completed: number;
    };
    roomSummary?: Record<string, { total: number; completed: number }>;
    remarks?: string;
    dashboardLink: string;
}

export const CleaningCompletedEmail = ({
    propName,
    propId,
    completedAt,
    cleanedBy,
    summary,
    roomSummary,
    remarks,
    dashboardLink,
}: CleaningCompletedEmailProps) => {
    const previewText = `Cleaning Completed: ${propName} is now ready for guests.`;

    return (
        <Html>
            <Preview>{previewText}</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                brand: "#111827",
                                brandAccent: "#10b981", // Emerald 500
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
                                StaySync Hospitality Service
                            </Text>
                        </Section>

                        {/* Main Card */}
                        <Section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                            {/* Status Banner */}
                            <Section className="bg-emerald-600 p-6 text-center">
                                <div className="inline-block px-3 py-1 bg-emerald-500 rounded-full text-white text-[12px] font-bold uppercase tracking-wider mb-2">
                                    Ready for Guest Check-in
                                </div>
                                <Heading className="text-white text-[20px] font-bold m-0 leading-tight">
                                    Cleaning Completed
                                </Heading>
                                <Text className="text-emerald-100 text-[14px] m-0 mt-1 font-medium">
                                    {completedAt}
                                </Text>
                            </Section>

                            {/* Property Info */}
                            <Section className="p-8 pb-4">
                                <Text className="text-gray-400 text-[11px] uppercase tracking-wider font-bold mb-2">Property Details</Text>
                                <Heading className="text-gray-900 text-[18px] font-bold m-0 mb-1 leading-tight">
                                    {propName}
                                </Heading>
                                <Text className="text-gray-500 text-[12px] m-0 mb-6 font-mono uppercase">
                                    ID: {propId}
                                </Text>

                                <Row className="mb-6">
                                    <Column className="w-[10%] align-top pt-1">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg">🧹</div>
                                    </Column>
                                    <Column className="w-[90%] pl-3">
                                        <Text className="text-gray-900 text-[14px] font-semibold m-0">
                                            Cleaned By
                                        </Text>
                                        <Text className="text-emerald-600 text-[16px] font-bold m-0">
                                            {cleanedBy}
                                        </Text>
                                    </Column>
                                </Row>

                                <Section className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <Text className="text-gray-400 text-[11px] uppercase tracking-wider font-bold mb-3">Overall Progress</Text>
                                    <Row>
                                        <Column>
                                            <Text className="text-gray-500 text-[13px] m-0">Total Tasks</Text>
                                            <Text className="text-gray-900 text-[18px] font-bold m-0">
                                                {summary.completed} / {summary.total}
                                            </Text>
                                        </Column>
                                        <Column className="text-right">
                                            <div className="inline-block h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${(summary.completed / (summary.total || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </Column>
                                    </Row>
                                </Section>
                            </Section>

                            {/* Details View (Room Breakdown) */}
                            {roomSummary && (
                                <Section className="px-8 pb-6">
                                    <Text className="text-gray-400 text-[11px] uppercase tracking-wider font-bold mb-4">Detailed Room Status</Text>
                                    <table className="w-full border-collapse">
                                        <tbody>
                                            {Object.entries(roomSummary).map(([room, stat]) => (
                                                <tr key={room} className="border-b border-gray-50 last:border-0">
                                                    <td className="py-3 text-[14px] text-gray-700 font-medium capitalize">
                                                        {room}
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${stat.completed === stat.total ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            {stat.completed}/{stat.total}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Section>
                            )}

                            {/* Remarks Section */}
                            {remarks && (
                                <Section className="px-8 pb-4">
                                    <Text className="text-gray-400 text-[11px] uppercase tracking-wider font-bold mb-2">Staff Remarks</Text>
                                    <div className="bg-gray-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                                        <Text className="text-gray-700 text-[14px] italic m-0">
                                            "{remarks}"
                                        </Text>
                                    </div>
                                </Section>
                            )}

                            <Hr className="border-gray-100 my-6 mx-8" />

                            {/* Action Area */}
                            <Section className="px-8 pb-8 text-center">
                                <Button
                                    className="bg-gray-900 text-white rounded-lg text-[14px] font-semibold no-underline text-center px-8 py-3 mx-auto block max-w-max shadow-sm hover:bg-gray-800 transition-colors"
                                    href={dashboardLink}
                                >
                                    View Cleaning Details
                                </Button>
                            </Section>

                        </Section>

                        {/* Footer Info */}
                        <Section className="mt-6 text-center">
                            <Text className="text-gray-400 text-[12px] m-0">
                                Automated notification for <span className="font-medium text-gray-500">{propName}</span>.
                            </Text>
                            <Text className="text-gray-300 text-[10px] mt-2 underline">
                                Property Management System Dashboard
                            </Text>
                        </Section>

                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default CleaningCompletedEmail;
