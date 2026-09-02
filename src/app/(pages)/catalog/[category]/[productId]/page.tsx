import ProductClient from "@/app/(pages)/catalog/[category]/[productId]/components/ProductClient";
import {getProductById, IProductWithRelated} from "@/app/actions/getProductById";
import type {Metadata} from "next";
import {absoluteUrl, createMetadata, SITE_NAME, SITE_URL} from "@/app/lib/seo";
import {cache} from "react";
import {calculatePriceWithDiscount} from "@/app/utils/getTotalPrice";
import JsonLd from "@/app/components/seo/JsonLd";
import {
    BreadcrumbListJsonLd,
    createBreadcrumbJsonLd,
    ORGANIZATION_ID,
    RETURN_POLICY_ID,
    SHIPPING_SERVICE_ID,
} from "@/app/lib/structuredData";
import {notFound, permanentRedirect} from "next/navigation";
import {extractProductId, getProductPath, getProductRouteSegment} from "@/app/lib/productUrl";
import {getProductDescription} from "@/app/lib/productDescription";
import {isProductSizeAvailable} from "@/app/utils/productColorAvailability";
import {
    buildCatalogItemId,
    buildCatalogMpn,
    buildCatalogVariantUrl,
    CATALOG_BRAND,
} from "@/app/lib/catalogItemId";

type Props = {
    params: Promise<{ category:string, productId: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getCachedProductById = cache(getProductById);

interface ProductOfferJsonLd {
    "@type": "Offer";
    url: string;
    price: number;
    priceCurrency: "UAH";
    availability: "https://schema.org/InStock" | "https://schema.org/OutOfStock";
    itemCondition: "https://schema.org/NewCondition";
    seller: {
        "@type": "OnlineStore";
        "@id": string;
        name: string;
        url: string;
    };
    hasMerchantReturnPolicy: {
        "@id": string;
    };
    shippingDetails: {
        "@type": "OfferShippingDetails";
        hasShippingService: {
            "@id": string;
        };
    };
}

interface ProductCategoryCodeJsonLd {
    "@type": "CategoryCode";
    inCodeSet: "https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt";
    codeValue: string;
}

interface ProductVariantJsonLd {
    "@type": "Product";
    "@id": string;
    name: string;
    description: string;
    sku: string;
    mpn: string;
    url: string;
    image: string[];
    color: string;
    size: string;
    offers: ProductOfferJsonLd;
}

interface ProductGroupJsonLd {
    "@context": "https://schema.org";
    "@type": "ProductGroup";
    "@id": string;
    name: string;
    description: string;
    productGroupID: string;
    url: string;
    image?: string[];
    brand: {
        "@type": "Brand";
        name: string;
    };
    category?: ProductCategoryCodeJsonLd;
    material?: string;
    variesBy: ["https://schema.org/color", "https://schema.org/size"];
    hasVariant: ProductVariantJsonLd[];
}

const GOOGLE_PRODUCT_CATEGORY_BY_SLUG: Record<string, string> = {
    "balaklavy": "173",
    "shapky": "173",
    "balaklavy-na-sholom": "173",
    "sharfy-snudy": "177",
    "rukavychky-mitenky": "170",
    "pov-iazky": "1662",
    "pledy": "1985",
    "panamy": "173",
    "kepky": "173",
    "prykrasy-dlia-shapok-i-balaklav": "167",
    "prykrasy-dlia-panamok-i-kepok": "167",
    "pliushevi-panamky": "173",
};

function getProductCategoryJsonLd(categorySlug: string): ProductCategoryCodeJsonLd | null {
    const googleProductCategoryId: string | undefined = GOOGLE_PRODUCT_CATEGORY_BY_SLUG[categorySlug];

    if (!googleProductCategoryId) {
        return null;
    }

    return {
        "@type": "CategoryCode",
        inCodeSet: "https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt",
        codeValue: googleProductCategoryId,
    };
}

function getFirstSentence(value: string): string {
    const normalizedValue: string = value.replace(/\s+/g, " ").trim();
    const firstSentence: RegExpMatchArray | null = normalizedValue.match(/^.*?[.!?](?=\s|$)/);

    return firstSentence?.[0] ?? normalizedValue;
}

function getProductSeoDescription(product: IProductWithRelated): string {
    return `${product.name}. ${getFirstSentence(getProductDescription(product))}`;
}

function getProductImages(product: IProductWithRelated): string[] {
    const imageUrls: string[] = product.colors
        .flatMap((color) => color.images)
        .sort((firstImage, secondImage) => firstImage.order - secondImage.order)
        .map((image) => image.url);

    return Array.from(new Set(imageUrls));
}

function addSearchParams(path: string, searchParams: Record<string, string | string[] | undefined>): string {
    const query: URLSearchParams = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]: [string, string | string[] | undefined]) => {
        if (Array.isArray(value)) {
            value.forEach((item: string) => query.append(key, item));
        } else if (value !== undefined) {
            query.set(key, value);
        }
    });

    const queryString: string = query.toString();

    return queryString ? `${path}?${queryString}` : path;
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const {productId: productSegment} = await params;
    const productId: string | null = extractProductId(productSegment);
    const product = productId ? await getCachedProductById(productId) : null;

    if (!product || !product.category) {
        notFound();
    }

    const productImages: string[] = getProductImages(product);
    const description: string = getProductSeoDescription(product);
    const productPath: string = getProductPath(product.category.slug, product.id, product.slug);

    return createMetadata({
        title: `Купити ${product.name}`,
        description,
        path: productPath,
        image: productImages[0],
        imageAlt: product.name,
    });
}

