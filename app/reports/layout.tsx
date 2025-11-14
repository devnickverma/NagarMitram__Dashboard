import DashboardLayout from '@/components/Layout/DashboardLayout';

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}