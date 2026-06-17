import Link from "next/link";

type SidebarProps = {
  items: Array<{ href: string; label: string }>;
};

export function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl">
      <div className="space-y-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/5">
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}