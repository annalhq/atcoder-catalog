"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * Category pages can carry thousands of rows, so the default viewport
 * prefetch would download every visible category up front. Prefetch on
 * intent (hover, focus, touch) instead.
 */
export function CategoryLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();
  const prefetch = () => router.prefetch(href);
  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      {...props}
    />
  );
}
