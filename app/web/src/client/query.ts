import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            throwOnError: true
        }
    }
});

export default queryClient;