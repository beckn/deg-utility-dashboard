import createClient from "openapi-react-query";
import { strapiClient } from "./strapi";
import { useEffect, useState } from "react";

export const api = createClient(strapiClient);

export function useMeterDataStream(meterId: string | number | undefined) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (!meterId) return;
        let cancelled = false;
        setLoading(true);
        setError(null);

        async function stream() {
            try {
                const response = await fetch(`https://playground.becknprotocol.io/meter-data-simulator/meter-dataset-streamed/${meterId}`);
                if (!response?.body) throw new Error('Response body is null');
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { value, done } = await reader.read();
                    if (done || cancelled) break;
                    const chunk = decoder.decode(value);
                    const parsed = JSON.parse(chunk);
                    setData(parsed);
                }
            } catch (err) {
                if (!cancelled) setError(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        stream();

        return () => {
            cancelled = true;
        };
    }, []);

    return { data, loading, error };
}