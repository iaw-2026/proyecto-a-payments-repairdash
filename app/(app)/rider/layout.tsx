import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RiderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let hasAccess = false;

  try {
    await getAuthUser("rider");
    hasAccess = true;
  } catch {
    hasAccess = false;
  }

  if (!hasAccess) {
    redirect("/dashboard");
  }

  return <main className="flex-1">{children}</main>;
}
