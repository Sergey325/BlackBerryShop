import {useRouter, useSearchParams} from "next/navigation";
import {useCallback, useEffect} from "react";
import qs from "query-string";

type Props = {
    key: string;
    value: string
}

const useUrlParam = ({ key, value }: Props ) => {
    const router = useRouter();
    const params = useSearchParams();

    const setParam = useCallback(() => {
        const qs = new URLSearchParams(params);

        qs.set(key, value);

        router.push(`?${qs.toString()}`);
    }, [params, key, value, router]);

    return { setParam };
};

export default useUrlParam;