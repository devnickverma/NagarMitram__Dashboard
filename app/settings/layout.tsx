import DashboardLayout from '@/components/Layout/DashboardLayout';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}