import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell py-32">
      <p className="font-mono text-sm text-ash">404</p>
      <h1 className="mt-2 text-[32px] font-semibold text-ink">No such category</h1>
      <Link
        href="/"
        className="mt-8 inline-flex h-9 items-center rounded-md bg-elevated px-4 text-sm font-medium tracking-[0.2px] text-ink hover:bg-card"
      >
        ← All categories
      </Link>
    </main>
  );
}
