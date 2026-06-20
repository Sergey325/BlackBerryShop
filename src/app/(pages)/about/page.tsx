
export default function AboutPage() {
    return (
        <div className="max-w-[800px] mx-auto py-16 px-6 flex flex-col gap-10">
            <h1 className="text-3xl sm:text-4xl font-bold">Про нас</h1>

            <p className="lg:text-lg text-gray-700 leading-relaxed">
                Ми створюємо авторські головні убори та аксесуари для тих, хто цінує
                індивідуальність і не хоче бути схожим на інших.
            </p>

            <p className="lg:text-lg text-gray-700 leading-relaxed">
                З 2022 року ми розробляємо унікальні моделі, поєднуючи творчість, якість
                і практичність. Кожен виріб продуманий до дрібниць, багато наших дизайнів
                створені за власними ідеями та не представлені в мас-маркеті.
            </p>

            <p className="lg:text-lg text-gray-700 leading-relaxed">
                Особливу увагу ми приділяємо комфорту та деталям, а також пропонуємо
                можливість персоналізації, щоб втілити саме вашу ідею. Для нас важливо
                не просто створити аксесуар, а подарувати річ, яка викликає емоції,
                підкреслює характер і стає по-справжньому особливою для свого власника.
            </p>

            <p className="lg:text-lg text-gray-700 leading-relaxed">
                Наші вироби обирають діти, підлітки та дорослі, які люблять оригінальні
                речі, а також ті, хто шукає особливий подарунок для близьких.
            </p>

            <div className="border-t border-gray-400 pt-6 mt-2">
                <p className="text-xl font-semibold">
                    Унікальність. Якість. Творчість.
                </p>
                <p className="lg:text-lg text-gray-500 mt-1">
                    Саме на цьому будується наш бренд.
                </p>
            </div>
        </div>
    );
}