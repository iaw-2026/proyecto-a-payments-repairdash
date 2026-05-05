import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";

export default async function DashboardPage() {
  const role = await getUserRole();

  if (role === "driver") {
    redirect("/driver");
  }

  if (role === "admin") {
    redirect("/admin");
  }

  if (role === "rider") {
    redirect("/rider");
  }

  redirect("/");
}