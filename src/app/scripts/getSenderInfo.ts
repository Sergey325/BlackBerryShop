export const API_URL = "https://api.novaposhta.ua/v2.0/json/";

async function getSenderInfo(apiKey: string) {
    // 1. Получаем контрагентов-отправителей (обычно сам владелец аккаунта)
    const counterpartyRes = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            apiKey,
            modelName: "Counterparty",
            calledMethod: "getCounterparties",
            methodProperties: {
                CounterpartyProperty: "Sender",
                Page: "1",
            },
        }),
    });

    const counterpartyData = await counterpartyRes.json();

    if (!counterpartyData.success) {
        console.error("Помилка отримання контрагента:", counterpartyData.errors);
        return;
    }

    console.log("=== КОНТРАГЕНТИ-ВІДПРАВНИКИ ===");
    counterpartyData.data.forEach((c: any) => {
        console.log({
            Ref: c.Ref,
            Description: c.Description,
            FirstName: c.FirstName,
            LastName: c.LastName,
            Phones: c.Phones,
        });
    });

    // Берём первого контрагента (обычно единственный — сам владелец)
    const senderRef = counterpartyData.data[0]?.Ref;

    if (!senderRef) {
        console.error("Контрагент-відправник не знайдений");
        return;
    }

    // 2. Получаем контактных лиц этого контрагента
    const contactRes = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            apiKey,
            modelName: "Counterparty",
            calledMethod: "getCounterpartyContactPersons",
            methodProperties: {
                Ref: senderRef,
                Page: "1",
            },
        }),
    });

    const contactData = await contactRes.json();

    console.log("\n=== КОНТАКТНІ ОСОБИ ===");
    contactData.data.forEach((person: any) => {
        console.log({
            Ref: person.Ref,
            FirstName: person.FirstName,
            LastName: person.LastName,
            Phones: person.Phones,
        });
    });

    // 3. Получаем адреса отправителя (склады/отделения откуда отправляет)
    const addressRes = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            apiKey,
            modelName: "Counterparty",
            calledMethod: "getCounterpartyAddresses",
            methodProperties: {
                Ref: senderRef,
                CounterpartyProperty: "Sender",
            },
        }),
    });

    const addressData = await addressRes.json();

    console.log("\n=== АДРЕСИ ВІДПРАВНИКА ===");
    addressData.data.forEach((addr: any) => {
        console.log({
            Ref: addr.Ref,
            Description: addr.Description,
        });
    });
}

// Запуск
const apiKey = process.argv[2];

if (!apiKey) {
    console.error("Використання: npx tsx scripts/getSenderInfo.ts ТВІЙ_API_KEY");
    process.exit(1);
}

getSenderInfo(apiKey);