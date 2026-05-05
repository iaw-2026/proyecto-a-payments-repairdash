import { DriverSidebar } from "@/components/layout/DriverSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function DriverLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-[calc(100vh-var(--spacing-topbar))]">
      <DriverSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 lg:py-10 pb-24 lg:pb-10">
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}
