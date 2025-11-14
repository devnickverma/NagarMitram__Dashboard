import DashboardLayout from '@/components/Layout/DashboardLayout';

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}