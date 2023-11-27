import { useEffect, useState } from "react";

export default function useDebounce<T = any>(value: T, delay = 350) {
    const [cached, setCached] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => setCached(value), delay);

        return () => clearTimeout(timeout);
    }, [value]);

    return cached;
}