import DashboardLayout from '@/components/Layout/DashboardLayout';

export default function IssuesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}