import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
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
    const previewText = `Upcoming Check-in: ${guestName} at ${propName}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Upcoming Guest Arrival</Heading>
                    <Text style={text}>
                        Hello, you have a confirmed booking starting tomorrow for <strong>{propName}</strong>.
                    </Text>
                    <Section style={box}>
                        <Heading as="h2" style={h2}>Booking Details</Heading>
                        <Hr style={hr} />
                        <Text style={paragraph}>
                            <strong>Guest:</strong> {guestName}
                        </Text>
                        <Text style={paragraph}>
                            <strong>Check-in:</strong> {checkInDate}
                        </Text>
                        <Text style={paragraph}>
                            <strong>Check-out:</strong> {checkOutDate}
                        </Text>
                        <Text style={paragraph}>
                            <strong>Guests:</strong> {numberOfGuests}
                        </Text>
                    </Section>

                    <Section style={btnContainer}>
                        <Button style={button} href={dashboardLink}>
                            View Booking in Dashboard
                        </Button>
                    </Section>

                    <Text style={footer}>
                        This is an automated notification from StaySync.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default GuestArrivalEmail;

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
};

const box = {
    padding: "0 48px",
};

const h1 = {
    color: "#333",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "30px 0",
};

const h2 = {
    color: "#333",
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0 0 10px",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0",
};

const text = {
    color: "#525f7f",
    fontSize: "16px",
    lineHeight: "24px",
    textAlign: "left" as const,
    padding: "0 48px",
};

const paragraph = {
    color: "#525f7f",
    fontSize: "16px",
    lineHeight: "24px",
    textAlign: "left" as const,
};

const btnContainer = {
    textAlign: "center" as const,
    marginTop: "32px",
};

const button = {
    backgroundColor: "#000000",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    width: "100%",
    padding: "12px",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    marginTop: "48px",
    textAlign: "center" as const,
};
