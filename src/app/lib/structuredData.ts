import {absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL} from "@/app/lib/seo";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const RETURN_POLICY_ID = `${SITE_URL}/#return-policy`;
export const SHIPPING_SERVICE_ID = `${SITE_URL}/#nova-poshta-shipping`;

export interface OnlineStoreJsonLd {
    "@context": "https://schema.org";
    "@type": "OnlineStore";
    "@id": string;
    name: string;
    alternateName: string;
    description: string;
    url: string;
    logo: string;
    sameAs: string[];
    telephone: string;
    email: string;
    contactPoint: {
        "@type": "ContactPoint";
        contactType: "customer service";
        telephone: string;
        email: string;
        areaServed: "UA";
        availableLanguage: "uk";
    };
    hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy";
        "@id": string;
        applicableCountry: "UA";
        returnPolicyCountry: "UA";
        merchantReturnLink: string;
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow";
        merchantReturnDays: 14;
        itemCondition: "https://schema.org/NewCondition";
        returnMethod: "https://schema.org/ReturnByMail";
        customerRemorseReturnFees: "https://schema.org/ReturnFeesCustomerResponsibility";
        itemDefectReturnFees: "https://schema.org/FreeReturn";
        refundType: ["https://schema.org/FullRefund", "https://schema.org/ExchangeRefund"];
    };
    hasShippingService: {
        "@type": "ShippingService";
        "@id": string;
        name: string;
        description: string;
        fulfillmentType: "https://schema.org/FulfillmentTypeCollectionPoint";
        handlingTime: {
            "@type": "ServicePeriod";
            duration: {
                "@type": "QuantitativeValue";
                minValue: 1;
                maxValue: 4;
                unitCode: "DAY";
            };
        };
        shippingConditions: {
            "@type": "ShippingConditions";
            shippingDestination: {
                "@type": "DefinedRegion";
                addressCountry: "UA";
            };
        };
    };
}

export const ONLINE_STORE_JSON_LD: OnlineStoreJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: "Black Berry",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    sameAs: [
        "https://www.instagram.com/blackberry.shop.ua",
        "https://t.me/blackberryshopua",
    ],
    telephone: "+380682787526",
    email: "blackberry.shop.kh@gmail.com",
    contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: "+380682787526",
        email: "blackberry.shop.kh@gmail.com",
        areaServed: "UA",
        availableLanguage: "uk",
    },
    hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        "@id": RETURN_POLICY_ID,
        applicableCountry: "UA",
        returnPolicyCountry: "UA",
        merchantReturnLink: absoluteUrl("/exchange"),
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        itemCondition: "https://schema.org/NewCondition",
        returnMethod: "https://schema.org/ReturnByMail",
        customerRemorseReturnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
        itemDefectReturnFees: "https://schema.org/FreeReturn",
        refundType: [
            "https://schema.org/FullRefund",
            "https://schema.org/ExchangeRefund",
        ],
    },
    hasShippingService: {
        "@type": "ShippingService",
        "@id": SHIPPING_SERVICE_ID,
        name: "Доставка Новою Поштою",
        description: "Доставка у відділення та поштомати Нової Пошти по всій Україні. Відправлення протягом 1–4 робочих днів; вартість визначається за тарифами перевізника.",
        fulfillmentType: "https://schema.org/FulfillmentTypeCollectionPoint",
        handlingTime: {
            "@type": "ServicePeriod",
            duration: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 4,
                unitCode: "DAY",
            },
        },
        shippingConditions: {
            "@type": "ShippingConditions",
            shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "UA",
            },
        },
    },
};

export interface BreadcrumbItem {
    name: string;
    path: string;
}

interface BreadcrumbListItemJsonLd {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
}

export interface BreadcrumbListJsonLd {
    "@context": "https://schema.org";
    "@type": "BreadcrumbList";
    itemListElement: BreadcrumbListItemJsonLd[];
}

export function createBreadcrumbJsonLd(items: BreadcrumbItem[]): BreadcrumbListJsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item: BreadcrumbItem, index: number) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.path),
        })),
    };
}
