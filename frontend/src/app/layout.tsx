import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteAmplify — SEO + KI Visibility Booster",
  description: "Analysiere deine Website, finde Content-Lücken und generiere passende Unterseiten mit KI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
