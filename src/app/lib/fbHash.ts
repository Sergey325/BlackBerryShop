import crypto from 'crypto';

export function hashSha256(value: string | null | undefined): string | undefined {
    if (!value) return undefined;

    const normalized = value.trim().toLowerCase();

    return crypto
        .createHash('sha256')
        .update(normalized)
        .digest('hex');
}