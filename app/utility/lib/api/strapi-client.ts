import type { StrapiApiRoot } from "../types"

const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337/api"

export const strapiClient = {
  GET: async (
    endpoint: string,
    queryParams?: Record<string, any>,
  ): Promise<{ data: StrapiApiRoot | null; error: any }> => {
    let url = `${STRAPI_BASE_URL}${endpoint}`

    if (queryParams) {
      const params = new URLSearchParams()
      for (const key in queryParams) {
        if (typeof queryParams[key] === "object") {
          if (key === "populate" && typeof queryParams[key] === "string") {
            params.append(key, queryParams[key] as string)
          } else {
            params.append(key, String(queryParams[key]))
          }
        } else {
          params.append(key, String(queryParams[key]))
        }
      }
      if (params.toString()) {
        url += `?${params.toString()}`
      }
    }

    console.log(`Fetching from Strapi: ${url}`)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if needed
        },
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error("Strapi API Error:", response.status, errorBody)
        return {
          data: null,
          error: {
            status: response.status,
            message: `Failed to fetch: ${response.statusText}. Body: ${errorBody}`,
          },
        }
      }

      const responseData = await response.json()

      if (responseData.data && !Array.isArray(responseData.data) && responseData.data.utilities) {
        return { data: responseData.data as StrapiApiRoot, error: null }
      } else if (responseData.utilities) {
        return { data: responseData as StrapiApiRoot, error: null }
      } else {
        console.warn("Unexpected Strapi response structure. Attempting to use as is.", responseData)

        if (responseData.hasOwnProperty("utilities")) {
          return { data: responseData as StrapiApiRoot, error: null }
        }

        if (responseData.data && responseData.data.hasOwnProperty("utilities")) {
          return { data: responseData.data as StrapiApiRoot, error: null }
        }

        console.error("Strapi data does not match expected StrapiApiRoot structure:", responseData)
        return { data: null, error: { message: "Invalid data structure from Strapi API." } }
      }
    } catch (error: any) {
      console.error("Strapi Client Network/Fetch Error:", error)
      return { data: null, error: { message: error.message || "Network error" } }
    }
  },
}
