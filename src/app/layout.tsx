import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import ClientOnly from "@/app/components/reusable/ClientOnly";
import ToasterProvider from "@/app/Providers/ToasterProvider";
import BackToTop from "@/app/components/reusable/BackToTop";
import Container from "@/app/components/reusable/Container";
import CartModal from "@/app/components/modals/CartModal";
import Footer from "@/app/components/Footer";
import SizesModal from "@/app/components/modals/SizesModal";
import Script from "next/script";


const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://black-berry.shop"),

    title: "BlackBerry — авторські головні убори та аксесуари",
    description: "BlackBerry — український бренд авторських головних уборів та аксесуарів. Панами, кепки та унікальні моделі для дітей і дорослих. Якість, комфорт і оригінальний дизайн.",

    icons: {
        icon: "/favicon.ico",
    },

    openGraph: {
        title: "BlackBerry — авторські головні убори та аксесуари",
        description:
            "BlackBerry — український бренд авторських головних уборів та аксесуарів. Панами, кепки та унікальні моделі для дітей і дорослих. Якість, комфорт і оригінальний дизайн.",
        images: [
            {
                url: "/logo.png",
                width: 1200,
                height: 630,
                alt: "BlackBerry магазин",
            },
        ],
    },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="uk" className={`${montserrat.variable} min-h-screen antialiased`}>
            <body className="min-h-full 2xl:px-0 flex flex-col font-(family-name:--font-montserrat) bg-gray-50">
                <ClientOnly>
                    <ToasterProvider/>
                    <Header/>
                    <BackToTop/>
                    <CartModal/>
                    <SizesModal/>
                </ClientOnly>
                <Container>
                    <main className="flex-auto mb-5">
                        <div className="mx-auto w-full h-full">
                            {children}
                        </div>
                    </main>
                </Container>
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
        
                    fbq('init', '1013434618078956');
                    fbq('track', 'PageView');
                `}
                </Script>
            </body>
        </html>
    );
}