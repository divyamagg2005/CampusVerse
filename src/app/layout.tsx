import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import HeaderConditional from "@/components/HeaderConditional";

export const metadata: Metadata = {
  title: "CampusVerse",
  description: "a social media platform for college students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <AuthProvider>
            <HeaderConditional />
            {children}
          </AuthProvider>
      </body>
    </html>
  );
}
