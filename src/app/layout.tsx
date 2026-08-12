import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/navbar/Header";
import ToasterProvider from "@/app/Providers/ToasterProvider";
import BackToTop from "@/app/components/reusable/BackToTop";
import Container from "@/app/components/reusable/Container";
import CartModal from "@/app/components/modals/CartModal";
import Footer from "@/app/components/Footer";
import SizesModal from "@/app/components/modals/SizesModal";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import {
    DEFAULT_DESCRIPTION,
    DEFAULT_OG_IMAGE,
    DEFAULT_TITLE,
    SITE_NAME,
    SITE_URL,
} from "@/app/lib/seo";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: DEFAULT_TITLE,
        template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,

    openGraph: {
        type: "website",
        locale: "uk_UA",
        siteName: SITE_NAME,
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        images: [
            {
                url: DEFAULT_OG_IMAGE,
                width: 1200,
                height: 630,
                alt: "Головні убори та аксесуари BlackBerry",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        images: [DEFAULT_OG_IMAGE],
    },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="uk" className={`${montserrat.variable} antialiased`}>
            <body className="2xl:px-0 font-(family-name:--font-montserrat) bg-gray-50 w-full min-h-screen flex flex-col">
                <Header/>
                <ToasterProvider/>
                <BackToTop/>
                <CartModal/>
                <SizesModal/>
                {/*<ClientOnly>*/}
                {/*    */}
                {/*</ClientOnly>*/}
                <Container>
                    <main className="flex-1 mb-15 w-full">
                        <div className="w-full h-full">
                            {children}
                        </div>
                    </main>
                </Container>
                <Analytics/>
                <SpeedInsights/>
                <Footer/>
                <Script id="facebook-pixel" strategy="afterInteractive">
                {`
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}
                    (window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
        
                    fbq('init', '${process.env.PIXEL_ID}');
                    fbq('track', 'PageView');
                `}
                </Script>
            </body>
        </html>
    );
}
