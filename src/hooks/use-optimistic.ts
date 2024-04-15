import { useEffect, useState } from "react";

export default function useOptimistic<T extends any>(state: T) {
    const [optimistic, setOptimistic] = useState(state);

    useEffect(() => setOptimistic(state), [state]);

    const mutate = (callback: (state: T) => T) => setOptimistic(callback(optimistic));

    return [optimistic, mutate];
}