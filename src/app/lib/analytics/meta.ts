declare global {
    interface Window {
        fbq?: (...args: any[]) => void;
    }
}

export const trackMetaEvent = (
    event: string,
    params?: Record<string, unknown>
) => {
    if (
        typeof window !== "undefined" &&
        typeof window.fbq === "function"
    ) {
        window.fbq("track", event, params);
    }
};