import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repairdash Payments",
  description: "Sistema de pagos para reparaciones — vista rider y driver",
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#3E1A55",
              color: "#FFFFFF",
              border: "1px solid rgba(245, 0, 241, 0.4)",
              borderRadius: "16px",
              padding: "20px 28px",
              fontSize: "16px",
              maxWidth: "500px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(245, 0, 241, 0.1)",
            },
          }}
        />
      </body>
    </html>
  );
}
