import {useRouter, useSearchParams} from "next/navigation";
import {useCallback, useEffect} from "react";

type Props = {
    multiplyParameter?: boolean
    urlParameter: string,
    urlValue: string,
    baseUrl: string,
    setIsChecked?: (value: boolean) => void
}

const useUrlParams = ({urlValue, urlParameter, multiplyParameter, setIsChecked, baseUrl}: Props) => {
    const router = useRouter()
    const params = useSearchParams()

    useEffect(() => {
        const paramValues = params?.getAll(urlParameter) || [];
        setIsChecked?.(paramValues.includes(urlValue));
    }, [params, setIsChecked, urlParameter, urlValue]);

    const changeUrl = useCallback(() => {
        const query = new URLSearchParams(params?.toString());
        const existingValues = query.getAll(urlParameter);
        const shouldRemoveValue = existingValues.includes(urlValue);

        query.delete(urlParameter);

        if (multiplyParameter) {
            const updatedValues = shouldRemoveValue
                ? existingValues.filter(value => value !== urlValue)
                : [...existingValues, urlValue];

            updatedValues.forEach(value => {
                if (value) query.append(urlParameter, value);
            });
        } else if (!shouldRemoveValue && urlValue) {
            query.set(urlParameter, urlValue);
        }

        const queryString = query.toString();

        router.replace(
            queryString ? `${baseUrl}?${queryString}` : baseUrl,
            {
                scroll: false,
            }
        );
    }, [params, urlParameter, urlValue, baseUrl, router, multiplyParameter]);

    return {
        changeUrl,
    }
}

export default useUrlParams;
