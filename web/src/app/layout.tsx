import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { AuthClienteProvider } from "@/lib/auth-cliente";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Conejo Aquatics — Peces, plantas y equipo para tu acuario",
  description:
    "Acuario en Costa Rica con venta al detalle y al por mayor: peces, plantas acuáticas, alimento y equipo. Retiro en tienda.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-abyss-900">
        <AuthClienteProvider>{children}</AuthClienteProvider>
      </body>
    </html>
  );
}
