import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.gowithporto.pt";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/store-owner",
        "/dashboard",
        "/api",
        "/cart",
        "/checkout",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
