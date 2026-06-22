const API_URL = "https://api.novaposhta.ua/v2.0/json/";

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
            apiKey: process.env.NOVA_POSHTA_API_KEY,
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
            apiKey: process.env.NOVA_POSHTA_API_KEY,
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
async function testCreateTTN() {
    // Получаем Ref отправителя (отделения)
    const senderWarehouseRef = await getWarehouseRef(
        process.env.NOVA_POSHTA_SENDER_CITY_REF!,
        "121" // номер вашего отделения отправки
    );

    // Получаем Ref склада получателя
    const recipientWarehouseRef = await getWarehouseRef(
        "8d5a980d-391c-11dd-90d9-001a92567626", // Київ
        "4" // номер отделения получателя
    );

    // Создаём/получаем получателя как контрагента
    const { recipientRef, contactRecipientRef } = await getOrCreateRecipient({
        firstName: "Тест",
        lastName: "Тестенко",
        phone: "380501234567",
        cityRef: "8d5a980d-391c-11dd-90d9-001a92567626",
    });

    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            apiKey: process.env.NOVA_POSHTA_API_KEY,
            modelName: "InternetDocument",
            calledMethod: "save",
            methodProperties: {
                CitySender: process.env.NOVA_POSHTA_SENDER_CITY_REF,
                Sender: process.env.NOVA_POSHTA_SENDER_REF,
                SenderAddress: senderWarehouseRef,
                ContactSender: process.env.NOVA_POSHTA_CONTACT_SENDER_REF,
                SendersPhone: process.env.NOVA_POSHTA_SENDER_PHONE,

                CityRecipient: "8d5a980d-391c-11dd-90d9-001a92567626",
                Recipient: recipientRef,
                RecipientAddress: recipientWarehouseRef,
                ContactRecipient: contactRecipientRef,
                RecipientsPhone: "380501234567",

                PayerType: "Recipient",
                PaymentMethod: "Cash",
                CargoType: "Parcel",
                Weight: 2,
                ServiceType: "WarehouseWarehouse",
                SeatsAmount: "1",
                Description: "Одяг: Тестове замовлення",
                Cost: 585,
            },
        }),
    });

    const data = await res.json();

    console.log("=== RAW RESPONSE ===");
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
        console.log("\n✅ ТТН успішно створено!");
        console.log("Номер ТТН:", data.data[0].IntDocNumber);
        console.log("Ref документа:", data.data[0].Ref);
        console.log("Орієнтовна дата доставки:", data.data[0].EstimatedDeliveryDate);
        console.log("Вартість:", data.data[0].CostOnSite);
    } else {
        console.log("\n❌ Помилка створення ТТН:");
        console.log(data.errors);
    }
}

testCreateTTN();
