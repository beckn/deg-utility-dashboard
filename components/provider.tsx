"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

export function Provider(props: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient} {...props} />
}