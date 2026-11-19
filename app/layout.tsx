import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "DERSHANE | Özel Öğretim Kursu & Akademik Yönetim Sistemi",
  description:
    "Uluslararası standartlarda bireysel akademik mentorluk, veri odaklı deneme analizi ve yeni nesil eğitim yönetimi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F8F7F3] text-[#252A32] selection:bg-[#203B5C]/15 selection:text-[#203B5C]">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
