import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import { Footer } from "@/components/footer";
import { MotionProvider } from "@/components/motion-provider";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const openRunde = localFont({
  variable: "--font-open-runde",
  src: [
    { path: "../public/fonts/OpenRunde-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/OpenRunde-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/OpenRunde-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/OpenRunde-Bold.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "AtCat", template: "%s | AtCat" },
  description:
    "Practice AtCoder problems by topic and track your progress, without seeing every tag a problem carries.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${openRunde.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <MotionProvider>
            <Navbar />
            <div className="flex flex-1 flex-col">{children}</div>
            <Footer />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
