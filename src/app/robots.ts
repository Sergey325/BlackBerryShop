import type { MetadataRoute } from "next";
import {SITE_URL} from "@/app/lib/seo";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [{
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/successfulPayment",
            ],
        }, {
            userAgent: ["Amazonbot", "Amzn-SearchBot", "Amzn-User"],
            disallow: "/",
        }],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
