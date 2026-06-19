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


const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "BlackBerry Shop",
  description: "",
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
                </ClientOnly>
                <Container>
                    <main className="flex-auto mb-5">
                        <div className="mx-auto w-full h-full">
                            {children}
                        </div>
                    </main>
                </Container>
                <Footer/>
                {/*<div className="h-15 mt-50">*/}
                {/*            GGGGGGGGGGGGG*/}
                {/*</div>*/}
            </body>
        </html>
    );
}