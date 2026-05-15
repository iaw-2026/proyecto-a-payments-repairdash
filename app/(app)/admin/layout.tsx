import { getAuthUser } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    await getAuthUser("admin");
  } catch {
    notFound();
  }

  return children;
}
