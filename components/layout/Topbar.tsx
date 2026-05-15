import Link from "next/link";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { getUserRole } from "@/lib/auth";

export async function Topbar() {
  const role = await getUserRole();
  const roleHref = role === "driver" ? "/driver" : role === "rider" ? "/rider" : null;
  const roleLabel = role === "driver" ? "Driver" : role === "rider" ? "Rider" : null;

  return (
    <header className="sticky top-0 z-40 h-topbar border-b border-border bg-background/85 backdrop-blur-xl flex items-center px-6">
      <div className="flex w-full items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.2em] uppercase text-foreground transition-colors hover:text-accent"
        >
          Repairdash
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {roleHref && roleLabel ? (
            <Link
              className="px-4 py-2 rounded-md text-muted font-medium transition-all hover:text-foreground hover:bg-white/5"
              href={roleHref}
            >
              {roleLabel}
            </Link>
          ) : null}
          <AccountMenu />
        </nav>
      </div>
    </header>
  );
}
