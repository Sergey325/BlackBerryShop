import {getProductDescription} from "@/app/lib/productDescription";
import {getProductPath} from "@/app/lib/productUrl";
import {absoluteUrl, SITE_URL} from "@/app/lib/seo";
import {calculatePriceWithDiscount} from "@/app/utils/getTotalPrice";
import {isProductSizeAvailable} from "@/app/utils/productColorAvailability";
import {
    buildCatalogItemId,
    buildCatalogMpn,
    buildCatalogVariantUrl,
    CATALOG_BRAND,
} from "@/app/lib/catalogItemId";

const MAX_ADDITIONAL_IMAGES = 10;

export interface GoogleMerchantFeedProduct {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    discount: number;
    material: {
        name: string;
    } | null;
    category: {
        name: string;
        slug: string;
        productsDescription: string;
        specifications: Array<{
            id: number;
            name: string;
            value: string;
        }>;
    };
    specificationOverrides: Array<{
        categorySpecificationId: number;
        value: string;
    }>;
    colors: Array<{
        id: number;
        colorName: string;
        images: Array<{
            url: string;
        }>;
        sizes: Array<{
            id: number;
            size: string;
            available: boolean;
            quantity: number | null;
        }>;
    }>;
}

export function escapeXml(value: string): string {
    return value
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/g, "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function decodeHtmlEntities(value: string): string {
    const namedEntities: Record<string, string> = {
        amp: "&",
        apos: "'",
        gt: ">",
        lt: "<",
        nbsp: " ",
        quot: "\"",
    };

    return value.replace(/&(#\d+|#x[\da-f]+|amp|apos|gt|lt|nbsp|quot);/gi, (entity: string, code: string): string => {
        if (code.startsWith("#x") || code.startsWith("#X")) {
            const codePoint: number = Number.parseInt(code.slice(2), 16);
            return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10FFFF
                ? String.fromCodePoint(codePoint)
                : entity;
        }

        if (code.startsWith("#")) {
            const codePoint: number = Number.parseInt(code.slice(1), 10);
            return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10FFFF
                ? String.fromCodePoint(codePoint)
                : entity;
        }

        return namedEntities[code.toLowerCase()] ?? entity;
    });
}

export function stripHtml(value: string): string {
    return decodeHtmlEntities(
        value
            .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
            .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]*>/g, " "),
    ).replace(/\s+/g, " ").trim();
}

function normalizeSpecificationName(value: string): string {
    return value.toLocaleLowerCase("uk-UA").replace(/\s+/g, " ").trim();
}

function getEffectiveSpecification(
    product: GoogleMerchantFeedProduct,
    names: string[],
): string | null {
    const normalizedNames: Set<string> = new Set(names.map(normalizeSpecificationName));
    const overrideBySpecificationId: Map<number, string> = new Map(
        product.specificationOverrides.map((override): [number, string] => [
            override.categorySpecificationId,
            override.value,
        ]),
    );
    const specification = product.category.specifications.find((item): boolean =>
        normalizedNames.has(normalizeSpecificationName(item.name)),
    );

    if (!specification) return null;

    return (overrideBySpecificationId.get(specification.id) ?? specification.value).trim() || null;
}

function getGender(product: GoogleMerchantFeedProduct): "female" | "male" | "unisex" | null {
    const value: string | null = getEffectiveSpecification(product, ["Стать", "Гендер", "Gender"]);

    if (!value) return null;

    const normalizedValue: string = value.toLocaleLowerCase("uk-UA").trim();
    const genderByValue: Record<string, "female" | "male" | "unisex"> = {
        female: "female",
        male: "male",
        unisex: "unisex",
        жіноча: "female",
        жіночий: "female",
        чоловіча: "male",
        чоловічий: "male",
        унісекс: "unisex",
    };

    return genderByValue[normalizedValue] ?? null;
}

function getAgeGroup(product: GoogleMerchantFeedProduct): "adult" | "infant" | "kids" | "newborn" | "toddler" | null {
    const value: string | null = getEffectiveSpecification(product, ["Вік", "Вікова група", "Age group"]);

    if (!value) return null;

    const normalizedValue: string = value.toLocaleLowerCase("uk-UA").trim();
    const ageGroupByValue: Record<string, "adult" | "infant" | "kids" | "newborn" | "toddler"> = {
        adult: "adult",
        adults: "adult",
        infant: "infant",
        kids: "kids",
        newborn: "newborn",
        toddler: "toddler",
        доросла: "adult",
        дорослий: "adult",
        дорослі: "adult",
        дитяча: "kids",
        дитячий: "kids",
        дитячі: "kids",
        немовлята: "infant",
        новонароджені: "newborn",
    };

    if (ageGroupByValue[normalizedValue]) {
        return ageGroupByValue[normalizedValue];
    }

    // Merchant Center accepts only one age group. Its specification says to
    // use "adult" when an item is not exclusively intended for children.
    return normalizedValue.includes("дорос") ? "adult" : null;
}

