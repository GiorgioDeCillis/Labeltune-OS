import type { Metadata } from "next";
import { Geist, Geist_Mono, Rethink_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink-sans",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Labeltune OS | Enterprise Data Labeling Platform",
    template: "%s | Labeltune OS"
  },
  description: "Advanced data labeling and AI evaluation platform for enterprise teams. Manage projects, automated workflows, and quality metrics.",
  keywords: ["Data Labeling", "AI", "RLHF", "Annotation", "Machine Learning", "Enterprise"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rethinkSans.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
