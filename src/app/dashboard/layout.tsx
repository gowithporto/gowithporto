import DashboardCTA from "@/components/dashboard/DashboardCTA";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-12">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <main>{children}</main>
      </div>
      <DashboardCTA />
    </div>
  );
}
