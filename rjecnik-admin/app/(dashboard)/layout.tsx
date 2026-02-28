import SidebarLayout from './components/SidebarLayout';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
