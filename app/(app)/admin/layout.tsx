import { getAuthUser } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/transactions", label: "Transacciones" },
  { href: "/admin/balances", label: "Balances" },
  { href: "/admin/liquidations", label: "Liquidaciones" },
  { href: "/admin/disputes", label: "Disputas" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    await getAuthUser("adminPayments");
  } catch {
    notFound();
  }

  return (
    <>
      <nav className="border-b border-white/10 bg-slate-950/50 px-6 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-2 text-sm text-slate-300">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </>
  );
}
