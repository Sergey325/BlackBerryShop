type CheckoutSectionProps = {
    number: number;
    title: string;
    children: React.ReactNode;
};

const CheckoutSection = ({
     number,
     title,
     children,
}: CheckoutSectionProps) => {
    return (
        <div className="2xl:-ml-13">
            <div className="flex items-center gap-6 mb-3">
                <div className="relative w-7 h-8 [clip-path:polygon(50%_0%,100%_50%,50%_100%,0%_50%)] bg-gray-300">
                    <span className="absolute inset-0 flex items-center justify-center text-base lg:text-lg font-semibold select-none">
                        {number}
                    </span>
                </div>

                <p className="text-xl lg:text-2xl font-medium">
                    {title}
                </p>
            </div>

            <div className="2xl:pl-13">
                {children}
            </div>
        </div>
    );
};

export default CheckoutSection;