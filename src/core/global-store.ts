import { useEffect, useState } from "react";
import hash from "./hash";
import parseJson from "./parse-json";

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
            mutable.data = parseJson(serialized);
            mutable.loaded = true;
        }
    }

    function mutate(callback: (data: T) => Promise<any> | any) {
        callback(mutable.data);

        window.dispatchEvent(new CustomEvent('synchronize', { detail: id }));
    }

    return function () {
        const [data, setData] = useState(mutable.data);
        const [loaded, setLoaded] = useState(false);

        function synchronize({ detail }: { detail: string; }) {
            if (detail !== id) return;

            setData(parseJson(JSON.stringify(mutable.data)));
        }

        useEffect(() => {
            if (!mutable.loaded && persist) load();

            synchronize({ detail: id });
            setLoaded(true);
            
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