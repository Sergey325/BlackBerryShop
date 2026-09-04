"use client";

import {useEffect} from "react";
import {captureTrafficSource} from "@/app/lib/analytics/trafficSource";

export default function TrafficSourceTracker(): null {
    useEffect((): void => {
        captureTrafficSource();
    }, []);

    return null;
}
