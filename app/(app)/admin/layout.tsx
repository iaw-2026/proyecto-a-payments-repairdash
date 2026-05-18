import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let hasAccess = false;

  try {
    await getAuthUser("adminPayments");
    hasAccess = true;
  } catch {
    hasAccess = false;
  }

  if (!hasAccess) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-var(--spacing-topbar))] flex-col lg:flex-row">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
