import {FaInstagram, FaTelegram} from "react-icons/fa";

export default function ExchangePage() {
    return (
        <div className="max-w-[800px] mx-auto py-16 px-6 flex flex-col gap-8">
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">Обмін та повернення</h1>
                <p className="text-gray-700 leading-relaxed">
                    Ми хочемо, щоб кожна покупка приносила тільки приємні враження ❤️<br/>
                    Якщо товар вам не підійшов — ви можете оформити обмін або повернення
                    відповідно до умов нижче.
                </p>
            </div>

            <div className="border border-gray-300 rounded-md p-6">
                <h2 className="text-xl font-semibold mb-4">Умови обміну та повернення</h2>
                <ul className="flex flex-col gap-3 text-gray-700">
                    <li className="relative pl-4">
                        <span className="absolute left-0 top-[45%] -translate-y-1/2 text-3xl leading-none">•</span>
                        Товар можна повернути або обміняти протягом 14 днів з моменту отримання замовлення
                    </li>
                    <li className="relative pl-4">
                        <span className="absolute left-0 top-[45%] -translate-y-1/2 text-3xl leading-none">•</span>
                        Виріб повинен бути новим, без слідів використання
                    </li>
                    <li className="relative pl-4">
                        <span className="absolute left-0 top-[45%] -translate-y-1/2 text-3xl leading-none">•</span>
                        Повернення можливе лише за наявності підтвердження покупки
                    </li>
                    <li className="relative pl-4">
                        <span className="absolute left-0 top-[45%] -translate-y-1/2 text-3xl leading-none">•</span>
                        Витрати на доставку при обміні або поверненні (якщо причина не пов&apos;язана з дефектом товару) оплачує покупець
                    </li>
                </ul>
            </div>

            <div className="border border-red-200 bg-red-50 rounded-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-red-700">Не підлягають поверненню або обміну</h2>
                <ul className="flex flex-col gap-3 text-red-700">
                    <li className="relative pl-4">
                        <span className="absolute left-0 top-[45%] -translate-y-1/2 text-3xl leading-none">•</span>
                        Товари зі слідами носіння
                    </li>
                    <li className="relative pl-4">
                        <span className="absolute left-0 top-[45%] -translate-y-1/2 text-3xl leading-none">•</span>
                        Вироби в пошкодженому стані
                    </li>
                    <li className="relative pl-4">
                        <span className="absolute left-0 top-[45%] -translate-y-1/2 text-3xl leading-none">•</span>
                        Товари, виготовлені або змінені за індивідуальним замовленням
                    </li>
                </ul>
            </div>

            <div className="bg-gray-50 rounded-md p-6 text-center">
                <p className="text-gray-700">
                    Щоб оформити повернення або обмін — зв&apos;яжіться з нами в наших соцмережах.
                </p>
                <div className="flex justify-center gap-4 mt-4 text-base md:text-lg">
                    <a href="https://www.instagram.com/blackberry.shop.ua" target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition">
                        <FaInstagram className="size-6"/>
                        Instagram
                    </a>
                    <a href="https://t.me/blackberryshopua" target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition">
                        <FaTelegram className="size-6"/>
                        Telegram
                    </a>
                </div>
            </div>
        </div>
    );
}