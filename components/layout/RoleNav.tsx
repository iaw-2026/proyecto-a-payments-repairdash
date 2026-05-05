import Link from "next/link";

export function RoleNav() {
  return (
    <nav className="flex flex-wrap gap-2 text-sm text-slate-300">
      <Link className="rounded-full border border-white/10 px-4 py-2 transition hover:border-cyan-300/50 hover:text-white" href="/rider">
        Rider
      </Link>
      <Link className="rounded-full border border-white/10 px-4 py-2 transition hover:border-amber-300/50 hover:text-white" href="/driver">
        Driver
      </Link>
      <Link className="rounded-full border border-white/10 px-4 py-2 transition hover:border-white/30 hover:text-white" href="/admin">
        Admin
      </Link>
    </nav>
  );
}