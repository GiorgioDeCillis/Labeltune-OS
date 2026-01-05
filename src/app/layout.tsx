import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Rethink_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { CursorBorderEffect } from "@/components/CursorBorderEffect";

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
          <CursorBorderEffect />
          {children}
        </ThemeProvider>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "uwu6bn2ish");
          `}
        </Script>
      </body>
    </html>
  );
}
