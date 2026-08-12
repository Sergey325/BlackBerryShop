import Link from "next/link";

export default function NotFound() {
    return (
        <section className="min-h-[65vh] flex flex-col items-center justify-center px-4 py-16 text-center">
            <p className="text-7xl sm:text-8xl font-semibold text-primary/20 select-none" aria-hidden="true">
                404
            </p>
            <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-gray-900">
                Сторінку не знайдено
            </h1>
            <p className="mt-3 max-w-md text-sm sm:text-base leading-relaxed text-gray-500">
                Можливо, сторінку було переміщено або такої адреси не існує.
                Перейдіть до каталогу, щоб знайти потрібний товар.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                    href="/catalog"
                    className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-[#6e3382]"
                >
                    До каталогу
                </Link>
                <Link
                    href="/"
                    className="rounded-lg border border-primary px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-primary/5"
                >
                    На головну
                </Link>
            </div>
        </section>
    );
}
