import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AppToaster } from "@/components/ui/AppToaster";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://payments.repairdash.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Repairdash Payments",
    template: "%s | Repairdash Payments",
  },
  description:
    "Sistema de pagos para reparaciones, liquidaciones y retiros.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Repairdash Payments",
    description:
      "Sistema seguro para gestionar pagos, balances, liquidaciones y retiros de reparaciones.",
    url: "/",
    siteName: "Repairdash Payments",
    locale: "es_AR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signInFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/"
    >
      <html lang="es" className="h-full antialiased">
        <body className="min-h-full flex flex-col">
          {children}
          <AppToaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
