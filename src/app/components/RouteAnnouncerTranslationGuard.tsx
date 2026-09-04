"use client";

import {useEffect} from "react";

const ROUTE_ANNOUNCER_SELECTOR: string = "next-route-announcer";
const ROUTE_ANNOUNCER_ID: string = "__next-route-announcer__";

function preventRouteAnnouncerTranslation(): boolean {
    const announcerHost: HTMLElement | null = document.querySelector<HTMLElement>(ROUTE_ANNOUNCER_SELECTOR);

    if (!announcerHost) return false;

    announcerHost.translate = false;
    announcerHost.classList.add("notranslate");

    const liveRegion: HTMLElement | null = announcerHost.shadowRoot
        ?.querySelector<HTMLElement>(`#${ROUTE_ANNOUNCER_ID}`) ?? null;

    if (liveRegion) {
        liveRegion.translate = false;
        liveRegion.classList.add("notranslate");
    }

    return true;
}

export default function RouteAnnouncerTranslationGuard(): null {
    useEffect((): (() => void) | undefined => {
        if (preventRouteAnnouncerTranslation()) return undefined;

        const observer: MutationObserver = new MutationObserver((): void => {
            if (!preventRouteAnnouncerTranslation()) return;

            observer.disconnect();
        });

        observer.observe(document.body, {childList: true});

        return (): void => observer.disconnect();
    }, []);

    return null;
}
