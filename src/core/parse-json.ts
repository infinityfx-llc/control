export default function parseJson(str: string) {
    return JSON.parse(str, (key, value) => {
        if (typeof value === 'string' && /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(value)) return new Date(value);

        return value;
    });
}