"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Topics", href: "/#topics" },
  { label: "Practice", href: "/practice" },
];

const ATCODER_URL = "https://atcoder.jp";

const pill = "rounded-full border-apple bg-neutral-900";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const morphSpring = { type: "spring", stiffness: 250, damping: 24 } as const;
  const popSpring = { type: "spring", stiffness: 320, damping: 15 } as const;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const spring = { type: "spring", stiffness: 300, damping: 30 } as const;
  const animateLayout = !reduceMotion;
  const isActive = (href: string) => href.split("#")[0] === pathname && !href.includes("#");

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-5 sm:px-6 md:top-7.5">
      <motion.nav
        layout={animateLayout}
        transition={spring}
        className={cn(
          "relative z-10 flex w-full max-w-3xl items-center justify-between",
          scrolled && "md:w-auto md:gap-2",
        )}
      >
        <motion.div layout={animateLayout} transition={spring} className="pointer-events-auto">
          <Link href="/" className={cn(pill, "flex h-12 items-center gap-2 px-4")}>
            <Logo />
            <span className="font-runde text-sm font-semibold text-white min-[400px]:text-base">
              AtCat
            </span>
          </Link>
        </motion.div>

        <motion.div
          layout={animateLayout}
          transition={spring}
          className={cn(pill, "pointer-events-auto hidden h-12 items-center px-2 md:flex")}
        >
          {LINKS.map((link, i) => (
            <Fragment key={link.href}>
              {i > 0 && <span className="h-4 w-px bg-white/15" />}
              <Link
                href={link.href}
                className={cn(
                  "px-3.5 text-sm",
                  isActive(link.href)
                    ? "text-white"
                    : "text-white/60 transition-colors duration-150 ease-out hover:text-white",
                )}
              >
                {link.label}
              </Link>
            </Fragment>
          ))}
        </motion.div>

        <motion.div
          layout={animateLayout}
          transition={spring}
          className="pointer-events-auto hidden items-center gap-2 md:flex"
        >
          <a
            href={ATCODER_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(
              pill,
              "flex h-12 items-center px-4 text-sm text-white/80 transition-colors duration-200 ease-out hover:bg-neutral-800 hover:text-white",
            )}
          >
            atcoder.jp
            <span aria-hidden className="ml-1.5 text-white/40">
              ↗
            </span>
          </a>
          <ThemeToggle
            className={cn(
              pill,
              "flex h-12 w-12 items-center justify-center p-0 text-white/80 hover:bg-neutral-800 hover:text-white [&_svg]:h-6 [&_svg]:w-6",
            )}
          />
        </motion.div>

        <motion.button
          layout={animateLayout}
          transition={spring}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className={cn(pill, "pointer-events-auto flex h-12 w-12 items-center justify-center md:hidden")}
        >
          <span className="flex h-4 w-5 flex-col justify-between">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={false}
                animate={{
                  rotate: menuOpen ? (i === 0 ? 45 : i === 2 ? -45 : 0) : 0,
                  y: menuOpen ? (i === 0 ? 7 : i === 2 ? -7 : 0) : 0,
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }}
                transition={reduceMotion ? { duration: 0 } : morphSpring}
                className="h-0.5 w-full bg-white"
              />
            ))}
          </span>
        </motion.button>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
            className="pointer-events-auto fixed inset-0 z-0 bg-neutral-950/85 backdrop-blur-2xl md:hidden"
          >
            <div className="flex h-full flex-col items-center justify-center gap-7 px-6">
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                  transition={reduceMotion ? { duration: 0 } : { ...popSpring, delay: 0.06 + i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "font-runde text-3xl font-semibold transition-colors duration-150 ease-out",
                      isActive(link.href) ? "text-white" : "text-white/50",
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                transition={
                  reduceMotion ? { duration: 0 } : { ...popSpring, delay: 0.06 + LINKS.length * 0.06 }
                }
                className="mt-3 flex items-center gap-2"
              >
                <a
                  href={ATCODER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(pill, "flex h-12 items-center px-5 text-sm text-white")}
                >
                  atcoder.jp ↗
                </a>
                <ThemeToggle
                  className={cn(
                    pill,
                    "flex h-12 w-12 items-center justify-center p-0 text-white/80 [&_svg]:h-6 [&_svg]:w-6",
                  )}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
