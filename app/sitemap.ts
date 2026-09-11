import type { MetadataRoute } from "next";
import { getCategorySlugs } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...getCategorySlugs().map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
