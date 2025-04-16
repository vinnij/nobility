import { useQuery } from "@tanstack/react-query"
import { StoreSettingsFormValues } from "@/components/admin/store-settings-form"

async function fetchStoreSettings(): Promise<StoreSettingsFormValues> {
    const response = await fetch("/api/admin/store-settings")
    if (!response.ok) {
        throw new Error("Failed to fetch site settings")
    }
    return response.json()
}

export function useStoreSettings() {
    return useQuery<StoreSettingsFormValues>({
        queryKey: ["store-settings"],
        queryFn: fetchStoreSettings,
        refetchInterval: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
