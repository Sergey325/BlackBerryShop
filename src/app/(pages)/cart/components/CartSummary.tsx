import Button from "@/app/components/Button";
import toast from "react-hot-toast";

type Props = {
    totalPrice: number
    onCheckout: () => void
};

const CartSummary = ({totalPrice, onCheckout}: Props) => {

    return (
        <div
            className="rounded-lg px-4 py-6 sm:p-6 lg:col-span-5 lg:p-8 w-full xl:w-[30%] bg-white text-gray-800 self-start border"
        >
            <h2 className="text-xl font-medium ">
                Підсумок замовлення
            </h2>

            <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="font-light text-base sm:text-lg text-gray-800 max-w-[60%]">Сума до оплати</span>
                    <span className="font-light text-base sm:text-lg text-gray-700">{totalPrice} грн</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-light text-sm sm:text-base text-gray-800 max-w-[60%]">Вартість доставки та обробки: безкоштовно</span>
                    <span className="font-light text-base sm:text-lg text-gray-700">хуй знает</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-700 pt-4 text-base sm:text-lg">
                    <div className="text-sm sm:text-base font-medium">Загальна сума замовлення</div>
                    <span className="text-xl sm:text-2xl text-gray-700 whitespace-nowrap">{totalPrice} грн</span>

                </div>
            </div>
            <div className="text-sm sm:text-base pt-5">
                <Button label="Сплатити" onClick={() => toast.success("Gonna kill myself, ngl")}/>
            </div>
        </div>
    );
};

export default CartSummary;