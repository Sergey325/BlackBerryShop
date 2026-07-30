"use client";

import { useCallback, useEffect, useRef } from "react";

export function useModalHistory(isOpen: boolean, onClose: () => void): () => void {
    const pushedRef = useRef(false);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (isOpen && !pushedRef.current) {
            window.history.pushState({ modal: true }, "");
            pushedRef.current = true;
        }
    }, [isOpen]);

    useEffect(() => {
        const handlePopState = () => {
            if (pushedRef.current) {
                pushedRef.current = false;
                onCloseRef.current();

                // Фильтры меняют URL через router.replace, то есть остаются в
                // добавленной при открытии модалки записи. После Back браузер
                // временно переходит на предыдущую запись без них. Возвращаемся
                // вперёд нативно — в ту же запись с фильтрами, без гонки с
                // обработчиком навигации Next.js.
                window.history.forward();
            }
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const close = useCallback(() => {
        pushedRef.current = false;
        onCloseRef.current();
    }, []);

    return close;
}
