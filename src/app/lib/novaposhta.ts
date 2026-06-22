const API_URL = "https://api.novaposhta.ua/v2.0/json/";
const API_KEY = process.env.NOVA_POSHTA_API_KEY!;

async function getOrCreateRecipient({
    firstName,
    lastName,
    phone,
    cityRef,
}: {
    firstName: string;
    lastName: string;
    phone: string;
    cityRef: string;
}) {
    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            apiKey: API_KEY,
            modelName: "Counterparty",
            calledMethod: "save",
            methodProperties: {
                FirstName: firstName,
                LastName: lastName,
                Phone: phone,
                CityRef: cityRef,
                CounterpartyType: "PrivatePerson",
                CounterpartyProperty: "Recipient",
            },
        }),
    });

    const data = await res.json();

    if (!data.success) {
        console.error("Counterparty creation error:", data.errors);
        throw new Error(data.errors?.[0] || "Не вдалося створити отримувача");
    }

    return {
        recipientRef: data.data[0].Ref,
        contactRecipientRef: data.data[0].ContactPerson.data[0].Ref,
    };
}

async function getWarehouseRef(cityRef: string, warehouseNumber: string) {
    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            apiKey: API_KEY,
            modelName: "AddressGeneral",
            calledMethod: "getWarehouses",
            methodProperties: {
                CityRef: cityRef,
                WarehouseId: warehouseNumber,
            },
        }),
    });

    const data = await res.json();
    return data.data[0]?.Ref;
}

export async function createTTN({
    recipientFirstName,
    recipientLastName,
    recipientPhone,
    recipientCityRef,
    recipientWarehouseNumber, // номер отделения
    cost,
    serviceType,
    description,
}: {
    recipientFirstName: string;
    recipientLastName: string;
    recipientPhone: string;
    recipientCityRef: string;
    recipientWarehouseNumber: string;
    cost: number;
    serviceType: string;
    description: string;
}) {
    // Адрес отправителя (получаем один раз, можно закэшировать при желании)
    const senderWarehouseRef = await getWarehouseRef(
        process.env.NOVA_POSHTA_SENDER_CITY_REF!,
        "121" // номер отделения отправки
    );

    // Адрес склада получателя
    const recipientWarehouseRef = await getWarehouseRef(
        recipientCityRef,
        recipientWarehouseNumber
    );

    // Получатель как контрагент
    const { recipientRef, contactRecipientRef } = await getOrCreateRecipient({
        firstName: recipientFirstName,
        lastName: recipientLastName,
        phone: recipientPhone,
        cityRef: recipientCityRef,
    });

    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            apiKey: API_KEY,
            modelName: "InternetDocument",
            calledMethod: "save",
            methodProperties: {
                CitySender: process.env.NOVA_POSHTA_SENDER_CITY_REF,
                Sender: process.env.NOVA_POSHTA_SENDER_REF,
                SenderAddress: senderWarehouseRef,
                ContactSender: process.env.NOVA_POSHTA_CONTACT_SENDER_REF,
                SendersPhone: process.env.NOVA_POSHTA_SENDER_PHONE,

                CityRecipient: recipientCityRef,
                Recipient: recipientRef,
                RecipientAddress: recipientWarehouseRef,
                ContactRecipient: contactRecipientRef,
                RecipientsPhone: recipientPhone,

                PayerType: "Recipient",
                PaymentMethod: "Cash",
                CargoType: "Parcel",
                Weight: 2,
                ServiceType: serviceType,
                SeatsAmount: "1",
                Description: `Одяг: ${description}`,
                Cost: cost,
            },
        }),
    });

    const data = await res.json();

    if (!data.success) {
        console.error("NP TTN creation error:", data.errors);
        throw new Error(data.errors?.[0] || "Не вдалося створити ТТН");
    }

    return {
        ttnNumber: data.data[0].IntDocNumber,
        ttnRef: data.data[0].Ref,
    };
}