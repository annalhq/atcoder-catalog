// sitemap and robots need absolute urls; set NEXT_PUBLIC_SITE_URL to the deployed origin
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
