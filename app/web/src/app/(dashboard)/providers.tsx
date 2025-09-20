'use client';

import queryClient from "@/client/query";
import { QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
}