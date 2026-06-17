import { DriverSidebar } from "@/components/layout/DriverSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DriverLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let hasAccess = false;

  try {
    await getAuthUser("driver");
    hasAccess = true;
  } catch {
    hasAccess = false;
  }

  if (!hasAccess) {
    redirect("/dashboard");
  }

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
