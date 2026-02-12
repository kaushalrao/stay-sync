import { SidebarLayout } from '@components/layout/SidebarLayout';

export default function RoutesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SidebarLayout>{children}</SidebarLayout>;
}
