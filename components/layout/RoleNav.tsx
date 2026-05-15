import Link from "next/link";
import { getUserRole } from "@/lib/auth";

export async function RoleNav() {
  const role = await getUserRole();
  const roleHref = role === "driver" ? "/driver" : role === "rider" ? "/rider" : null;
  const roleLabel = role === "driver" ? "Driver" : role === "rider" ? "Rider" : null;

  if (!roleHref || !roleLabel) {
    return null;
  }

  return (
    <nav className="flex flex-wrap gap-2 text-sm text-slate-300">
      <Link className="rounded-full border border-white/10 px-4 py-2 transition hover:border-cyan-300/50 hover:text-white" href={roleHref}>
        {roleLabel}
      </Link>
    </nav>
  );
}
