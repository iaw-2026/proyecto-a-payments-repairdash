import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";

export default async function DashboardPage() {
  const role = await getUserRole();

  if (role === "driver") {
    redirect("/driver");
  }

  if (role === "rider") {
    redirect("/rider");
  }

  if (role === "adminPayments") {
    redirect("/admin");
  }

  redirect("/");
}
