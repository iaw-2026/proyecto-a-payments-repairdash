import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AppToaster } from "@/components/ui/AppToaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repairdash Payments",
  description: "Sistema de pagos para reparaciones - vista rider y driver",
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
