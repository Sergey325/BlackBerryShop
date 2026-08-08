import {useState, useEffect, useMemo, useRef, SetStateAction, Dispatch} from "react";
import axios from "axios";
import useClickOutside from "@/app/hooks/useClickOutside";
import {FiX} from "react-icons/fi";
import {AiOutlineLoading} from "react-icons/ai";
import {City, Warehouse} from "@/app/types";

type Props = {
    selectedCity: City | null;
    setSelectedCity: Dispatch<SetStateAction<City | null>>;
    selectedWarehouse: Warehouse | null;
    setSelectedWarehouse: Dispatch<SetStateAction<Warehouse | null>>;
}

export default function NovaPoshtaSelect({ selectedCity, setSelectedCity, selectedWarehouse, setSelectedWarehouse }: Props) {
    const [cityQuery, setCityQuery] = useState("");
    const [cities, setCities] = useState<City[]>([]);

    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [warehouseQuery, setWarehouseQuery] = useState("");

    const filteredWarehouses = useMemo(() => {
        return warehouses.filter((w) =>
            w.description.toLowerCase().includes(warehouseQuery.toLowerCase())
        );
    }, [warehouses, warehouseQuery]);

    const [isWarehousesOpen, setIsWarehousesOpen] = useState(false);

    const [isCityLoading, setIsCityLoading] = useState(false);
    const [isWarehouseLoading, setIsWarehouseLoading] = useState(false);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useClickOutside({
        ref: wrapperRef,
        onClickOutside: () => setIsWarehousesOpen(false),
    });

    // Поиск городов с debounce
    useEffect(() => {
        if (cityQuery.length < 2) {
            return;
        }

        let isCurrent = true;

        const timeout = setTimeout(async () => {
            try {
                const res = await axios.post("/api/cities", {
                    query: cityQuery,
                });
                if (isCurrent) {
                    setCities(res.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (isCurrent) {
                    setIsCityLoading(false);
                }
            }
        }, 300);

        return () => {
            isCurrent = false;
            clearTimeout(timeout);
        };
    }, [cityQuery]);
    //
    // Загрузка отделений после выбора города
    useEffect(() => {
        if (!selectedCity) {
            return;
        }

        let isCurrent = true;

        axios.post("/api/warehouses", { cityRef: selectedCity.ref })
            .then((res) => {
                if (isCurrent) {
                    setWarehouses(res.data);
                }
            })
            .catch((error: unknown) => {
                console.error(error);
            })
            .finally(() => {
                if (isCurrent) {
                    setIsWarehouseLoading(false);
                }
            });

        return () => {
            isCurrent = false;
        };
    }, [selectedCity]);

    return (
        <div className="flex flex-col text-base gap-4 border border-primary/30 rounded-2xl p-6 bg-white shadow-xs">
            {/* Выбор города */}
            <div>
                <label className="block mb-1 font-medium transition">Виберіть місто*</label>
                <div className="relative transition">
                    <input
                        type="text"
                        value={selectedCity ? selectedCity.name : cityQuery}
                        onChange={(e) => {
                            const value = e.target.value;

                            setCityQuery(value);
                            setSelectedCity(null);
                            setIsCityLoading(value.length >= 2);
                            setIsWarehouseLoading(false);

                            if (value.length < 2) {
                                setCities([]);
                            }
                        }}
                        placeholder="Виберіть місто"
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
                    />
                    {(isCityLoading || cities.length > 0) && !selectedCity && (
                        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
                            {isCityLoading && (
                                <div className="p-4 text-sm text-gray-500 flex gap-2 items-center">
                                    <AiOutlineLoading className="size-4 animate-spin text-primary" />
                                    <p>Пошук...</p>
                                </div>
                            )}
                            {!isCityLoading && cities.map((city) => (
                                <div
                                    key={city.ref}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        // console.log(city)
                                        setSelectedCity(city);
                                        setIsCityLoading(false);
                                        setIsWarehouseLoading(true);
                                        setIsWarehousesOpen(true);
                                        setCities([]);
                                        setWarehouses([]);
                                        setSelectedWarehouse(null);
                                        setWarehouseQuery("");
                                    }}
                                >
                                    {city.name} <span className="text-gray-400 text-sm">{city.area}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Выбор отделения */}
            <div ref={wrapperRef} className="text-base relative">
                <label className="block mb-1 font-medium">
                    Виберіть відділення/поштомат
                </label>

                <input
                    type="text"
                    value={selectedWarehouse ? selectedWarehouse.description : warehouseQuery}
                    onChange={(e) => {
                        setWarehouseQuery(e.target.value);
                        setSelectedWarehouse(null);
                        setIsWarehousesOpen(true);
                    }}
                    onFocus={() => setIsWarehousesOpen(true)}
                    placeholder="Пошук відділення/поштомату..."
                    disabled={!selectedCity}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-10 mb-2 text-sm"
                />

                {/* КРЕСТИК */}
                {selectedWarehouse && (
                    <button
                        onClick={() => {
                            setSelectedWarehouse(null);
                            setWarehouseQuery("");
                            setIsWarehousesOpen(false);
                        }}
                        className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 cursor-pointer"
                        type="button"
                    >
                        <FiX size={25} />
                    </button>
                )}

                {/* СПИСОК */}
                {isWarehousesOpen && !selectedWarehouse && (
                    <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">

                        {isWarehouseLoading && (
                            <div className="p-4 text-sm text-gray-500 flex gap-2 items-center">
                                <AiOutlineLoading className="size-4 animate-spin text-primary"/>
                                <p>Пошук...</p>
                            </div>
                        )}

                        {!isWarehouseLoading && filteredWarehouses.map((w) => (
                            <div
                                key={w.ref}
                                onClick={() => {
                                    // console.log(w)
                                    setSelectedWarehouse(w);
                                    setWarehouseQuery(w.description);
                                    setIsWarehousesOpen(false);
                                }}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                                {w.description}
                            </div>
                        ))}

                        {filteredWarehouses.length === 0 && selectedCity && !isWarehouseLoading && (
                            <div className="px-4 py-2 text-gray-400">
                                Нічого не знайдено
                            </div>
                        )}

                    </div>
                )}
            </div>

        </div>
    );
}
