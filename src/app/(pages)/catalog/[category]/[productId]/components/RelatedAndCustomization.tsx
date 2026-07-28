import CarouselWrapper from "@/app/components/reusable/CarouselWrapper";
import ProductCard from "@/app/(pages)/catalog/[category]/components/ProductCard";
import {IRelatedProduct} from "@/app/actions/getProducts";


type Props = {
    related: IRelatedProduct[];
};

const RelatedAndCustomization = ({related}: Props) => {
    const { relatedProducts, customizationOptions } = related.reduce(
        (acc, product) => {
            if (product.category?.isDecoration) {
                acc.customizationOptions.push(product);
                return acc;
            }

            acc.relatedProducts.push(product);

            return acc;
        },
        {
            relatedProducts: [] as typeof related,
            customizationOptions: [] as typeof related,
        }
    );


    return (
        <div className="flex flex-col w-full gap-10">
            {
                relatedProducts.length > 0 &&
                <section className="w-full relative">
                    <h2 className="text-base md:text-xl font-semibold text-gray-900 mb-3">
                        Часто купують разом
                    </h2>
                    <CarouselWrapper
                        itemClass="px-1.5"
                        responsive={{
                            desktop:  { breakpoint: { max: 3000, min: 1280 }, items: 5 },
                            laptop:   { breakpoint: { max: 1280, min: 1024 }, items: 4 },
                            tablet:   { breakpoint: { max: 1024, min: 640  }, items: 3 },
                            mobile:   { breakpoint: { max: 640,  min: 0    }, items: 2 },
                        }}
                    >
                        {relatedProducts.map((p, i) => (
                            <div key={p.id+i} className="py-1">
                                <ProductCard product={p}/>
                            </div>
                        ))}
                    </CarouselWrapper>
                </section>
            }
            {
                customizationOptions.length > 0 &&
                <section className="w-full relative">
                    <h2 className="text-base md:text-xl font-semibold text-gray-900 mb-3">
                        Варіанти кастомізації
                    </h2>
                    <CarouselWrapper
                        itemClass="px-1.5"
                        responsive={{
                            desktop:  { breakpoint: { max: 3000, min: 1280 }, items: 5 },
                            laptop:   { breakpoint: { max: 1280, min: 1024 }, items: 4 },
                            tablet:   { breakpoint: { max: 1024, min: 640  }, items: 3 },
                            mobile:   { breakpoint: { max: 640,  min: 0    }, items: 2 },
                        }}
                    >
                        {customizationOptions.map((p, i) => (
                            <div key={p.id+i} className="py-1">
                                <ProductCard product={p}/>
                            </div>
                        ))}
                    </CarouselWrapper>
                </section>
            }
        </div>
    );
};

export default RelatedAndCustomization;