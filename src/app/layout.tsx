import type { Metadata } from "next";
import NavbarWrapper from "@/components/home/NavbarWrapper";
import { Cormorant_Garamond, Cormorant_Infant, Jost, Fredoka, Anton, Playfair_Display, Montserrat, Dancing_Script, Ballet, Birthstone, Great_Vibes, Herr_Von_Muellerhoff, Allura, Pinyon_Script, Cherry_Bomb_One } from "next/font/google";
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

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dancing = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const ballet = Ballet({ variable: "--font-ballet", subsets: ["latin"], display: "swap" });
const birthstone = Birthstone({ variable: "--font-birthstone", subsets: ["latin"], weight: ["400"], display: "swap" });
const greatVibes = Great_Vibes({ variable: "--font-great-vibes", subsets: ["latin"], weight: ["400"], display: "swap" });
const herrVon = Herr_Von_Muellerhoff({ variable: "--font-herr", subsets: ["latin"], weight: ["400"], display: "swap" });
const allura = Allura({ variable: "--font-allura", subsets: ["latin"], weight: ["400"], display: "swap" });
const pinyonScript = Pinyon_Script({ variable: "--font-pinyon", subsets: ["latin"], weight: ["400"], display: "swap" });
const cormorantInfant = Cormorant_Infant({ variable: "--font-cormorant-infant", subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"], display: "swap" });
const cherryBomb = Cherry_Bomb_One({ variable: "--font-bagel", subsets: ["latin"], weight: ["400"], display: "swap" });

export const metadata: Metadata = {
  title: "Wedy — La liste de mariage qui vous ressemble",
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
    <html lang="fr" className={`${cormorant.variable} ${cormorantInfant.variable} ${jost.variable} ${fredoka.variable} ${anton.variable} ${playfair.variable} ${montserrat.variable} ${dancing.variable} ${ballet.variable} ${birthstone.variable} ${greatVibes.variable} ${herrVon.variable} ${allura.variable} ${pinyonScript.variable} ${cherryBomb.variable}`}>
      <body className="min-h-full flex flex-col">
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}
