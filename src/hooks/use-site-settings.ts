import { useQuery } from "@tanstack/react-query"
import { SiteSettingsFormValues } from "@/components/admin/site-settings-form"

async function fetchSiteSettings(): Promise<SiteSettingsFormValues> {
    const response = await fetch("/api/site-settings")
    if (!response.ok) {
        throw new Error("Failed to fetch site settings")
    }
    return response.json()
}

export function useSiteSettings() {
    return useQuery<SiteSettingsFormValues>({
        queryKey: ["siteSettings"],
        queryFn: fetchSiteSettings,
        refetchInterval: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
