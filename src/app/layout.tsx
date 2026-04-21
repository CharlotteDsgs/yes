import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yes — La liste de mariage qui vous ressemble",
  description:
    "Créez votre liste de mariage personnalisée. Design élégant, cagnotte en ligne, et une page unique pour vos invités.",
  keywords: ["liste de mariage", "cagnotte mariage", "site de mariage", "liste cadeau mariage"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
