import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { WhatsAppFloatButton } from "@/components/WhatsAppFloatButton";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Consulte",
  description: "Busca de rede médica credenciada Amil em Itabirito/MG",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <WhatsAppFloatButton />
      </body>
    </html>
  );
}
