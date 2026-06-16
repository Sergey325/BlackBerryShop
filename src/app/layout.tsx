import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import ClientOnly from "@/app/components/ClientOnly";
import ToasterProvider from "@/app/Providers/ToasterProvider";
import BackToTop from "@/app/components/BackToTop";
import Container from "@/app/components/Container";


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
            <body className="min-h-full px-2 2xl:px-0 flex flex-col font-(family-name:--font-montserrat) bg-gray-50">
                <ClientOnly>
                    <ToasterProvider/>
                    <Header/>
                    <BackToTop/>
                </ClientOnly>
                <Container>
                    <main className="flex-auto">
                        <div className="mx-auto w-full h-full">
                            {children}
                        </div>
                    </main>
                </Container>

            </body>
        </html>
    );
}