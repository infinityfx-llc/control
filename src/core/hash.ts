export default function hash(object: any) {
    let l = 0xdeadbeef,
        r = 0x41c6ce57,
        str = JSON.stringify(object);

    for (let i = 0, char; i < str.length; i++) {
        char = str.charCodeAt(i);

        l = Math.imul(l ^ char, 2654435761);
        r = Math.imul(r ^ char, 1597334677);
    }

    l = Math.imul(l ^ (l >>> 16), 2246822507) ^ Math.imul(r ^ (r >>> 13), 3266489909);
    r = Math.imul(r ^ (r >>> 16), 2246822507) ^ Math.imul(l ^ (l >>> 13), 3266489909);
    l = 4294967296 * (2097151 & r) + (l >>> 0);

    return l.toString(16).slice(-8).padStart(8, '0');
}