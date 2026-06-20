import {FaTruck, FaCreditCard, FaMobileAlt, FaInstagram, FaTelegram} from "react-icons/fa";

export default function DeliveryPage() {
    return (
        <div className="max-w-[800px] mx-auto py-16 px-6 flex flex-col gap-10">

            <h1 className="text-3xl sm:text-4xl font-bold">Доставка та оплата</h1>

            {/* Доставка */}
            <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <FaTruck size={22} className="text-gray-800" />
                    <h2 className="text-2xl font-semibold">Доставка</h2>
                </div>

                <p className="text-gray-700 leading-relaxed">
                    Доставку товарів ми здійснюємо по всій Україні службою Нова Пошта.
                    Наразі доступні наступні способи отримання:
                </p>

                <div className="flex flex-col gap-3">
                    <div className="border border-gray-400 rounded-md p-4">
                        <p className="font-medium">Доставка у відділення Нової Пошти</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Оберіть зручне відділення під час оформлення замовлення — товар буде
                            відправлено протягом 1-2 робочих днів.
                        </p>
                    </div>

                    <div className="border border-gray-400 rounded-md p-4">
                        <p className="font-medium">Доставка до поштомату</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Зручний варіант для отримання посилки у будь-який зручний час, без черг.
                        </p>
                    </div>

                    <div className="border border-gray-300 rounded-md p-4 opacity-60">
                        <p className="font-medium">Адресна доставка кур&apos;єром</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Незабаром — наразі цей спосіб доставки знаходиться у розробці.
                        </p>
                    </div>
                </div>

                <p className="text-sm text-gray-500">
                    Вартість доставки оплачується окремо відповідно до тарифів Нової Пошти
                    та не входить у вартість товару.
                </p>
                <p className="text-sm text-gray-500 -mt-3">
                    Приблизна вартість доставки в місто <span className="font-medium">90 грн</span>, в село/селище <span className="font-medium">120 грн</span>
                </p>
            </section>

            {/* Оплата */}
            <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <FaCreditCard size={22} className="text-gray-800" />
                    <h2 className="text-2xl font-semibold">Оплата</h2>
                </div>

                <p className="text-gray-700 leading-relaxed">
                    Оплата замовлення здійснюється онлайн через безпечний платіжний сервіс Monopay.
                    Доступні наступні способи оплати карткою:
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2">
                        <FaCreditCard className="size-5"/>
                        Оплата карткою
                    </div>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2">
                        <FaMobileAlt className="size-5"/>
                        Apple Pay / Google Pay
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                    <div className="border border-gray-300 rounded-md p-4">
                        <p className="font-medium">Повна оплата</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Повна оплата замовлення одразу при оформленні. Найшвидший спосіб отримати
                            ваше замовлення в обробку.
                        </p>
                    </div>

                    <div className="border border-gray-300 rounded-md p-4">
                        <p className="font-medium">Накладений платіж</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Часткова попередня оплата у розмірі 150 грн при оформленні замовлення,
                            решту суми ви сплачуєте під час отримання товару на відділенні Нової Пошти.
                        </p>
                    </div>
                </div>
            </section>

            <div className="bg-gray-50 rounded-md p-6 text-center">
                <p className="text-gray-700">
                    Залишились питання щодо доставки чи оплати? Звертайтесь до нас у соцмережах
                    або за номером телефону — ми завжди раді допомогти.
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