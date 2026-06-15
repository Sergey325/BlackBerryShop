import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";


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
        <html lang="uk" className={`${montserrat.variable} h-full antialiased`}>
            <body className="min-h-full px-2 2xl:px-0 flex flex-col font-(family-name:--font-montserrat) bg-gray-50">
                <Header />
                    <main className="flex-1">
                        <div className="max-w-[1366px] mx-auto w-full">
                          {children}
                        </div>
                </main>
            </body>
        </html>
    );
}