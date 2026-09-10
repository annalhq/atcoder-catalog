import { Fragment } from "react";
import Link from "next/link";
import FluidWave from "./FluidWave";
import { Logo } from "./logo";

type FooterLink = { label: string; href: string; external?: boolean };

const LINKS: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "Topics", href: "/#topics" },
  { label: "Practice", href: "/practice" },
];

const HOVER = "transition-colors duration-150 ease-out hover:text-black dark:hover:text-white";
const MUTED = "text-black/50 dark:text-white/50";

function NavLink({ label, href, external }: FooterLink) {
  const className = `w-fit text-base sm:text-lg ${MUTED} ${HOVER}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-white text-black dark:bg-black dark:text-white">
      <FluidWave />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white to-transparent dark:from-black" />

      <div className="relative mx-auto flex min-h-[min(40svh,50rem)] w-full max-w-[96rem] flex-col px-6 pt-10 sm:min-h-[min(85svh,50rem)] sm:px-10 sm:pt-24 md:pt-32">
        <div className="h-px w-full bg-black/10 dark:bg-white/10" />

        <div className="flex flex-wrap items-center justify-between gap-6 py-8">
          <Link href="/" className="flex h-fit w-fit items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="font-runde text-2xl font-bold tracking-tight">AtCat</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-7">
            {LINKS.map((link, index) => (
              <Fragment key={link.label}>
                {link.external && !LINKS[index - 1]?.external && (
                  <span aria-hidden="true" className="-mx-3 hidden text-lg text-black/25 sm:inline dark:text-white/25">
                    |
                  </span>
                )}
                <NavLink {...link} />
              </Fragment>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center py-16">
          <h4 className="selection-contrast font-runde text-[clamp(3rem,12.5vw,10.5rem)] leading-[0.92] font-bold tracking-tight">
            Ich Leibe Katze
          </h4>
        </div>

        <div className={`selection-contrast flex flex-wrap items-center justify-between gap-3 pb-8 text-xs ${MUTED}`}>
          <span className="flex flex-wrap items-center gap-2.5">
            <span>AtCat &copy; {new Date().getFullYear()}</span>
            <span aria-hidden="true" className="text-black/25 dark:text-white/25">
              &middot;
            </span>
          </span>
          <span className="flex flex-wrap items-center gap-2.5">
            ann
          </span>
        </div>
      </div>
    </footer>
  );
}
