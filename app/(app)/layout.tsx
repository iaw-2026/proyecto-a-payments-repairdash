import { Topbar } from "@/components/layout/Topbar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Topbar />
      <div className="flex-1">{children}</div>
    </>
  );
}
