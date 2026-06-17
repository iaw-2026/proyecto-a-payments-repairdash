import Link from "next/link";
import { RoleNav } from "./RoleNav";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-[0.24em] uppercase text-white">
          Repairdash
        </Link>
        <RoleNav />
      </div>
    </header>
  );
}
