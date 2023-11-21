import { useEffect, useState } from "react";

export default function useDebounce(value: any, delay = 350) {
    const [cached, setCached] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => setCached(value), delay);

        return () => clearTimeout(timeout);
    }, [value]);

    return cached;
}