function getAbsoluteImageUrl(value: string): string | null {
    try {
        const url: URL = new URL(value);

        return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
    } catch {
        return null;
    }
}

function formatPrice(value: number): string {
    return `${value.toFixed(2)} UAH`;
}

function xmlElement(name: string, value: string | number): string {
    return `<${name}>${escapeXml(String(value))}</${name}>`;
}

function buildProductLink(product: GoogleMerchantFeedProduct, colorId: number, size: string): string {
    const productUrl: string = absoluteUrl(getProductPath(product.category.slug, product.id, product.slug));

    return buildCatalogVariantUrl(productUrl, colorId, size);
}

function buildItemXml(
    product: GoogleMerchantFeedProduct,
    color: GoogleMerchantFeedProduct["colors"][number],
    size: GoogleMerchantFeedProduct["colors"][number]["sizes"][number],
): string | null {
    const imageUrls: string[] = Array.from(new Set(
        color.images
            .map((image): string | null => getAbsoluteImageUrl(image.url))
            .filter((url): url is string => url !== null),
    ));
    const mainImageUrl: string | undefined = imageUrls[0];
    const productPrice: number = product.price;
    const salePrice: number = calculatePriceWithDiscount(product.price, product.discount);

    if (
        !mainImageUrl
        || !color.colorName.trim()
        || !size.size.trim()
        || !Number.isFinite(productPrice)
        || productPrice <= 0
    ) {
        return null;
    }

    const description: string = stripHtml(getProductDescription(product));
    const title: string = `${product.name} — ${color.colorName}, ${size.size}`;
    const isAvailable: boolean = isProductSizeAvailable(size);
    const gender: ReturnType<typeof getGender> = getGender(product);
    const ageGroup: ReturnType<typeof getAgeGroup> = getAgeGroup(product);
    const fields: string[] = [
        xmlElement("g:id", buildCatalogItemId(product.id, color.id, size.id)),
        xmlElement("g:item_group_id", product.id),
        xmlElement("g:title", title),
        xmlElement("g:description", description),
        xmlElement("g:link", buildProductLink(product, color.id, size.size)),
        xmlElement("g:image_link", mainImageUrl),
        ...imageUrls.slice(1, MAX_ADDITIONAL_IMAGES + 1).map(
            (url: string): string => xmlElement("g:additional_image_link", url),
        ),
        xmlElement("g:availability", isAvailable ? "in_stock" : "out_of_stock"),
        xmlElement("g:price", formatPrice(productPrice)),
        ...(product.discount > 0 && Number.isFinite(salePrice) && salePrice > 0 && salePrice < productPrice
            ? [xmlElement("g:sale_price", formatPrice(salePrice))]
            : []),
        xmlElement("g:condition", "new"),
        xmlElement("g:brand", CATALOG_BRAND),
        xmlElement("g:color", color.colorName),
        xmlElement("g:size", size.size),
        ...(gender ? [xmlElement("g:gender", gender)] : []),
        ...(ageGroup ? [xmlElement("g:age_group", ageGroup)] : []),
        ...(product.material?.name.trim() ? [xmlElement("g:material", product.material.name.trim())] : []),
        xmlElement("g:product_type", product.category.name),
        xmlElement("g:mpn", buildCatalogMpn(product.id, color.id, size.id)),
    ];

    return `<item>\n${fields.map((field: string): string => `    ${field}`).join("\n")}\n</item>`;
}

export function buildGoogleMerchantFeed(products: GoogleMerchantFeedProduct[]): string {
    const items: string[] = products.flatMap((product: GoogleMerchantFeedProduct): string[] =>
        product.colors.flatMap((color): string[] =>
            color.sizes.flatMap((size): string[] => {
                const itemXml: string | null = buildItemXml(product, color, size);
                return itemXml ? [itemXml] : [];
            }),
        ),
    );
    const channelFields: string[] = [
        xmlElement("title", "Black Berry — Google Merchant Center"),
        xmlElement("link", SITE_URL),
        xmlElement("description", "Товари інтернет-магазину Black Berry"),
    ];

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">',
        "<channel>",
        ...channelFields.map((field: string): string => `    ${field}`),
        ...items.map((item: string): string => item.split("\n").map((line: string): string => `    ${line}`).join("\n")),
        "</channel>",
        "</rss>",
    ].join("\n");
}
