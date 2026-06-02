import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/products"],
      disallow: ["/admin", "/api", "/cart", "/checkout", "/login", "/register", "/orders"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
