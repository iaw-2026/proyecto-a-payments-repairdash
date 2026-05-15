import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RiderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    await getAuthUser("rider");
  } catch {
    redirect("/dashboard");
  }

  return children;
}
