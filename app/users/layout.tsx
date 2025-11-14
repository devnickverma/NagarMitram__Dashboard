import DashboardLayout from '@/components/Layout/DashboardLayout';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}