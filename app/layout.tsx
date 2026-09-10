import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import Link from "next/link";
import { CategoryLink } from "@/components/category-link";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "AtCoder Categories", template: "%s · AtCoder Categories" },
  description:
    "Practice AtCoder problems by topic and track your progress, without seeing every tag a problem carries.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-20 h-14 border-b border-hairline bg-canvas/85 backdrop-blur">
          <nav className="shell flex h-full items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 text-sm font-medium tracking-[0.2px] text-ink">
              <Logo />
              AtCoder Categories
            </Link>
            <div className="ml-auto flex items-center gap-1 text-sm font-medium tracking-[0.2px]">
              <CategoryLink href="/practice" className="rounded-md px-3 py-1.5 text-body hover:text-ink">
                Practice ladder
              </CategoryLink>
              <a
                href="https://atcoder.jp"
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-md px-3 py-1.5 text-body hover:text-ink sm:block"
              >
                AtCoder ↗
              </a>
            </div>
          </nav>
        </header>

        <MotionProvider>
          <div className="flex-1">{children}</div>
        </MotionProvider>

        <footer className="border-t border-hairline">
          <div className="shell flex flex-col gap-2 py-10 text-[13px] text-mute sm:flex-row sm:justify-between">
            <p>
              Categories by{" "}
              <a href="https://atcoder-categories.github.io" className="text-body hover:text-ink">
                atcoder-categories
              </a>
              . Difficulty and submissions from{" "}
              <a href="https://kenkoooo.com/atcoder/" className="text-body hover:text-ink">
                AtCoder Problems
              </a>
              .
            </p>
            <p className="text-ash">Not affiliated with AtCoder Inc.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

function Logo() {
  return (
    <span className="grid size-6 place-items-center rounded-sm border border-hairline bg-card">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M1 3h10M1 6h6M1 9h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}
