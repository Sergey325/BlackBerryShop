import Button from "@/app/components/reusable/Button";

type Props = {
    totalPrice: number
    payment: {
        value: string
        label: string
        shortTitle: string
    }
    contactData?: {
        firstName: string
        lastName: string
        phone: string
        email: string
        comment: string
    }
    address?: {
        city?: string
        area?: string
        warehousesAddress?: string
    }
    onCheckout: () => void
};

const CartSummary = ({totalPrice, payment, address, contactData, onCheckout}: Props) => {

    return (
        <div
            className="rounded-lg px-4 py-6 sm:p-6 lg:col-span-5 lg:p-8  bg-white text-gray-800 self-start border-2 border-gray-200"
        >
            <h2 className="text-xl font-medium ">
                Підсумок замовлення
            </h2>

            <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="font-light text-sm md:text-base text-gray-700">Вартість замовлення</span>
                    <span className="text-sm md:text-base text-gray-800 font-medium text-right">{totalPrice} грн</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-light text-sm sm:text-base text-gray-700">Спосіб оплати</span>
                    <span className="text-sm md:text-base text-gray-800 font-medium text-right">{payment.shortTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-light text-sm sm:text-base text-gray-700 text-right">Замовник</span>
                    <span className="text-sm md:text-base  text-gray-800 font-medium max-w-70 overflow-hidden text-right">{`${contactData?.firstName} ${contactData?.lastName}`}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-light text-sm sm:text-base text-gray-700 ">Адреса доставки</span>
                    <div className="flex flex-col ">
                        <p className="text-sm md:text-base  text-gray-800 font-medium text-right">{address?.city && `${address?.city} ${address?.area} обл.`}</p>
                        <p className="text-sm md:text-base  text-gray-800 font-medium text-right">{address?.warehousesAddress?.match(/^.*?№\d+/)?.[0]}</p>
                    </div>

                </div>
                <div className="flex items-center justify-between border-t border-gray-700 pt-4 text-base sm:text-lg">
                    <div className="text-sm sm:text-base font-medium">Сума до cплати</div>
                    <span className="text-xl sm:text-2xl text-gray-800 whitespace-nowrap">{payment.value === "CASH_ON_DELIVERY" ? 150 : totalPrice} грн</span>
                </div>
            </div>
            <div className="text-sm sm:text-base pt-5">
                <Button label="Сплатити" onClick={() => {
                    onCheckout()
                }}/>
            </div>
        </div>
    );
};

export default CartSummary;