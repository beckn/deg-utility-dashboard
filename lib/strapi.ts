import type { paths } from '@/types/openapi';
import createClient from "openapi-fetch";

export const strapiClient = createClient<paths>({
    baseUrl: process.env.NEXT_PUBLIC_STRAPI_API_URL || "",
    headers: {
        Authorization: `bearer ${process.env.NEXT_PUBLIC_STRAPI_API_KEY}`
    }
})