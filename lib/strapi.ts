import type { paths } from '@/types/openapi';
import createClient from "openapi-fetch";
import { strapi } from "@strapi/client";

export const strapiClient = createClient<paths>({
    baseUrl: process.env.NEXT_PUBLIC_STRAPI_API_URL || "",
    headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_KEY}`
    }
})

export const client = strapi({ baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL + "/api", auth: process.env.NEXT_PUBLIC_STRAPI_API_KEY });

console.log("client", await client.fetch("/energy-resources?populate=meter,ders", {
    method: "GET",
    
}));

// const { data, error } = api.useQuery("get", "/api/energy-resources", {
//     params: {
//       // @ts-ignore
//       query: {
//         "pagination[page]": 1,
//         "pagination[pageSize]": 2,
//         populate: "ders,meter" // or "ders,meter" as a string
//       }
//     },
//     cache: "force-cache"
//   })