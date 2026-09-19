import "server-only";

import {createPublicKey, verify, type KeyObject} from "node:crypto";

const KEY_TTL_MS = 24 * 60 * 60 * 1000;
const KEY_REFRESH_COOLDOWN_MS = 60 * 1000;

type CachedKey = {key: KeyObject; fetchedAt: number};

let cachedKey: CachedKey | undefined;
let pendingKey: Promise<CachedKey> | undefined;

async function fetchPublicKey(): Promise<CachedKey> {
    const token: string | undefined = process.env.MONOBANK_TOKEN;
    if (!token) throw new Error("MONOBANK_TOKEN is not configured");

    const response: Response = await fetch("https://api.monobank.ua/api/merchant/pubkey", {
        headers: {"X-Token": token},
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
        throw new Error(`Monobank public key request failed (${response.status})`);
    }

    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || !("key" in body) || typeof body.key !== "string") {
        throw new Error("Invalid Monobank public key response");
    }

    const key: KeyObject = createPublicKey(Buffer.from(body.key, "base64"));
    if (key.asymmetricKeyType !== "ec") throw new Error("Invalid Monobank public key type");

    return {key, fetchedAt: Date.now()};
}

async function getPublicKey(forceRefresh = false): Promise<CachedKey> {
    if (!forceRefresh && cachedKey && Date.now() - cachedKey.fetchedAt < KEY_TTL_MS) {
        return cachedKey;
    }

    // Share a single request between concurrent webhook deliveries.
    pendingKey ??= fetchPublicKey();
    try {
        cachedKey = await pendingKey;
        return cachedKey;
    } finally {
        pendingKey = undefined;
    }
}

function matchesSignature(body: Buffer, signature: Buffer, key: KeyObject): boolean {
    try {
        return verify("sha256", body, key, signature);
    } catch {
        return false;
    }
}

export async function verifyMonobankWebhook(body: Buffer, signatureHeader: string | null): Promise<boolean> {
    // Reject malformed headers before requesting a key from the bank.
    if (!signatureHeader || signatureHeader.length > 256
        || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(signatureHeader)) {
        return false;
    }

    const signature: Buffer = Buffer.from(signatureHeader, "base64");
    if (signature.length === 0) return false;

    const current: CachedKey = await getPublicKey();
    if (matchesSignature(body, signature, current.key)) return true;

    // Allow bank key rotation, without fetching a key on every forged request.
    if (Date.now() - current.fetchedAt < KEY_REFRESH_COOLDOWN_MS) return false;

    const refreshed: CachedKey = await getPublicKey(true);
    return matchesSignature(body, signature, refreshed.key);
}