const ProductPage = async ({ params, searchParams }: Props) => {
    const { category: categorySlug, productId: productSegment } = await params;
    const resolvedSearchParams: Record<string, string | string[] | undefined> = await searchParams;
    const productId: string | null = extractProductId(productSegment);

    const product = productId ? await getCachedProductById(productId) : null;


    if (!product || !product.category) {
        notFound();
    }

    const productPath: string = getProductPath(product.category.slug, product.id, product.slug);
    const canonicalProductSegment: string = getProductRouteSegment(product.id, product.slug);

    if (categorySlug !== product.category.slug || productSegment !== canonicalProductSegment) {
        permanentRedirect(addSearchParams(productPath, resolvedSearchParams));
    }

    const productUrl: string = absoluteUrl(productPath);
    const productImages: string[] = getProductImages(product);
    const productCategoryJsonLd: ProductCategoryCodeJsonLd | null = getProductCategoryJsonLd(product.category.slug);
    const productDescription: string = getProductDescription(product);
    const productVariantsJsonLd: ProductVariantJsonLd[] = product.colors.flatMap((color): ProductVariantJsonLd[] => {
        const colorImages: string[] = Array.from(new Set(
            [...color.images]
                .sort((firstImage, secondImage): number =>
                    firstImage.order - secondImage.order || firstImage.id - secondImage.id
                )
                .map((image): string => image.url),
        ));

        if (colorImages.length === 0 || !color.colorName.trim()) {
            return [];
        }

        return color.sizes.flatMap((size): ProductVariantJsonLd[] => {
            if (!size.size.trim()) return [];

            const catalogItemId: string = buildCatalogItemId(product.id, color.id, size.id);
            const variantUrl: string = buildCatalogVariantUrl(productUrl, color.id, size.size);

            return [{
                "@type": "Product",
                "@id": `${variantUrl}#product`,
                name: `${product.name} — ${color.colorName}, ${size.size}`,
                description: productDescription,
                sku: catalogItemId,
                mpn: buildCatalogMpn(product.id, color.id, size.id),
                url: variantUrl,
                image: colorImages,
                color: color.colorName,
                size: size.size,
                offers: {
                    "@type": "Offer",
                    url: variantUrl,
                    price: calculatePriceWithDiscount(product.price, product.discount),
                    priceCurrency: "UAH",
                    availability: isProductSizeAvailable(size)
                        ? "https://schema.org/InStock"
                        : "https://schema.org/OutOfStock",
                    itemCondition: "https://schema.org/NewCondition",
                    seller: {
                        "@type": "OnlineStore",
                        "@id": ORGANIZATION_ID,
                        name: SITE_NAME,
                        url: SITE_URL,
                    },
                    hasMerchantReturnPolicy: {
                        "@id": RETURN_POLICY_ID,
                    },
                    shippingDetails: {
                        "@type": "OfferShippingDetails",
                        hasShippingService: {
                            "@id": SHIPPING_SERVICE_ID,
                        },
                    },
                },
            }];
        });
    });
    const productJsonLd: ProductGroupJsonLd = {
        "@context": "https://schema.org",
        "@type": "ProductGroup",
        "@id": `${productUrl}#product-group`,
        name: product.name,
        description: productDescription,
        productGroupID: String(product.id),
        url: productUrl,
        ...(productImages.length > 0 ? {image: productImages} : {}),
        brand: {
            "@type": "Brand",
            name: CATALOG_BRAND,
        },
        ...(productCategoryJsonLd ? {category: productCategoryJsonLd} : {}),
        ...(product.material ? {material: product.material.name} : {}),
        variesBy: ["https://schema.org/color", "https://schema.org/size"],
        hasVariant: productVariantsJsonLd,
    };
    const breadcrumbJsonLd: BreadcrumbListJsonLd = createBreadcrumbJsonLd([
        {name: "Головна", path: "/"},
        {name: "Каталог", path: "/catalog"},
        {name: product.category.name, path: `/catalog/${encodeURIComponent(product.category.slug)}`},
        {name: product.name, path: productPath},
    ]);

    return (
        <>
            <JsonLd data={productJsonLd}/>
            <JsonLd data={breadcrumbJsonLd}/>
            <ProductClient product={product} category={product.category}/>
        </>
    );
};

export default ProductPage;
