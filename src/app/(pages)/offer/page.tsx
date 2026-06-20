import Link from "next/link";
import { MdDownload } from "react-icons/md";

export default function OfferPage() {
    return (
        <div className="max-w-[800px] mx-auto py-16 px-6 flex flex-col gap-8">

            <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">Договір публічної оферти</h1>
                <p className="text-gray-700 leading-relaxed">
                    Цей документ є офіційною пропозицією інтернет-магазину Black Berry укласти
                    договір купівлі-продажу товарів, представлених на сайті. Оформлюючи замовлення,
                    покупець підтверджує, що ознайомлений і погоджується з умовами цього договору.
                </p>
            </div>

            {/* Кнопка скачать */}

            <Link
                href="/docs/oferta.pdf"
                // download
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-md py-3 px-6 hover:bg-gray-50 transition w-fit"
            >
                <MdDownload size={20} />
                Завантажити повний текст договору (.pdf)
            </Link>

    {/* Краткая выжимка */}
    <div className="flex flex-col gap-6">

        <section>
            <h2 className="text-xl font-semibold mb-2">Загальні положення</h2>
            <p className="text-gray-700 leading-relaxed">
                Договір вважається укладеним з моменту натискання кнопки «Підтвердити замовлення»
                та отримання покупцем підтвердження замовлення в електронному вигляді. Умови договору
                однакові для всіх покупців незалежно від їх статусу.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2">Оформлення замовлення</h2>
            <p className="text-gray-700 leading-relaxed">
                Покупець самостійно оформлює замовлення через сайт, вказавши прізвище, ім&apos;я,
                контактний телефон та адресу доставки. Покупець несе відповідальність за
                достовірність наданої інформації.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2">Ціна та оплата</h2>
            <p className="text-gray-700 leading-relaxed">
                Усі ціни вказані на сайті в гривнях. Вартість доставки не включена у вартість товару
                і сплачується окремо відповідно до тарифів обраної служби доставки.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2">Повернення товару</h2>
            <p className="text-gray-700 leading-relaxed">
                Покупець має право повернути товар належної якості протягом 14 днів з моменту
                покупки, якщо товар не використовувався і збережено його товарний вигляд та
                упаковку. Вартість повернення товару сплачується покупцем.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2">Конфіденційність</h2>
            <p className="text-gray-700 leading-relaxed">
                Надаючи персональні дані при оформленні замовлення, покупець погоджується на їх
                обробку відповідно до Закону України «Про захист персональних даних». Продавець
                зобов&apos;язується не розголошувати отриману інформацію третім особам.
            </p>
        </section>

    </div>

    <div className="border-t border-gray-400 pt-6 text-sm text-gray-600">
        <p>Повний текст договору з усіма умовами, правами та обов&apos;язками сторін
            доступний у файлі для завантаження вище.</p>
    </div>

</div>
);
}