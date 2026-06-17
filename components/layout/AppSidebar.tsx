"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type AppSidebarItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

type AppSidebarProps = {
  homeHref: string;
  title: string;
  items: AppSidebarItem[];
  mobile?: "stacked" | "hidden";
};

export function AppSidebar({
  homeHref,
  title,
  items,
  mobile = "stacked",
}: AppSidebarProps) {
  const pathname = usePathname();
  const mobileClass = mobile === "hidden" ? "hidden lg:flex" : "flex";

  return (
    <aside
      className={`${mobileClass} shrink-0 flex-col border-b border-border bg-[var(--color-sidebar)] lg:min-h-[calc(100vh-var(--spacing-topbar))] lg:w-sidebar lg:border-b-0 lg:border-r`}
    >
      <div className="flex h-topbar items-center border-b border-border px-6">
        <Link
          href={homeHref}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground"
        >
          {title}
        </Link>
      </div>

      <nav className="flex gap-2 overflow-x-auto p-4 lg:block lg:space-y-1 lg:overflow-visible">
        {items.map((item) => {
          const isActive =
            item.href === homeHref
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-max items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 lg:min-w-0 ${
                isActive
                  ? "bg-accent-subtle text-accent shadow-[inset_0_0_0_1px_rgba(245,0,241,0.15)]"
                  : "text-muted hover:bg-white/5 hover:text-secondary"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
