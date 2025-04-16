"use client";

import Server from "@/components/server";
import useServerData, { EnhancedServerData } from "@/hooks/use-server-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface GroupedServers {
    [categoryId: number]: {
        name: string;
        servers: EnhancedServerData[];
        categoryOrder: number;
    };
}

export default function ServerList() {
    const siteSettings = useSiteSettings();
    const serverQueries = useServerData();

    const isLoading = serverQueries.some(query => query.isLoading);
    const isError = serverQueries.some(query => query.isError);

    if (siteSettings.isLoading || isLoading) {
        return <ServerSkeleton />;
    }

    if (isError) {
        return <div>Error loading servers. Please try again later.</div>;
    }

    // Group servers by category
    const groupedServers = serverQueries.reduce<GroupedServers>((acc, query) => {
        if (query.data) {
            const { categoryId, categoryName, categoryOrder } = query.data;
            if (!acc[categoryId]) {
                acc[categoryId] = { name: categoryName, servers: [], categoryOrder };
            }
            acc[categoryId].servers.push(query.data);
        }
        return acc;
    }, {});

    // Convert groupedServers object to an array, sort categories, and sort servers within each category
    const sortedCategories = Object.entries(groupedServers)
        .map(([categoryId, category]) => ({
            id: Number(categoryId),
            ...category,
            servers: category.servers.sort((a: EnhancedServerData, b: EnhancedServerData) => a.order - b.order),
        }))
        .sort((a, b) => a.categoryOrder - b.categoryOrder);

    return (
        <div className="space-y-8">
            {sortedCategories.map((category) => (
                <CategorySection
                    key={category.id}
                    categoryName={category.name}
                    servers={category.servers}
                    rustalyzerEnabled={siteSettings.data?.rustalyzerEnabled || false}
                    copyServerAddress={siteSettings.data?.copyServerAddress || false}
                />
            ))}
        </div>
    );
}

interface CategorySectionProps {
    categoryName: string;
    servers: EnhancedServerData[];
    rustalyzerEnabled: boolean;
    copyServerAddress: boolean;
}

function CategorySection({ categoryName, servers, rustalyzerEnabled, copyServerAddress }: CategorySectionProps) {
    return (
        <section>
            <h2 className="text-2xl font-semibold mb-4">{categoryName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servers.map((server) => rustalyzerEnabled ? (
                    // Visit https://www.rustalyzer.com for information on configuring the widget.
                    <rustalyzer-widget
                        server-id={server.server_address || `${server.attributes.ip}:${server.attributes.port}`}
                        key={server.id}
                    />
                ) : (
                    <Server
                        key={server.id}
                        data={server}
                        copyServerAddress={copyServerAddress}
                    />
                ))}
            </div>
        </section>
    );
}

function ServerSkeleton() {
    return (
        <div className="space-y-8">
            {[1, 2].map((category) => (
                <section key={category}>
                    <Skeleton className="h-8 w-48 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((server) => (
                            <Skeleton key={server} className="h-40 w-full" />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}