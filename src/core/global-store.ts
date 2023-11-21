import { useEffect, useState } from "react";
import hash from "./hash";

export default function createGlobalStore<T extends { [key: string]: any; }>({ initial, persist }: { initial: T; persist?: boolean; }) {
    const mutable = {
        data: Object.assign({}, initial) as T,
        loaded: false
    };
    const id = 'PS-' + hash(initial);

    function store() {
        if (persist) window.localStorage.setItem(id, JSON.stringify(mutable.data));
    }

    function load() {
        const serialized = window.localStorage.getItem(id);

        if (serialized) {
            mutable.data = JSON.parse(serialized);
            mutable.loaded = true;
        }
    }

    function mutate(callback: (data: T) => Promise<void> | void) {
        callback(mutable.data);

        window.dispatchEvent(new CustomEvent('synchronize', { detail: id }));
    }

    return function () {
        const [data, setData] = useState(mutable.data);
        const [loaded, setLoaded] = useState(false);

        function synchronize({ detail }: { detail: string; }) {
            if (detail !== id) return;

            setData(Object.assign({}, mutable.data)); // deep clone?
        }

        useEffect(() => {
            if (!mutable.loaded && persist) load();

            setLoaded(true);
            synchronize({ detail: id });
            window.addEventListener('synchronize', synchronize as any);
            window.addEventListener('beforeunload', store);

            return () => {
                window.removeEventListener('synchronize', synchronize as any);
                window.removeEventListener('beforeunload', store);
                store();
            };
        }, []);

        return {
            data,
            loaded,
            mutate
        };
    }
}