import NodeCache from 'node-cache';

// Create a simple cache instance with 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

export const setData = (key: string, value: any) => cache.set(key, value);
export const getData = (key: string) => cache.get(key);
